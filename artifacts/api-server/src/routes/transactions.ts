import { Router } from "express";
import { db, transactionsTable, categoriesTable, cardsTable, walletsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { authMiddleware, getUser } from "../lib/auth";
import { CreateTransactionBody, UpdateTransactionBody, GetTransactionsQueryParams } from "@workspace/api-zod";
import { broadcastChange } from "../lib/realtime";

const router = Router();

function isFutureDate(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const txDate = new Date(dateStr + "T00:00:00");
  return txDate > today;
}

function nextRecurringDate(dateStr: string, period: string): string {
  const d = new Date(dateStr + "T00:00:00");
  if (period === "weekly")  d.setDate(d.getDate() + 7);
  else if (period === "monthly") d.setMonth(d.getMonth() + 1);
  else if (period === "yearly")  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
}

async function serializeTransaction(tx: any, cat: any, walletMap: Map<number, any> = new Map()) {
  const wallet = tx.walletId ? walletMap.get(tx.walletId) : null;
  return {
    id: tx.id,
    userId: tx.userId,
    type: tx.type,
    amount: parseFloat(tx.amount),
    description: tx.description,
    date: tx.date,
    time: tx.time ?? null,
    categoryId: tx.categoryId,
    categoryName: cat?.name ?? "Outros",
    categoryColor: cat?.color ?? "#666666",
    categoryIcon: cat?.icon ?? "📦",
    isRecurring: tx.isRecurring,
    recurringPeriod: tx.recurringPeriod ?? null,
    installments: tx.installments ?? null,
    installmentNumber: tx.installmentNumber ?? null,
    cardId: tx.cardId ?? null,
    walletId: tx.walletId ?? null,
    walletName: wallet?.name ?? null,
    walletColor: wallet?.color ?? null,
    notes: tx.notes ?? null,
    status: tx.status ?? "completed",
    createdAt: tx.createdAt.toISOString(),
  };
}

async function recalculateCardBalance(cardId: number, userId: number) {
  const [{ total }] = await db
    .select({ total: sql<string>`COALESCE(SUM(${transactionsTable.amount}), 0)` })
    .from(transactionsTable)
    .where(and(
      eq(transactionsTable.cardId, cardId),
      eq(transactionsTable.userId, userId),
      eq(transactionsTable.type, "expense"),
      eq(transactionsTable.status, "completed"),
    ));
  await db.update(cardsTable)
    .set({ currentBalance: String(parseFloat(total)) })
    .where(and(eq(cardsTable.id, cardId), eq(cardsTable.userId, userId)));
}

router.get("/transactions", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const params = GetTransactionsQueryParams.safeParse(req.query);

  const conditions = [eq(transactionsTable.userId, user.id)];

  if (params.success) {
    if (params.data.type) {
      conditions.push(eq(transactionsTable.type, params.data.type));
    }
    if (params.data.categoryId) {
      conditions.push(eq(transactionsTable.categoryId, Number(params.data.categoryId)));
    }
    if (params.data.month && params.data.year) {
      conditions.push(
        sql`EXTRACT(MONTH FROM ${transactionsTable.date}) = ${params.data.month} AND EXTRACT(YEAR FROM ${transactionsTable.date}) = ${params.data.year}`
      );
    }
    if ((params.data as any).status) {
      conditions.push(eq(transactionsTable.status, (params.data as any).status));
    }
  }

  const txs = await db.select().from(transactionsTable)
    .where(and(...conditions))
    .orderBy(desc(transactionsTable.date), desc(transactionsTable.createdAt))
    .limit(params.success && params.data.limit ? Number(params.data.limit) : 200)
    .offset(params.success && params.data.offset ? Number(params.data.offset) : 0);

  const [cats, wallets] = await Promise.all([
    db.select().from(categoriesTable),
    db.select().from(walletsTable).where(eq(walletsTable.userId, user.id)),
  ]);
  const catMap    = new Map(cats.map(c => [c.id, c]));
  const walletMap = new Map(wallets.map(w => [w.id, w]));

  const result = await Promise.all(txs.map(tx => serializeTransaction(tx, catMap.get(tx.categoryId), walletMap)));
  res.json(result);
});

router.post("/transactions", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  if (!parsed.data.walletId) {
    res.status(400).json({ error: "Selecione uma carteira para continuar." });
    return;
  }

  const autoStatus = isFutureDate(parsed.data.date) ? "pending" : "completed";

  const [tx] = await db.insert(transactionsTable).values({
    userId: user.id,
    type: parsed.data.type,
    amount: String(parsed.data.amount),
    description: parsed.data.description,
    date: parsed.data.date,
    time: parsed.data.time ?? null,
    categoryId: parsed.data.categoryId,
    isRecurring: parsed.data.isRecurring ?? false,
    recurringPeriod: parsed.data.recurringPeriod ?? null,
    installments: parsed.data.installments ?? null,
    cardId: parsed.data.cardId ?? null,
    walletId: parsed.data.walletId ?? null,
    notes: parsed.data.notes ?? null,
    status: autoStatus,
  }).returning();

  // Only update card balance for completed transactions
  if (tx.cardId && parsed.data.type === "expense" && autoStatus === "completed") {
    await recalculateCardBalance(tx.cardId, user.id);
  }

  const [cats, wallets] = await Promise.all([
    db.select().from(categoriesTable).where(eq(categoriesTable.id, tx.categoryId)).limit(1),
    tx.walletId ? db.select().from(walletsTable).where(eq(walletsTable.id, tx.walletId)).limit(1) : Promise.resolve([]),
  ]);
  const walletMap = new Map((wallets as any[]).map(w => [w.id, w]));
  res.status(201).json(await serializeTransaction(tx, cats[0], walletMap));
  broadcastChange(user.supabaseId, "transaction").catch(() => {});
});

router.get("/transactions/:id", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const id = parseInt(req.params["id"] as string);
  const txs = await db.select().from(transactionsTable)
    .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, user.id)))
    .limit(1);
  if (!txs.length) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }
  const tx = txs[0];
  const [cats, wallets] = await Promise.all([
    db.select().from(categoriesTable).where(eq(categoriesTable.id, tx.categoryId)).limit(1),
    tx.walletId ? db.select().from(walletsTable).where(eq(walletsTable.id, tx.walletId)).limit(1) : Promise.resolve([]),
  ]);
  const walletMap = new Map((wallets as any[]).map(w => [w.id, w]));
  res.json(await serializeTransaction(tx, cats[0], walletMap));
});

router.patch("/transactions/:id/pay", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const id = parseInt(req.params["id"] as string);
  const existing = await db.select().from(transactionsTable)
    .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, user.id))).limit(1);
  if (!existing.length) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const [tx] = await db.update(transactionsTable)
    .set({ status: "completed", date: today })
    .where(eq(transactionsTable.id, id))
    .returning();

  if (tx.cardId && tx.type === "expense") {
    await recalculateCardBalance(tx.cardId, user.id);
  }

  // Auto-create next pending occurrence for recurring transactions
  if (tx.isRecurring && tx.recurringPeriod) {
    const nextDate = nextRecurringDate(tx.date, tx.recurringPeriod);
    await db.insert(transactionsTable).values({
      userId: tx.userId,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      date: nextDate,
      categoryId: tx.categoryId,
      isRecurring: true,
      recurringPeriod: tx.recurringPeriod,
      walletId: tx.walletId,
      notes: tx.notes,
      status: "pending",
    });
  }

  const [cats, wallets] = await Promise.all([
    db.select().from(categoriesTable).where(eq(categoriesTable.id, tx.categoryId)).limit(1),
    tx.walletId ? db.select().from(walletsTable).where(eq(walletsTable.id, tx.walletId)).limit(1) : Promise.resolve([]),
  ]);
  const walletMap = new Map((wallets as any[]).map(w => [w.id, w]));
  res.json(await serializeTransaction(tx, cats[0], walletMap));
  broadcastChange(user.supabaseId, "transaction").catch(() => {});
});

router.patch("/transactions/:id", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const id = parseInt(req.params["id"] as string);
  const existing = await db.select().from(transactionsTable)
    .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, user.id))).limit(1);
  if (!existing.length) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }
  const parsed = UpdateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const updates: any = {};
  const d = parsed.data;
  if (d.type !== undefined && d.type !== null) updates.type = d.type;
  if (d.amount !== undefined && d.amount !== null) updates.amount = String(d.amount);
  if (d.description !== undefined) updates.description = d.description || null;
  if (d.date !== undefined && d.date !== null) {
    updates.date = d.date;
    // Recalculate status based on new date (unless status explicitly provided)
    if ((d as any).status === undefined || (d as any).status === null) {
      updates.status = isFutureDate(d.date) ? "pending" : "completed";
    }
  }
  if (d.time !== undefined) updates.time = d.time;
  if (d.categoryId !== undefined && d.categoryId !== null) updates.categoryId = d.categoryId;
  if (d.isRecurring !== undefined) updates.isRecurring = d.isRecurring;
  if (d.recurringPeriod !== undefined) updates.recurringPeriod = d.recurringPeriod;
  if (d.installments !== undefined) updates.installments = d.installments;
  if (d.cardId !== undefined) updates.cardId = d.cardId;
  if ((d as any).walletId !== undefined) updates.walletId = (d as any).walletId;
  if (d.notes !== undefined) updates.notes = d.notes;
  if ((d as any).status !== undefined && (d as any).status !== null) updates.status = (d as any).status;

  const [tx] = await db.update(transactionsTable).set(updates).where(eq(transactionsTable.id, id)).returning();

  // Only recalculate card balance if completed
  if (tx.status === "completed") {
    const affectedCards = new Set<number>();
    if (existing[0].cardId) affectedCards.add(existing[0].cardId);
    if (tx.cardId) affectedCards.add(tx.cardId);
    for (const cid of affectedCards) {
      await recalculateCardBalance(cid, user.id);
    }
  }

  const [cats, wallets] = await Promise.all([
    db.select().from(categoriesTable).where(eq(categoriesTable.id, tx.categoryId)).limit(1),
    tx.walletId ? db.select().from(walletsTable).where(eq(walletsTable.id, tx.walletId)).limit(1) : Promise.resolve([]),
  ]);
  const walletMap = new Map((wallets as any[]).map(w => [w.id, w]));
  res.json(await serializeTransaction(tx, cats[0], walletMap));
  broadcastChange(user.supabaseId, "transaction").catch(() => {});
});

router.delete("/transactions/:id", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const id = parseInt(req.params["id"] as string);
  const existing = await db.select().from(transactionsTable)
    .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, user.id))).limit(1);
  if (!existing.length) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }
  const oldCardId = existing[0].cardId;
  const wasCompleted = existing[0].status === "completed";
  await db.delete(transactionsTable).where(eq(transactionsTable.id, id));

  if (oldCardId && wasCompleted) {
    await recalculateCardBalance(oldCardId, user.id);
  }

  res.json({ success: true, message: "Deleted" });
  broadcastChange(user.supabaseId, "transaction").catch(() => {});
});

export default router;

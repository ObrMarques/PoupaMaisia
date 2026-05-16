import { Router } from "express";
import { db, transactionsTable, categoriesTable, cardsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { authMiddleware, getUser } from "../lib/auth";
import { CreateTransactionBody, UpdateTransactionBody, GetTransactionsQueryParams } from "@workspace/api-zod";

const router = Router();

async function serializeTransaction(tx: any, cat: any) {
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
    notes: tx.notes ?? null,
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
  }

  const txs = await db.select().from(transactionsTable)
    .where(and(...conditions))
    .orderBy(desc(transactionsTable.date), desc(transactionsTable.createdAt))
    .limit(params.success && params.data.limit ? Number(params.data.limit) : 100)
    .offset(params.success && params.data.offset ? Number(params.data.offset) : 0);

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c]));

  const result = await Promise.all(txs.map(tx => serializeTransaction(tx, catMap.get(tx.categoryId))));
  res.json(result);
});

router.post("/transactions", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
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
    notes: parsed.data.notes ?? null,
  }).returning();

  if (tx.cardId && parsed.data.type === "expense") {
    await recalculateCardBalance(tx.cardId, user.id);
  }

  const cats = await db.select().from(categoriesTable).where(eq(categoriesTable.id, tx.categoryId)).limit(1);
  res.status(201).json(await serializeTransaction(tx, cats[0]));
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
  const cats = await db.select().from(categoriesTable).where(eq(categoriesTable.id, txs[0].categoryId)).limit(1);
  res.json(await serializeTransaction(txs[0], cats[0]));
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
  if (d.date !== undefined && d.date !== null) updates.date = d.date;
  if (d.time !== undefined) updates.time = d.time;
  if (d.categoryId !== undefined && d.categoryId !== null) updates.categoryId = d.categoryId;
  if (d.isRecurring !== undefined) updates.isRecurring = d.isRecurring;
  if (d.recurringPeriod !== undefined) updates.recurringPeriod = d.recurringPeriod;
  if (d.installments !== undefined) updates.installments = d.installments;
  if (d.cardId !== undefined) updates.cardId = d.cardId;
  if (d.notes !== undefined) updates.notes = d.notes;

  const [tx] = await db.update(transactionsTable).set(updates).where(eq(transactionsTable.id, id)).returning();

  const affectedCards = new Set<number>();
  if (existing[0].cardId) affectedCards.add(existing[0].cardId);
  if (tx.cardId) affectedCards.add(tx.cardId);
  for (const cid of affectedCards) {
    await recalculateCardBalance(cid, user.id);
  }

  const cats = await db.select().from(categoriesTable).where(eq(categoriesTable.id, tx.categoryId)).limit(1);
  res.json(await serializeTransaction(tx, cats[0]));
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
  await db.delete(transactionsTable).where(eq(transactionsTable.id, id));

  if (oldCardId) {
    await recalculateCardBalance(oldCardId, user.id);
  }

  res.json({ success: true, message: "Deleted" });
});

export default router;

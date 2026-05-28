import { Router } from "express";
import { db, walletsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { authMiddleware, getUser } from "../lib/auth";
import { CreateWalletBody, UpdateWalletBody } from "@workspace/api-zod";

const router = Router();

function serializeWallet(w: any) {
  const initialBalance = parseFloat(w.initial_balance ?? w.initialBalance ?? "0");
  const txBalance = parseFloat(w.balance ?? "0");
  return {
    id: w.id,
    userId: w.user_id ?? w.userId,
    name: w.name,
    color: w.color,
    icon: w.icon,
    initialBalance,
    balance: initialBalance + txBalance,
    pluggyAccountId: w.pluggy_account_id ?? w.pluggyAccountId ?? null,
    pluggyItemId: w.pluggy_item_id ?? w.pluggyItemId ?? null,
    createdAt: w.created_at ? new Date(w.created_at).toISOString() : w.createdAt,
  };
}

router.get("/wallets", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const result = await db.execute(sql`
    SELECT w.id, w.user_id, w.name, w.color, w.icon, w.initial_balance, w.created_at,
      COALESCE(SUM(CASE WHEN t.type = 'income'  THEN ABS(t.amount::numeric) ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN ABS(t.amount::numeric) ELSE 0 END), 0) AS balance
    FROM wallets w
    LEFT JOIN transactions t ON t.wallet_id = w.id AND (t.status IS NULL OR t.status = 'completed')
    WHERE w.user_id = ${user.id}
    GROUP BY w.id, w.user_id, w.name, w.color, w.icon, w.initial_balance, w.created_at
    ORDER BY w.id ASC
  `);
  res.json((result.rows as any[]).map(serializeWallet));
});

router.post("/wallets", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const parsed = CreateWalletBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [wallet] = await db.insert(walletsTable).values({
    userId: user.id,
    name: parsed.data.name,
    color: parsed.data.color ?? "#1A1A1A",
    icon: parsed.data.icon ?? "💼",
    initialBalance: String(parsed.data.initialBalance ?? 0),
  }).returning();

  res.status(201).json(serializeWallet({ ...wallet, balance: "0" }));
});

router.patch("/wallets/:id", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const id = parseInt(req.params["id"] as string);
  const existing = await db.select().from(walletsTable)
    .where(and(eq(walletsTable.id, id), eq(walletsTable.userId, user.id))).limit(1);
  if (!existing.length) {
    res.status(404).json({ error: "Wallet not found" });
    return;
  }
  const parsed = UpdateWalletBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const updates: any = {};
  const d = parsed.data;
  if (d.name !== undefined && d.name !== null) updates.name = d.name;
  if (d.color !== undefined && d.color !== null) updates.color = d.color;
  if (d.icon !== undefined && d.icon !== null) updates.icon = d.icon;
  if (d.initialBalance !== undefined && d.initialBalance !== null) updates.initialBalance = String(d.initialBalance);

  const [wallet] = await db.update(walletsTable).set(updates)
    .where(and(eq(walletsTable.id, id), eq(walletsTable.userId, user.id))).returning();

  const balResult = await db.execute(sql`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income'  THEN ABS(amount::numeric) ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN type = 'expense' THEN ABS(amount::numeric) ELSE 0 END), 0) AS balance
    FROM transactions WHERE wallet_id = ${id} AND (status IS NULL OR status = 'completed')
  `);
  const txBalance = (balResult.rows[0] as any)?.balance ?? "0";
  res.json(serializeWallet({ ...wallet, balance: txBalance }));
});

router.delete("/wallets/:id", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const id = parseInt(req.params["id"] as string);
  const existing = await db.select().from(walletsTable)
    .where(and(eq(walletsTable.id, id), eq(walletsTable.userId, user.id))).limit(1);
  if (!existing.length) {
    res.status(404).json({ error: "Wallet not found" });
    return;
  }
  await db.execute(sql`UPDATE transactions SET wallet_id = NULL WHERE wallet_id = ${id}`);
  await db.delete(walletsTable).where(and(eq(walletsTable.id, id), eq(walletsTable.userId, user.id)));
  res.json({ success: true, message: "Deleted" });
});

export default router;

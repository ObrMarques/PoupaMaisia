import { Router } from "express";
import { db, transactionsTable, categoriesTable } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { authMiddleware, getUser } from "../lib/auth";

const router = Router();

router.get("/dashboard/summary", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const now = new Date();
  const month = req.query.month ? parseInt(req.query.month as string) : now.getMonth() + 1;
  const year = req.query.year ? parseInt(req.query.year as string) : now.getFullYear();

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const txs = await db.select().from(transactionsTable)
    .where(and(
      eq(transactionsTable.userId, user.id),
      sql`EXTRACT(MONTH FROM ${transactionsTable.date}) = ${month} AND EXTRACT(YEAR FROM ${transactionsTable.date}) = ${year}`
    ));

  const prevTxs = await db.select().from(transactionsTable)
    .where(and(
      eq(transactionsTable.userId, user.id),
      sql`EXTRACT(MONTH FROM ${transactionsTable.date}) = ${prevMonth} AND EXTRACT(YEAR FROM ${transactionsTable.date}) = ${prevYear}`
    ));

  const allTxs = await db.select().from(transactionsTable).where(eq(transactionsTable.userId, user.id));

  const monthlyIncome = txs.filter(t => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0);
  const monthlyExpenses = txs.filter(t => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalIncome = allTxs.filter(t => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalExpenses = allTxs.filter(t => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);
  const prevIncome = prevTxs.filter(t => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0);
  const prevExpenses = prevTxs.filter(t => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);

  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  res.json({
    totalBalance: totalIncome - totalExpenses,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    savingsRate: Math.round(savingsRate * 100) / 100,
    transactionCount: txs.length,
    previousMonthExpenses: prevExpenses,
    previousMonthIncome: prevIncome,
  });
});

router.get("/dashboard/spending-by-category", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const now = new Date();
  const month = req.query.month ? parseInt(req.query.month as string) : now.getMonth() + 1;
  const year = req.query.year ? parseInt(req.query.year as string) : now.getFullYear();

  const txs = await db.select().from(transactionsTable)
    .where(and(
      eq(transactionsTable.userId, user.id),
      eq(transactionsTable.type, "expense"),
      sql`EXTRACT(MONTH FROM ${transactionsTable.date}) = ${month} AND EXTRACT(YEAR FROM ${transactionsTable.date}) = ${year}`
    ));

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c]));

  const totals = new Map<number, { amount: number; count: number }>();
  let totalAmount = 0;

  for (const tx of txs) {
    const amt = parseFloat(tx.amount);
    totalAmount += amt;
    const existing = totals.get(tx.categoryId) ?? { amount: 0, count: 0 };
    totals.set(tx.categoryId, { amount: existing.amount + amt, count: existing.count + 1 });
  }

  const result = Array.from(totals.entries()).map(([catId, data]) => {
    const cat = catMap.get(catId);
    return {
      categoryId: catId,
      categoryName: cat?.name ?? "Outros",
      categoryColor: cat?.color ?? "#666666",
      categoryIcon: cat?.icon ?? "📦",
      amount: data.amount,
      percentage: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 10000) / 100 : 0,
      transactionCount: data.count,
    };
  }).sort((a, b) => b.amount - a.amount);

  res.json(result);
});

router.get("/dashboard/monthly-trend", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
  }

  const result = await Promise.all(months.map(async ({ month, year }) => {
    const txs = await db.select().from(transactionsTable)
      .where(and(
        eq(transactionsTable.userId, user.id),
        sql`EXTRACT(MONTH FROM ${transactionsTable.date}) = ${month} AND EXTRACT(YEAR FROM ${transactionsTable.date}) = ${year}`
      ));
    const income = txs.filter(t => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0);
    const expenses = txs.filter(t => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);
    return { month, year, income, expenses, savings: income - expenses };
  }));

  res.json(result);
});

router.get("/dashboard/recent-transactions", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const txs = await db.select().from(transactionsTable)
    .where(eq(transactionsTable.userId, user.id))
    .orderBy(desc(transactionsTable.date), desc(transactionsTable.createdAt))
    .limit(10);

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c]));

  const result = txs.map(tx => {
    const cat = catMap.get(tx.categoryId);
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
  });

  res.json(result);
});

export default router;

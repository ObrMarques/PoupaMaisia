import { Router } from "express";
import { db, transactionsTable, categoriesTable } from "@workspace/db";
import { eq, and, sql, desc, gte } from "drizzle-orm";
import { authMiddleware, getUser } from "../lib/auth";

const router = Router();

const CACHE_SHORT = "public, max-age=30, stale-while-revalidate=60";
const CACHE_MEDIUM = "public, max-age=120, stale-while-revalidate=300";

router.get("/dashboard/summary", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const now = new Date();
  const month = req.query.month ? parseInt(req.query.month as string) : now.getMonth() + 1;
  const year = req.query.year ? parseInt(req.query.year as string) : now.getFullYear();
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const [aggregated] = await db.execute(sql`
    SELECT
      SUM(CASE WHEN type = 'income' THEN amount::numeric ELSE 0 END) AS total_income,
      SUM(CASE WHEN type = 'expense' THEN amount::numeric ELSE 0 END) AS total_expenses,
      SUM(CASE WHEN type = 'income' AND EXTRACT(MONTH FROM date) = ${month} AND EXTRACT(YEAR FROM date) = ${year} THEN amount::numeric ELSE 0 END) AS monthly_income,
      SUM(CASE WHEN type = 'expense' AND EXTRACT(MONTH FROM date) = ${month} AND EXTRACT(YEAR FROM date) = ${year} THEN amount::numeric ELSE 0 END) AS monthly_expenses,
      SUM(CASE WHEN type = 'income' AND EXTRACT(MONTH FROM date) = ${prevMonth} AND EXTRACT(YEAR FROM date) = ${prevYear} THEN amount::numeric ELSE 0 END) AS prev_income,
      SUM(CASE WHEN type = 'expense' AND EXTRACT(MONTH FROM date) = ${prevMonth} AND EXTRACT(YEAR FROM date) = ${prevYear} THEN amount::numeric ELSE 0 END) AS prev_expenses,
      COUNT(CASE WHEN EXTRACT(MONTH FROM date) = ${month} AND EXTRACT(YEAR FROM date) = ${year} THEN 1 END) AS tx_count
    FROM transactions
    WHERE user_id = ${user.id}
  `);

  const r = aggregated as any;
  const totalIncome = parseFloat(r.total_income || "0");
  const totalExpenses = parseFloat(r.total_expenses || "0");
  const monthlyIncome = parseFloat(r.monthly_income || "0");
  const monthlyExpenses = parseFloat(r.monthly_expenses || "0");
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  res.set("Cache-Control", CACHE_SHORT);
  res.json({
    totalBalance: totalIncome - totalExpenses,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    savingsRate: Math.round(savingsRate * 100) / 100,
    transactionCount: parseInt(r.tx_count || "0"),
    previousMonthExpenses: parseFloat(r.prev_expenses || "0"),
    previousMonthIncome: parseFloat(r.prev_income || "0"),
  });
});

router.get("/dashboard/spending-by-category", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const now = new Date();
  const month = req.query.month ? parseInt(req.query.month as string) : now.getMonth() + 1;
  const year = req.query.year ? parseInt(req.query.year as string) : now.getFullYear();

  const rows = await db.execute(sql`
    SELECT
      t.category_id,
      c.name AS category_name,
      c.color AS category_color,
      c.icon AS category_icon,
      SUM(t.amount::numeric) AS total_amount,
      COUNT(*) AS tx_count
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.user_id = ${user.id}
      AND t.type = 'expense'
      AND EXTRACT(MONTH FROM t.date) = ${month}
      AND EXTRACT(YEAR FROM t.date) = ${year}
    GROUP BY t.category_id, c.name, c.color, c.icon
    ORDER BY total_amount DESC
  `);

  const totalAmount = (rows as any[]).reduce((s, r) => s + parseFloat(r.total_amount || "0"), 0);

  const result = (rows as any[]).map(r => ({
    categoryId: r.category_id,
    categoryName: r.category_name ?? "Outros",
    categoryColor: r.category_color ?? "#666666",
    categoryIcon: r.category_icon ?? "📦",
    amount: parseFloat(r.total_amount || "0"),
    percentage: totalAmount > 0 ? Math.round((parseFloat(r.total_amount || "0") / totalAmount) * 10000) / 100 : 0,
    transactionCount: parseInt(r.tx_count || "0"),
  }));

  res.set("Cache-Control", CACHE_SHORT);
  res.json(result);
});

router.get("/dashboard/monthly-trend", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const cutoff = sixMonthsAgo.toISOString().split("T")[0];

  const rows = await db.execute(sql`
    SELECT
      EXTRACT(MONTH FROM date)::int AS month,
      EXTRACT(YEAR FROM date)::int AS year,
      SUM(CASE WHEN type = 'income' THEN amount::numeric ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'expense' THEN amount::numeric ELSE 0 END) AS expenses
    FROM transactions
    WHERE user_id = ${user.id} AND date >= ${cutoff}
    GROUP BY EXTRACT(MONTH FROM date), EXTRACT(YEAR FROM date)
    ORDER BY year ASC, month ASC
  `);

  const monthMap = new Map((rows as any[]).map(r => [
    `${r.year}-${r.month}`,
    { month: r.month, year: r.year, income: parseFloat(r.income || "0"), expenses: parseFloat(r.expenses || "0") }
  ]));

  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const key = `${y}-${m}`;
    const data = monthMap.get(key) ?? { month: m, year: y, income: 0, expenses: 0 };
    result.push({ ...data, savings: data.income - data.expenses });
  }

  res.set("Cache-Control", CACHE_MEDIUM);
  res.json(result);
});

router.get("/dashboard/recent-transactions", authMiddleware, async (req, res) => {
  const user = getUser(req);

  const rows = await db.execute(sql`
    SELECT
      t.id, t.user_id, t.type, t.amount::numeric AS amount, t.description,
      t.date, t.time, t.category_id, t.is_recurring, t.recurring_period,
      t.installments, t.installment_number, t.card_id, t.notes, t.created_at,
      c.name AS category_name, c.color AS category_color, c.icon AS category_icon
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.user_id = ${user.id}
    ORDER BY t.date DESC, t.created_at DESC
    LIMIT 10
  `);

  const result = (rows as any[]).map(r => ({
    id: r.id,
    userId: r.user_id,
    type: r.type,
    amount: parseFloat(r.amount || "0"),
    description: r.description,
    date: r.date,
    time: r.time ?? null,
    categoryId: r.category_id,
    categoryName: r.category_name ?? "Outros",
    categoryColor: r.category_color ?? "#666666",
    categoryIcon: r.category_icon ?? "📦",
    isRecurring: r.is_recurring,
    recurringPeriod: r.recurring_period ?? null,
    installments: r.installments ?? null,
    installmentNumber: r.installment_number ?? null,
    cardId: r.card_id ?? null,
    notes: r.notes ?? null,
    createdAt: new Date(r.created_at).toISOString(),
  }));

  res.set("Cache-Control", CACHE_SHORT);
  res.json(result);
});

export default router;

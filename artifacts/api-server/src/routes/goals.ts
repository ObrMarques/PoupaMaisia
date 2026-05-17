import { Router } from "express";
import { db, goalsTable } from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";
import { authMiddleware, getUser } from "../lib/auth";
import { CreateGoalBody, UpdateGoalBody, ContributeToGoalBody } from "@workspace/api-zod";

const router = Router();

function serializeGoal(g: any) {
  const target = parseFloat(g.targetAmount);
  const current = parseFloat(g.currentAmount);
  return {
    id: g.id,
    userId: g.userId,
    name: g.name,
    targetAmount: target,
    currentAmount: current,
    type: g.type,
    deadline: g.deadline ?? null,
    monthlyContribution: g.monthlyContribution ? parseFloat(g.monthlyContribution) : null,
    icon: g.icon ?? null,
    color: g.color ?? null,
    isCompleted: g.isCompleted,
    createdAt: g.createdAt.toISOString(),
  };
}

router.get("/goals", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const goals = await db.select().from(goalsTable)
    .where(eq(goalsTable.userId, user.id))
    .orderBy(asc(goalsTable.id));
  res.json(goals.map(serializeGoal));
});

router.post("/goals", authMiddleware, async (req, res) => {
  const user = getUser(req);

  const parsed = CreateGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [goal] = await db.insert(goalsTable).values({
    userId: user.id,
    name: parsed.data.name,
    targetAmount: String(parsed.data.targetAmount),
    currentAmount: String(parsed.data.currentAmount ?? 0),
    type: parsed.data.type,
    deadline: parsed.data.deadline ?? null,
    monthlyContribution: parsed.data.monthlyContribution ? String(parsed.data.monthlyContribution) : null,
    icon: parsed.data.icon ?? null,
    color: parsed.data.color ?? null,
  }).returning();
  res.status(201).json(serializeGoal(goal));
});

router.patch("/goals/:id", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const id = parseInt(req.params["id"] as string);
  const existing = await db.select().from(goalsTable)
    .where(and(eq(goalsTable.id, id), eq(goalsTable.userId, user.id))).limit(1);
  if (!existing.length) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }
  const parsed = UpdateGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const updates: any = {};
  const d = parsed.data;
  if (d.name !== undefined && d.name !== null) updates.name = d.name;
  if (d.targetAmount !== undefined && d.targetAmount !== null) updates.targetAmount = String(d.targetAmount);
  if (d.currentAmount !== undefined && d.currentAmount !== null) {
    updates.currentAmount = String(d.currentAmount);
    const targetStr = d.targetAmount !== undefined && d.targetAmount !== null
      ? String(d.targetAmount)
      : existing[0].targetAmount;
    updates.isCompleted = parseFloat(String(d.currentAmount)) >= parseFloat(targetStr);
  }
  if (d.type !== undefined && d.type !== null) updates.type = d.type;
  if (d.deadline !== undefined) updates.deadline = d.deadline;
  if (d.monthlyContribution !== undefined) updates.monthlyContribution = d.monthlyContribution ? String(d.monthlyContribution) : null;
  if (d.icon !== undefined) updates.icon = d.icon;
  if (d.color !== undefined) updates.color = d.color;
  const [goal] = await db.update(goalsTable).set(updates).where(eq(goalsTable.id, id)).returning();
  res.json(serializeGoal(goal));
});

router.delete("/goals/:id", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const id = parseInt(req.params["id"] as string);
  const existing = await db.select().from(goalsTable)
    .where(and(eq(goalsTable.id, id), eq(goalsTable.userId, user.id))).limit(1);
  if (!existing.length) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }
  await db.delete(goalsTable).where(eq(goalsTable.id, id));
  res.json({ success: true, message: "Deleted" });
});

router.post("/goals/:id/contribute", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const id = parseInt(req.params["id"] as string);
  const existing = await db.select().from(goalsTable)
    .where(and(eq(goalsTable.id, id), eq(goalsTable.userId, user.id))).limit(1);
  if (!existing.length) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }
  const parsed = ContributeToGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const newCurrent = parseFloat(existing[0].currentAmount) + parsed.data.amount;
  const target = parseFloat(existing[0].targetAmount);
  const [goal] = await db.update(goalsTable).set({
    currentAmount: String(Math.min(newCurrent, target)),
    isCompleted: newCurrent >= target,
  }).where(eq(goalsTable.id, id)).returning();
  res.json(serializeGoal(goal));
});

export default router;

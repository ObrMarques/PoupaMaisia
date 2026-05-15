import { Router } from "express";
import { db, usersTable, goalsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, getUser } from "../lib/auth";
import { UpdateProfileBody, CompleteOnboardingBody } from "@workspace/api-zod";

const router = Router();

function serializeUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    currency: user.currency,
    language: user.language,
    isPremium: user.isPremium,
    premiumExpiresAt: user.premiumExpiresAt?.toISOString() ?? null,
    onboardingCompleted: user.onboardingCompleted,
    createdAt: user.createdAt.toISOString(),
  };
}

router.patch("/users/profile", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const updates: any = {};
  if (parsed.data.name !== undefined && parsed.data.name !== null) updates.name = parsed.data.name;
  if (parsed.data.email !== undefined && parsed.data.email !== null) updates.email = parsed.data.email;
  if (parsed.data.avatarUrl !== undefined) updates.avatarUrl = parsed.data.avatarUrl;
  if (parsed.data.currency !== undefined && parsed.data.currency !== null) updates.currency = parsed.data.currency;
  if (parsed.data.language !== undefined && parsed.data.language !== null) updates.language = parsed.data.language;
  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, user.id)).returning();
  res.json(serializeUser(updated));
});

router.post("/users/onboarding", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const parsed = CompleteOnboardingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { currency, initialGoalAmount, initialGoalName } = parsed.data;
  const [updated] = await db.update(usersTable).set({
    currency,
    onboardingCompleted: true,
  }).where(eq(usersTable.id, user.id)).returning();

  // Create initial goal if provided
  if (initialGoalAmount && initialGoalAmount > 0) {
    await db.insert(goalsTable).values({
      userId: user.id,
      name: initialGoalName ?? "Minha Meta",
      targetAmount: String(initialGoalAmount),
      currentAmount: "0",
      type: "savings",
      icon: "🎯",
      color: "#FFFFFF",
    });
  }

  res.json(serializeUser(updated));
});

export default router;

import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, getUser } from "../lib/auth";

const router = Router();

// /auth/me — returns the current user (JIT provisioned by authMiddleware)
router.get("/auth/me", authMiddleware, (req, res) => {
  const user = getUser(req);
  res.json({
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
  });
});

export default router;

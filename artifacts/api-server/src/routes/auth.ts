import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, generateToken, authMiddleware, getUser } from "../lib/auth";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { name, email, password, currency, language } = parsed.data;
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash,
    currency: currency ?? "BRL",
    language: language ?? "pt-BR",
  }).returning();
  const token = generateToken(user.id);
  res.status(201).json({
    user: {
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
    },
    token,
  });
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;
  const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!users.length) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const user = users[0];
  const passwordHash = hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = generateToken(user.id);
  res.json({
    user: {
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
    },
    token,
  });
});

router.post("/auth/logout", (req, res) => {
  res.json({ success: true, message: "Logged out" });
});

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

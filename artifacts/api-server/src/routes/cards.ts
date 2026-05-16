import { Router } from "express";
import { db, cardsTable } from "@workspace/db";
import { eq, and, count, asc } from "drizzle-orm";
import { authMiddleware, getUser } from "../lib/auth";
import { CreateCardBody, UpdateCardBody } from "@workspace/api-zod";

const FREE_WALLET_LIMIT = 3;

const router = Router();

function serializeCard(c: any) {
  return {
    id: c.id,
    userId: c.userId,
    name: c.name,
    lastFourDigits: c.lastFourDigits,
    brand: c.brand,
    limit: parseFloat(c.limit),
    currentBalance: parseFloat(c.currentBalance),
    closingDay: c.closingDay,
    dueDay: c.dueDay,
    color: c.color,
    createdAt: c.createdAt.toISOString(),
  };
}

router.get("/cards", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const cards = await db.select().from(cardsTable)
    .where(eq(cardsTable.userId, user.id))
    .orderBy(asc(cardsTable.id));
  res.json(cards.map(serializeCard));
});

router.post("/cards", authMiddleware, async (req, res) => {
  const user = getUser(req);

  const now = new Date();
  const isPremiumActive =
    user.isPremium === true &&
    (!user.premiumExpiresAt || now < new Date(user.premiumExpiresAt));

  if (!isPremiumActive) {
    const [{ value: cardCount }] = await db
      .select({ value: count() })
      .from(cardsTable)
      .where(eq(cardsTable.userId, user.id));
    if (cardCount >= FREE_WALLET_LIMIT) {
      res.status(403).json({
        error: "wallet_limit_reached",
        message: "Limite de carteiras atingido. Assine o Premium para carteiras ilimitadas.",
      });
      return;
    }
  }

  const parsed = CreateCardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [card] = await db.insert(cardsTable).values({
    userId: user.id,
    name: parsed.data.name,
    lastFourDigits: parsed.data.lastFourDigits,
    brand: parsed.data.brand,
    limit: String(parsed.data.limit),
    currentBalance: String(parsed.data.currentBalance ?? 0),
    closingDay: parsed.data.closingDay,
    dueDay: parsed.data.dueDay,
    color: parsed.data.color ?? "#1A1A1A",
  }).returning();
  res.status(201).json(serializeCard(card));
});

router.patch("/cards/:id", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const id = parseInt(req.params["id"] as string);
  const existing = await db.select().from(cardsTable)
    .where(and(eq(cardsTable.id, id), eq(cardsTable.userId, user.id))).limit(1);
  if (!existing.length) {
    res.status(404).json({ error: "Card not found" });
    return;
  }
  const parsed = UpdateCardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const updates: any = {};
  const d = parsed.data;
  if (d.name !== undefined && d.name !== null) updates.name = d.name;
  if (d.brand !== undefined && d.brand !== null) updates.brand = d.brand;
  if (d.limit !== undefined && d.limit !== null) updates.limit = String(d.limit);
  if (d.currentBalance !== undefined && d.currentBalance !== null) updates.currentBalance = String(d.currentBalance);
  if (d.closingDay !== undefined && d.closingDay !== null) updates.closingDay = d.closingDay;
  if (d.dueDay !== undefined && d.dueDay !== null) updates.dueDay = d.dueDay;
  if (d.color !== undefined && d.color !== null) updates.color = d.color;
  const [card] = await db.update(cardsTable).set(updates).where(eq(cardsTable.id, id)).returning();
  res.json(serializeCard(card));
});

router.delete("/cards/:id", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const id = parseInt(req.params["id"] as string);
  const existing = await db.select().from(cardsTable)
    .where(and(eq(cardsTable.id, id), eq(cardsTable.userId, user.id))).limit(1);
  if (!existing.length) {
    res.status(404).json({ error: "Card not found" });
    return;
  }
  await db.delete(cardsTable).where(eq(cardsTable.id, id));
  res.json({ success: true, message: "Deleted" });
});

export default router;

import { Router } from "express";
import { db, categoriesTable } from "@workspace/db";
import { eq, or, isNull } from "drizzle-orm";
import { authMiddleware, getUser } from "../lib/auth";
import { CreateCategoryBody, UpdateCategoryBody } from "@workspace/api-zod";

const router = Router();

router.get("/categories", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const cats = await db.select().from(categoriesTable)
    .where(or(eq(categoriesTable.isDefault, true), eq(categoriesTable.userId, user.id)));
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.json(cats.map(c => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    color: c.color,
    type: c.type,
    isDefault: c.isDefault,
    userId: c.userId,
  })));
});

router.post("/categories", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [cat] = await db.insert(categoriesTable).values({
    name: parsed.data.name,
    icon: parsed.data.icon,
    color: parsed.data.color,
    type: parsed.data.type,
    isDefault: false,
    userId: user.id,
  }).returning();
  res.status(201).json({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    type: cat.type,
    isDefault: cat.isDefault,
    userId: cat.userId,
  });
});

router.patch("/categories/:id", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const id = parseInt(req.params["id"] as string);
  const existing = await db.select().from(categoriesTable)
    .where(eq(categoriesTable.id, id)).limit(1);
  if (!existing.length || (existing[0].userId !== null && existing[0].userId !== user.id)) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const updates: any = {};
  if (parsed.data.name !== undefined && parsed.data.name !== null) updates.name = parsed.data.name;
  if (parsed.data.icon !== undefined && parsed.data.icon !== null) updates.icon = parsed.data.icon;
  if (parsed.data.color !== undefined && parsed.data.color !== null) updates.color = parsed.data.color;
  if (parsed.data.type !== undefined && parsed.data.type !== null) updates.type = parsed.data.type;
  const [cat] = await db.update(categoriesTable).set(updates).where(eq(categoriesTable.id, id)).returning();
  res.json({ id: cat.id, name: cat.name, icon: cat.icon, color: cat.color, type: cat.type, isDefault: cat.isDefault, userId: cat.userId });
});

router.delete("/categories/:id", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const id = parseInt(req.params["id"] as string);
  const existing = await db.select().from(categoriesTable)
    .where(eq(categoriesTable.id, id)).limit(1);
  if (!existing.length || existing[0].userId !== user.id) {
    res.status(404).json({ error: "Category not found or not deletable" });
    return;
  }
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.json({ success: true, message: "Deleted" });
});

export default router;

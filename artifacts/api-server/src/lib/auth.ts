import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + process.env.SESSION_SECRET).digest("hex");
}

export function generateToken(userId: number): string {
  const payload = `${userId}:${Date.now()}:${process.env.SESSION_SECRET}`;
  return Buffer.from(payload).toString("base64");
}

export function parseToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length < 3) return null;
    const userId = parseInt(parts[0]);
    if (isNaN(userId)) return null;
    return userId;
  } catch {
    return null;
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const userId = parseToken(token);
  if (!userId) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!users.length) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  (req as any).user = users[0];
  next();
}

export function getUser(req: Request) {
  return (req as any).user;
}

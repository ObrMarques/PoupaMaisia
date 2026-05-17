import { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

/**
 * Session-based auth middleware.
 * JIT-provisions a local user row keyed to the express-session ID.
 * Attaches the full user row to req.user.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const session = req.session;

  if (session.userId) {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.userId))
      .limit(1);

    if (users.length) {
      (req as any).user = users[0];
      return next();
    }
    // Session points to a non-existent user — fall through to provision
  }

  // Provision a new user for this session
  const sessionId = session.id;

  let users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.sessionId, sessionId))
    .limit(1);

  if (!users.length) {
    const inserted = await db
      .insert(usersTable)
      .values({
        sessionId,
        name: "Usuário",
        currency: "BRL",
        language: "pt-BR",
      })
      .returning();
    users = inserted;
  }

  session.userId = users[0].id;
  (req as any).user = users[0];
  next();
}

export function getUser(req: Request) {
  return (req as any).user;
}

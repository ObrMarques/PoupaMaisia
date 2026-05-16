import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

/**
 * JIT-provisions a local user row from the Clerk session.
 * Attaches the full user row to req.user.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;

  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Look up or provision the local user row
  let users = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);

  if (!users.length) {
    // JIT provision: create user row on first authenticated request
    const clerkUser = auth as any;
    const email = clerkUser?.sessionClaims?.email as string | undefined ?? "";
    const name = (clerkUser?.sessionClaims?.fullName as string | undefined)
      ?? (clerkUser?.sessionClaims?.firstName as string | undefined)
      ?? email.split("@")[0]
      ?? "Usuário";

    const inserted = await db.insert(usersTable).values({
      clerkId: clerkUserId,
      name,
      email,
      currency: "BRL",
      language: "pt-BR",
    }).returning();
    users = inserted;
  }

  (req as any).user = users[0];
  next();
}

export function getUser(req: Request) {
  return (req as any).user;
}

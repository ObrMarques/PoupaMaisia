import { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
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
    // JIT provision: fetch real user data from Clerk Backend API.
    // Session claims (JWT) do not include email/name for OAuth users —
    // clerkClient.users.getUser() works for both email/password and Google OAuth.
    const clerkUser = await clerkClient.users.getUser(clerkUserId);

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const firstName = clerkUser.firstName ?? "";
    const lastName = clerkUser.lastName ?? "";
    const fullName = `${firstName} ${lastName}`.trim();
    const name = fullName || email.split("@")[0] || "Usuário";

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

import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "./supabase";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sendWelcomeEmail } from "./email";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !supabaseUser) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const supabaseId = supabaseUser.id;

  let users = await db.select().from(usersTable).where(eq(usersTable.supabaseId, supabaseId)).limit(1);

  if (!users.length) {
    const email = supabaseUser.email;
    if (!email) {
      res.status(422).json({ error: "Conta sem endereço de e-mail associado." });
      return;
    }

    const rawName =
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      "";
    const name = rawName.trim() || email.split("@")[0] || "Usuário";
    const avatarUrl = supabaseUser.user_metadata?.avatar_url ?? null;

    // Use ON CONFLICT DO NOTHING to handle the race condition where multiple
    // simultaneous requests all attempt to provision the same user.
    const inserted = await db
      .insert(usersTable)
      .values({ supabaseId, name, email, avatarUrl, currency: "BRL", language: "pt-BR" })
      .onConflictDoNothing()
      .returning();

    if (inserted.length) {
      users = inserted;
      // Fire-and-forget welcome email — don't block the request
      sendWelcomeEmail(email, name).catch(() => {});
    } else {
      // Another concurrent request already inserted the row — fetch it.
      users = await db.select().from(usersTable).where(eq(usersTable.supabaseId, supabaseId)).limit(1);
    }
  }

  if (!users.length) {
    res.status(500).json({ error: "Falha ao provisionar usuário." });
    return;
  }

  (req as any).user = users[0];
  next();
}

export function getUser(req: Request) {
  return (req as any).user;
}

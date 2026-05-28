import { Router } from "express";
import { db, usersTable, goalsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, getUser } from "../lib/auth";
import { supabaseAdmin } from "../lib/supabase";
import { UpdateProfileBody, CompleteOnboardingBody } from "@workspace/api-zod";
import { broadcastChange } from "../lib/realtime";

const AVATARS_BUCKET = "avatars";

async function ensureAvatarsBucket() {
  await supabaseAdmin.storage.createBucket(AVATARS_BUCKET, {
    public: true,
    fileSizeLimit: 2 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  }).catch(() => {});
}

async function uploadAvatarToStorage(supabaseId: string, base64: string): Promise<string | null> {
  const matches = base64.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
  if (!matches) return null;
  const [, contentType, data] = matches;
  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const fileName = `${supabaseId}/avatar.${ext}`;
  const buffer = Buffer.from(data!, "base64");

  await ensureAvatarsBucket();

  const { error } = await supabaseAdmin.storage
    .from(AVATARS_BUCKET)
    .upload(fileName, buffer, { contentType: contentType!, upsert: true });

  if (error) return null;

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(AVATARS_BUCKET)
    .getPublicUrl(fileName);

  return publicUrl;
}

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
  if (parsed.data.currency !== undefined && parsed.data.currency !== null) updates.currency = parsed.data.currency;
  if (parsed.data.language !== undefined && parsed.data.language !== null) updates.language = parsed.data.language;

  // Avatar: if base64 string, upload to Supabase Storage and store URL instead
  if (parsed.data.avatarUrl !== undefined) {
    if (parsed.data.avatarUrl && parsed.data.avatarUrl.startsWith("data:image/")) {
      const storageUrl = await uploadAvatarToStorage(user.supabaseId, parsed.data.avatarUrl);
      updates.avatarUrl = storageUrl ?? parsed.data.avatarUrl;
    } else {
      updates.avatarUrl = parsed.data.avatarUrl;
    }
  }

  // Persist to our DB (source of truth)
  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, user.id)).returning();

  // Keep Supabase Auth user_metadata in sync so full_name is consistent
  // across JWTs and any OAuth provider re-auth. Fire-and-forget — DB is source of truth.
  if (updates.name) {
    supabaseAdmin.auth.admin.updateUserById(user.supabaseId, {
      user_metadata: { full_name: updates.name },
    }).catch(() => {});
  }

  broadcastChange(user.supabaseId, "profile").catch(() => {});
  res.json(serializeUser(updated));
});

router.post("/users/subscribe", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  const [updated] = await db
    .update(usersTable)
    .set({ isPremium: true, premiumExpiresAt: expiresAt })
    .where(eq(usersTable.id, user.id))
    .returning();
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

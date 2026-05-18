import { Router } from "express";
import { authMiddleware, getUser } from "../lib/auth";
import { supabaseAdmin } from "../lib/supabase";
import { sendVerificationEmail } from "../lib/email";

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

// /auth/send-verification — public endpoint: generates a Supabase confirmation
// link and sends it via Resend. Called right after sign-up so the user receives
// a branded email instead of Supabase's default.
router.post("/auth/send-verification", async (req, res) => {
  const { email } = req.body as { email?: string };

  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "E-mail obrigatório." });
    return;
  }

  try {
    // Generate a magic-link / OTP confirmation link via the admin SDK.
    const origin = req.headers.origin ?? req.headers.referer ?? "";
    const redirectTo = `${origin}/auth/callback`;

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });

    if (error || !data?.properties?.action_link) {
      // Return 200 anyway to avoid email enumeration attacks
      res.json({ ok: true });
      return;
    }

    await sendVerificationEmail(email, data.properties.action_link);
    res.json({ ok: true });
  } catch {
    // Silently succeed — never leak whether an email exists
    res.json({ ok: true });
  }
});

export default router;

import { Router } from "express";
import { authMiddleware, getUser } from "../lib/auth";
import { supabaseAdmin } from "../lib/supabase";
import { sendVerificationEmail } from "../lib/email";
import { sendOtpEmail, sendPasswordResetEmail, isSmtpConfigured } from "../lib/smtp";
import { generateOtp, storeOtp, verifyOtp, hasValidOtp, getUserIdByEmail } from "../lib/otp-store";

const router = Router();

// ─── GET /auth/me ────────────────────────────────────────────────────────────
router.get("/auth/me", authMiddleware, (req, res) => {
  const user = getUser(req);
  const ownerEmail = process.env.OWNER_EMAIL;
  const isOwner = ownerEmail ? user.email === ownerEmail : false;
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    currency: user.currency,
    language: user.language,
    isPremium: isOwner ? true : user.isPremium,
    premiumExpiresAt: user.premiumExpiresAt?.toISOString() ?? null,
    onboardingCompleted: user.onboardingCompleted,
    createdAt: user.createdAt.toISOString(),
  });
});

// ─── POST /auth/register ─────────────────────────────────────────────────────
// Creates the Supabase user via admin SDK (no auto-email) then sends OTP.
router.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "A senha deve ter no mínimo 6 caracteres." });
    return;
  }

  // Rate-limit: don't re-create if OTP already pending
  if (hasValidOtp(email)) {
    res.status(429).json({ error: "Código já enviado. Aguarde antes de solicitar outro." });
    return;
  }

  const log = req.log;

  // Create user without triggering Supabase's own confirmation email
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { full_name: name.trim() },
  });

  if (createErr) {
    log.warn({ err: createErr }, "register: failed to create user");
    const msg = createErr.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("already been registered") || msg.includes("email address") && msg.includes("taken")) {
      res.status(409).json({ error: "Esse e-mail já está em uso." });
    } else {
      res.status(400).json({ error: "Erro ao criar conta. Tente novamente." });
    }
    return;
  }

  const userId = created.user.id;
  const otp = generateOtp();
  storeOtp(email, otp, userId);

  if (isSmtpConfigured()) {
    try {
      await sendOtpEmail(email, otp);
      log.info({ email }, "register: OTP sent via Gmail SMTP");
    } catch (err) {
      log.error({ err, email }, "register: failed to send OTP via Gmail");
      // Delete the user so they can retry cleanly
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
      res.status(502).json({ error: "Falha ao enviar e-mail. Verifique as configurações de SMTP e tente novamente." });
      return;
    }
  } else {
    // Fallback: use Resend-based magic link
    log.warn({ email }, "register: Gmail SMTP not configured, falling back to Resend link");
    const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (linkData?.properties?.action_link) {
      await sendVerificationEmail(email, linkData.properties.action_link).catch(() => {});
    }
  }

  res.json({ ok: true, method: isSmtpConfigured() ? "otp" : "link" });
});

// ─── POST /auth/resend-otp ───────────────────────────────────────────────────
router.post("/auth/resend-otp", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) { res.status(400).json({ error: "E-mail obrigatório." }); return; }

  if (hasValidOtp(email)) {
    res.status(429).json({ error: "Aguarde alguns minutos antes de reenviar o código." });
    return;
  }

  const log = req.log;

  // Look up the Supabase userId from the in-memory registry (set at register time)
  const userId = getUserIdByEmail(email);
  if (!userId) {
    // Unknown email or registry expired — return 200 to avoid enumeration
    res.json({ ok: true });
    return;
  }

  const otp = generateOtp();
  storeOtp(email, otp, userId);

  try {
    await sendOtpEmail(email, otp);
    log.info({ email }, "resend-otp: OTP resent");
    res.json({ ok: true });
  } catch (err) {
    log.error({ err, email }, "resend-otp: failed to send OTP");
    res.status(502).json({ error: "Falha ao reenviar e-mail. Tente novamente." });
  }
});

// ─── POST /auth/verify-otp ───────────────────────────────────────────────────
router.post("/auth/verify-otp", async (req, res) => {
  const { email, otp } = req.body as { email?: string; otp?: string };

  if (!email || !otp) {
    res.status(400).json({ error: "E-mail e código são obrigatórios." });
    return;
  }

  const log = req.log;
  const result = verifyOtp(email, otp.trim());

  if (!result.ok) {
    const messages: Record<typeof result.reason, string> = {
      not_found: "Código não encontrado. Solicite um novo.",
      expired: "Código expirado. Solicite um novo.",
      invalid: "Código incorreto. Verifique e tente novamente.",
      too_many_attempts: "Muitas tentativas. Solicite um novo código.",
    };
    res.status(400).json({ error: messages[result.reason] });
    return;
  }

  // Confirm the email in Supabase
  const { error: confirmErr } = await supabaseAdmin.auth.admin.updateUserById(
    result.userId,
    { email_confirm: true },
  );

  if (confirmErr) {
    log.error({ err: confirmErr, email }, "verify-otp: failed to confirm email");
    res.status(500).json({ error: "Erro ao ativar a conta. Tente novamente." });
    return;
  }

  log.info({ email }, "verify-otp: account confirmed");
  res.json({ ok: true });
});

// ─── POST /auth/reset-password ───────────────────────────────────────────────
// Authenticated: generates a recovery link for the logged-in user and sends via Gmail SMTP.
router.post("/auth/reset-password", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const { redirectTo } = req.body as { redirectTo?: string };

  const log = req.log;

  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email: user.email,
    options: redirectTo ? { redirectTo } : undefined,
  });

  if (linkError || !linkData?.properties?.action_link) {
    log.error({ err: linkError, email: user.email }, "reset-password: failed to generate recovery link");
    res.status(500).json({ error: "Falha ao gerar link de redefinição. Tente novamente." });
    return;
  }

  try {
    await sendPasswordResetEmail(user.email, linkData.properties.action_link);
    log.info({ email: user.email }, "reset-password: recovery email sent");
    res.json({ ok: true });
  } catch (err) {
    log.error({ err, email: user.email }, "reset-password: failed to send email");
    res.status(502).json({ error: "Falha ao enviar e-mail. Tente novamente." });
  }
});

// ─── POST /auth/send-verification (Resend magic-link fallback) ───────────────
router.post("/auth/send-verification", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "E-mail obrigatório." });
    return;
  }

  try {
    const origin = req.headers.origin ?? req.headers.referer ?? "";
    const redirectTo = `${origin}/auth/callback`;
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });
    if (!error && data?.properties?.action_link) {
      await sendVerificationEmail(email, data.properties.action_link);
    }
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
});

export default router;

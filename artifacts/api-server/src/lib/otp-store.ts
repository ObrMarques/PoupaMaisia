const TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const USER_ID_TTL_MS = 60 * 60 * 1000; // 1 hour — long-lived registry

interface OtpEntry {
  otp: string;
  userId: string;
  expiresAt: number;
  attempts: number;
}

interface UserIdEntry {
  userId: string;
  expiresAt: number;
}

const store = new Map<string, OtpEntry>();
// Separate long-lived map: email → supabase userId (persists across OTP generations)
const userIdRegistry = new Map<string, UserIdEntry>();

// Purge expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt < now) store.delete(key);
  }
  for (const [key, entry] of userIdRegistry) {
    if (entry.expiresAt < now) userIdRegistry.delete(key);
  }
}, 5 * 60 * 1000);

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function storeOtp(email: string, otp: string, userId: string): void {
  const key = email.toLowerCase();
  store.set(key, { otp, userId, expiresAt: Date.now() + TTL_MS, attempts: 0 });
  userIdRegistry.set(key, { userId, expiresAt: Date.now() + USER_ID_TTL_MS });
}

export function getUserIdByEmail(email: string): string | undefined {
  return userIdRegistry.get(email.toLowerCase())?.userId;
}

export type VerifyResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "not_found" | "expired" | "invalid" | "too_many_attempts" };

export function verifyOtp(email: string, otp: string): VerifyResult {
  const entry = store.get(email.toLowerCase());

  if (!entry) return { ok: false, reason: "not_found" };
  if (Date.now() > entry.expiresAt) {
    store.delete(email.toLowerCase());
    return { ok: false, reason: "expired" };
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(email.toLowerCase());
    return { ok: false, reason: "too_many_attempts" };
  }

  entry.attempts += 1;

  if (entry.otp !== otp) return { ok: false, reason: "invalid" };

  store.delete(email.toLowerCase());
  return { ok: true, userId: entry.userId };
}

export function hasValidOtp(email: string): boolean {
  const entry = store.get(email.toLowerCase());
  return Boolean(entry && Date.now() < entry.expiresAt);
}

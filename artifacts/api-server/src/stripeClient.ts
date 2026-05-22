import Stripe from "stripe";
import { StripeSync } from "stripe-replit-sync";

function getKeys(): { secretKey: string; publishableKey: string } {
  const secretKey     = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set.");
  }
  if (!publishableKey) {
    throw new Error("STRIPE_PUBLISHABLE_KEY environment variable is not set.");
  }

  return { secretKey, publishableKey };
}

export async function getUncachableStripeClient(): Promise<Stripe> {
  const { secretKey } = getKeys();
  return new Stripe(secretKey, { apiVersion: "2025-08-27.basil" as any });
}

export async function getStripePublishableKey(): Promise<string> {
  return getKeys().publishableKey;
}

export async function getStripeSecretKey(): Promise<string> {
  return getKeys().secretKey;
}

export async function getStripeSync(): Promise<StripeSync> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  const { secretKey } = getKeys();
  return new StripeSync({
    poolConfig: { connectionString: databaseUrl, max: 2 },
    stripeSecretKey: secretKey,
  });
}

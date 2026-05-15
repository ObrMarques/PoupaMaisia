import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./stripeClient";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required for Stripe integration.");
  }

  try {
    logger.info("Initializing Stripe schema...");
    // runMigrations must fully complete before we create StripeSync
    await runMigrations({ databaseUrl });
    logger.info("Stripe schema ready");

    // Get a fresh StripeSync instance AFTER migrations
    const stripeSync = await getStripeSync();

    const domains = process.env.REPLIT_DOMAINS?.split(",")[0];
    if (domains) {
      const webhookBaseUrl = `https://${domains}`;
      // Run webhook setup and backfill in background — don't block server startup
      (async () => {
        try {
          const webhookResult = await stripeSync.findOrCreateManagedWebhook(
            `${webhookBaseUrl}/api/stripe/webhook`
          );
          logger.info({ url: (webhookResult as any)?.url }, "Stripe webhook configured");
          await stripeSync.syncBackfill();
          logger.info("Stripe data synced");
        } catch (err: any) {
          logger.error({ err }, "Stripe background init error (non-fatal)");
        }
      })();
    } else {
      logger.warn("REPLIT_DOMAINS not set — skipping webhook setup");
    }
  } catch (err: any) {
    // Log but don't crash the server if Stripe init fails
    logger.error({ err }, "Stripe initialization failed (non-fatal)");
  }
}

// Start server immediately, run Stripe init in parallel
const serverStart = new Promise<void>((resolve, reject) => {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      reject(err);
      return;
    }
    logger.info({ port }, "Server listening");
    resolve();
  });
});

await Promise.all([serverStart, initStripe()]);

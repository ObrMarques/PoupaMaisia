import { getStripeSync, getUncachableStripeClient } from "./stripeClient";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./lib/logger";

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        "STRIPE WEBHOOK ERROR: Payload must be a Buffer. " +
        "Ensure webhook route is registered BEFORE app.use(express.json())."
      );
    }
    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    // After StripeSync verified and synced the event, update users.is_premium
    const event = JSON.parse(payload.toString());
    await WebhookHandlers.syncPremiumStatus(event);
  }

  static async syncPremiumStatus(event: any): Promise<void> {
    const { type, data } = event;

    if (type === "checkout.session.completed") {
      const session = data.object;
      if (session.mode !== "subscription") return;

      // Our /stripe/checkout flow passes userId in metadata
      if (session.metadata?.userId) {
        const userId = parseInt(session.metadata.userId, 10);
        await db.update(usersTable)
          .set({ isPremium: true })
          .where(eq(usersTable.id, userId));
        logger.info({ userId }, "webhook: activated premium via checkout session metadata");
        return;
      }

      // Payment link flow: look up by customer email
      const email = session.customer_details?.email;
      if (email) {
        await db.update(usersTable)
          .set({ isPremium: true })
          .where(eq(usersTable.email, email));
        logger.info({ email }, "webhook: activated premium via customer email (payment link)");
      }
      return;
    }

    if (type === "customer.subscription.created" || type === "customer.subscription.updated") {
      const sub = data.object;
      const isActive = ["active", "trialing"].includes(sub.status);
      const periodEnd = sub.current_period_end
        ? new Date(Number(sub.current_period_end) * 1000)
        : null;

      if (sub.metadata?.userId) {
        const userId = parseInt(sub.metadata.userId, 10);
        await db.update(usersTable)
          .set({ isPremium: isActive, premiumExpiresAt: isActive ? periodEnd : null })
          .where(eq(usersTable.id, userId));
        logger.info({ userId, isActive, type }, "webhook: synced premium via subscription metadata");
        return;
      }

      // Look up by Stripe customer email
      try {
        const stripe = await getUncachableStripeClient();
        const customer = await stripe.customers.retrieve(sub.customer) as any;
        if (customer?.email) {
          await db.update(usersTable)
            .set({ isPremium: isActive, premiumExpiresAt: isActive ? periodEnd : null })
            .where(eq(usersTable.email, customer.email));
          logger.info({ email: customer.email, isActive, type }, "webhook: synced premium via customer email");
        }
      } catch (err) {
        logger.error({ err, type }, "webhook: failed to fetch customer for premium sync");
      }
      return;
    }

    if (type === "customer.subscription.deleted") {
      const sub = data.object;

      if (sub.metadata?.userId) {
        const userId = parseInt(sub.metadata.userId, 10);
        await db.update(usersTable)
          .set({ isPremium: false, premiumExpiresAt: null })
          .where(eq(usersTable.id, userId));
        logger.info({ userId }, "webhook: deactivated premium via subscription metadata");
        return;
      }

      try {
        const stripe = await getUncachableStripeClient();
        const customer = await stripe.customers.retrieve(sub.customer) as any;
        if (customer?.email) {
          await db.update(usersTable)
            .set({ isPremium: false, premiumExpiresAt: null })
            .where(eq(usersTable.email, customer.email));
          logger.info({ email: customer.email }, "webhook: deactivated premium via customer email");
        }
      } catch (err) {
        logger.error({ err, type }, "webhook: failed to fetch customer for premium deactivation");
      }
    }
  }
}

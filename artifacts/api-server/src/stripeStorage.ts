import { sql } from "drizzle-orm";
import { db } from "@workspace/db";

export class StripeStorage {
  async getProduct(productId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE id = ${productId}`
    );
    return (result as any).rows?.[0] ?? null;
  }

  async listProductsWithPrices() {
    const result = await db.execute(sql`
      SELECT
        p.id        AS product_id,
        p.name      AS product_name,
        p.description AS product_description,
        p.active    AS product_active,
        p.metadata  AS product_metadata,
        pr.id       AS price_id,
        pr.unit_amount,
        pr.currency,
        pr.recurring,
        pr.active   AS price_active
      FROM stripe.products p
      LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      WHERE p.active = true
      ORDER BY p.id, pr.unit_amount
    `);
    return (result as any).rows ?? [];
  }

  async getSubscription(subscriptionId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`
    );
    return (result as any).rows?.[0] ?? null;
  }

  async getCustomerByEmail(email: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.customers WHERE email = ${email} AND deleted = false ORDER BY created DESC LIMIT 1`
    );
    return (result as any).rows?.[0] ?? null;
  }

  async getActiveSubscriptionForCustomer(customerId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE customer = ${customerId} AND status IN ('active','trialing') ORDER BY created DESC LIMIT 1`
    );
    return (result as any).rows?.[0] ?? null;
  }
}

export const stripeStorage = new StripeStorage();

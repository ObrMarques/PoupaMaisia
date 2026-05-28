import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, getUser } from "../lib/auth";
import { getUncachableStripeClient } from "../stripeClient";
import { stripeStorage } from "../stripeStorage";

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
    onboardingDismissed: user.onboardingDismissed,
    createdAt: user.createdAt.toISOString(),
  };
}

function getBaseUrl(req: any): string {
  const domains = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (domains) return `https://${domains}`;
  return `${req.protocol}://${req.get("host")}`;
}

const PLAN_PRICE_ID = "price_1TXOsi6LuUnWVnzqRtOPYreZ";

// Fetch the subscription plan price directly from Stripe API
router.get("/stripe/plan", async (_req, res) => {
  try {
    const stripe = await getUncachableStripeClient();
    const price = await stripe.prices.retrieve(PLAN_PRICE_ID, {
      expand: ["product"],
    });
    const product = price.product as any;
    res.json({
      priceId: price.id,
      unitAmount: price.unit_amount,
      currency: price.currency,
      interval: (price.recurring as any)?.interval ?? "month",
      productName: product?.name ?? "PoupaMais Premium",
      productDescription: product?.description ?? null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stripe/products", async (_req, res) => {
  try {
    const rows = await stripeStorage.listProductsWithPrices();
    const map = new Map<string, any>();
    for (const row of rows) {
      if (!map.has(row.product_id)) {
        map.set(row.product_id, {
          id: row.product_id,
          name: row.product_name,
          description: row.product_description,
          prices: [],
        });
      }
      if (row.price_id) {
        map.get(row.product_id).prices.push({
          id: row.price_id,
          unitAmount: row.unit_amount,
          currency: row.currency,
          recurring: row.recurring,
        });
      }
    }
    res.json({ data: Array.from(map.values()) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/stripe/checkout", authMiddleware, async (req, res) => {
  try {
    const user = getUser(req);
    const { priceId } = req.body as { priceId: string };
    if (!priceId) {
      res.status(400).json({ error: "priceId is required" });
      return;
    }

    const stripe = await getUncachableStripeClient();
    const baseUrl = getBaseUrl(req);

    let customerId: string | undefined;

    const existingCustomer = await stripeStorage.getCustomerByEmail(user.email);
    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: String(user.id) },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card", "boleto"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${baseUrl}/paywall?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/paywall`,
      metadata: { userId: String(user.id) },
      locale: "pt-BR",
    });

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/stripe/portal", authMiddleware, async (req, res) => {
  try {
    const user = getUser(req);
    const stripe = await getUncachableStripeClient();
    const baseUrl = getBaseUrl(req);

    const customer = await stripeStorage.getCustomerByEmail(user.email);
    if (!customer) {
      res.status(404).json({ error: "Nenhuma assinatura encontrada para este e-mail." });
      return;
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${baseUrl}/settings`,
    });

    res.json({ url: portalSession.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stripe/subscription-status", authMiddleware, async (req, res) => {
  try {
    const user = getUser(req);
    const customer = await stripeStorage.getCustomerByEmail(user.email);
    if (!customer) {
      res.json({ active: false, subscription: null });
      return;
    }
    const sub = await stripeStorage.getActiveSubscriptionForCustomer(customer.id);
    if (!sub) {
      res.json({ active: false, subscription: null });
      return;
    }

    const isActive = ["active", "trialing"].includes(sub.status);

    if (isActive) {
      const periodEnd = new Date(Number(sub.current_period_end) * 1000);
      const [updated] = await db
        .update(usersTable)
        .set({ isPremium: true, premiumExpiresAt: periodEnd })
        .where(eq(usersTable.id, user.id))
        .returning();
      res.json({ active: true, subscription: sub, user: serializeUser(updated) });
    } else {
      res.json({ active: false, subscription: sub });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

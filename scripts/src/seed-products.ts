import { getUncachableStripeClient } from "./stripeClient";

async function createProducts() {
  try {
    const stripe = await getUncachableStripeClient();

    const existing = await stripe.products.search({
      query: "name:'PoupaMais Premium' AND active:'true'",
    });

    if (existing.data.length > 0) {
      console.log("PoupaMais Premium already exists:", existing.data[0].id);
      const prices = await stripe.prices.list({ product: existing.data[0].id, active: true });
      prices.data.forEach((p) => console.log("  price:", p.id, p.unit_amount, p.currency));
      return;
    }

    const product = await stripe.products.create({
      name: "PoupaMais Premium",
      description: "Acesso completo ao PoupaMais: dashboard, transações, metas, relatórios e PoupaAI.",
    });
    console.log("Produto criado:", product.id);

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 990,
      currency: "brl",
      recurring: { interval: "month" },
    });
    console.log("Preço criado:", price.id, "— R$9,90/mês");
  } catch (err: any) {
    console.error("Erro:", err.message);
    process.exit(1);
  }
}

createProducts();

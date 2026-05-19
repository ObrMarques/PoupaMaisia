import { Router } from "express";
import { db, walletsTable, transactionsTable, categoriesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { authMiddleware, getUser } from "../lib/auth";
import { logger } from "../lib/logger";
import {
  createConnectToken,
  getAccounts,
  getTransactions,
  getItem,
} from "../lib/pluggy";

const router = Router();

// ─── POST /pluggy/create-connect-token (alias: /pluggy/connect-token) ────────
// Returns a short-lived connect token for the Pluggy Widget
router.post(["/pluggy/create-connect-token", "/pluggy/connect-token"], authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.body as { itemId?: string };
    const token = await createConnectToken(itemId);
    res.json({ accessToken: token });
  } catch (err: any) {
    logger.error({ err }, "pluggy: failed to create connect token");
    res.status(500).json({ error: "Falha ao criar token de conexão. Verifique as credenciais do Pluggy." });
  }
});

// ─── POST /pluggy/connect ─────────────────────────────────────────────────────
// Called after user completes Pluggy Widget flow — receives itemId, fetches accounts,
// creates wallets and imports recent transactions
router.post("/pluggy/connect", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const { itemId } = req.body as { itemId?: string };

  if (!itemId) {
    res.status(400).json({ error: "itemId é obrigatório." });
    return;
  }

  try {
    const [accounts, item] = await Promise.all([
      getAccounts(itemId),
      getItem(itemId),
    ]);

    const createdWallets: any[] = [];

    // Fetch default "Outros" category for uncategorized transactions
    const defaultCategoryResult = await db
      .select()
      .from(categoriesTable)
      .where(and(eq(categoriesTable.isDefault, true), eq(categoriesTable.type, "both")))
      .limit(1);
    const defaultCategoryId = defaultCategoryResult[0]?.id ?? 1;

    for (const account of accounts) {
      if (!["BANK", "CREDIT"].includes(account.type)) continue;

      // Check if wallet already linked to this account
      const existing = await db
        .select()
        .from(walletsTable)
        .where(and(eq(walletsTable.userId, user.id), eq(walletsTable.pluggyAccountId, account.id)))
        .limit(1);

      let walletId: number;

      if (existing.length) {
        walletId = existing[0].id;
      } else {
        const icon = account.type === "CREDIT" ? "💳" : "🏦";
        const color = account.type === "CREDIT" ? "#8B5CF6" : "#3B82F6";
        const institutionName = item.connector?.name ?? account.bankData?.transferNumber ?? "Banco";
        const name = `${account.name ?? institutionName}`;

        const [newWallet] = await db.insert(walletsTable).values({
          userId: user.id,
          name,
          color,
          icon,
          initialBalance: String(account.balance ?? 0),
          pluggyItemId: itemId,
          pluggyAccountId: account.id,
        }).returning();

        walletId = newWallet.id;
        createdWallets.push(newWallet);
      }

      // Import last 90 days of transactions
      const from = new Date();
      from.setDate(from.getDate() - 90);
      const fromStr = from.toISOString().split("T")[0];

      const { results: txs } = await getTransactions(account.id, { from: fromStr });

      let imported = 0;
      for (const tx of txs) {
        // Skip if already imported (idempotent)
        const dupCheck = await db
          .select({ id: transactionsTable.id })
          .from(transactionsTable)
          .where(and(
            eq(transactionsTable.userId, user.id),
            eq(transactionsTable.pluggyTransactionId, tx.id),
          ))
          .limit(1);

        if (dupCheck.length) continue;

        const isExpense = tx.type === "DEBIT" || tx.amount < 0;
        const amount = Math.abs(tx.amount).toFixed(2);
        const txDate = tx.date?.split("T")[0] ?? new Date().toISOString().split("T")[0];
        const description = tx.description ?? tx.descriptionRaw ?? "Transação importada";

        await db.insert(transactionsTable).values({
          userId: user.id,
          type: isExpense ? "expense" : "income",
          amount,
          description,
          date: txDate,
          categoryId: defaultCategoryId,
          walletId,
          pluggyTransactionId: tx.id,
        });

        imported++;
      }

      logger.info({ walletId, accountId: account.id, imported }, "pluggy: account connected");
    }

    res.json({
      ok: true,
      walletsCreated: createdWallets.length,
      accountsConnected: accounts.length,
    });
  } catch (err: any) {
    logger.error({ err }, "pluggy: connect failed");
    res.status(500).json({ error: "Falha ao importar dados bancários. Tente novamente." });
  }
});

// ─── POST /pluggy/sync/:walletId ──────────────────────────────────────────────
// Sync latest transactions for a specific wallet already connected via Pluggy
router.post("/pluggy/sync/:walletId", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const walletId = parseInt(req.params["walletId"] as string);

  const [wallet] = await db
    .select()
    .from(walletsTable)
    .where(and(eq(walletsTable.id, walletId), eq(walletsTable.userId, user.id)))
    .limit(1);

  if (!wallet) {
    res.status(404).json({ error: "Carteira não encontrada." });
    return;
  }

  if (!wallet.pluggyAccountId) {
    res.status(400).json({ error: "Esta carteira não está vinculada ao Open Finance." });
    return;
  }

  try {
    const defaultCategoryResult = await db
      .select()
      .from(categoriesTable)
      .where(and(eq(categoriesTable.isDefault, true), eq(categoriesTable.type, "both")))
      .limit(1);
    const defaultCategoryId = defaultCategoryResult[0]?.id ?? 1;

    const from = new Date();
    from.setDate(from.getDate() - 30);
    const fromStr = from.toISOString().split("T")[0];

    const { results: txs } = await getTransactions(wallet.pluggyAccountId, { from: fromStr });

    let imported = 0;
    for (const tx of txs) {
      const dupCheck = await db
        .select({ id: transactionsTable.id })
        .from(transactionsTable)
        .where(and(
          eq(transactionsTable.userId, user.id),
          eq(transactionsTable.pluggyTransactionId, tx.id),
        ))
        .limit(1);

      if (dupCheck.length) continue;

      const isExpense = tx.type === "DEBIT" || tx.amount < 0;
      const amount = Math.abs(tx.amount).toFixed(2);
      const txDate = tx.date?.split("T")[0] ?? new Date().toISOString().split("T")[0];
      const description = tx.description ?? tx.descriptionRaw ?? "Transação importada";

      await db.insert(transactionsTable).values({
        userId: user.id,
        type: isExpense ? "expense" : "income",
        amount,
        description,
        date: txDate,
        categoryId: defaultCategoryId,
        walletId,
        pluggyTransactionId: tx.id,
      });

      imported++;
    }

    res.json({ ok: true, imported });
  } catch (err: any) {
    logger.error({ err }, "pluggy: sync failed");
    res.status(500).json({ error: "Falha ao sincronizar transações. Tente novamente." });
  }
});

// ─── DELETE /pluggy/disconnect/:walletId ──────────────────────────────────────
// Removes the Pluggy link from a wallet (keeps transactions)
router.delete("/pluggy/disconnect/:walletId", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const walletId = parseInt(req.params["walletId"] as string);

  await db
    .update(walletsTable)
    .set({ pluggyItemId: null, pluggyAccountId: null })
    .where(and(eq(walletsTable.id, walletId), eq(walletsTable.userId, user.id)));

  res.json({ ok: true });
});

export default router;

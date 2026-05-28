/**
 * fix-pluggy-balances.ts
 *
 * Recalculates initial_balance for all wallets already connected via Pluggy
 * that may have an inflated initial_balance due to a bug fixed in a later
 * version of /pluggy/connect.
 *
 * Formula:
 *   initial_balance = current_pluggy_balance - net_imported_transactions
 *
 * Where net_imported_transactions = SUM(income txs) - SUM(expense txs)
 * counting only transactions with a pluggy_transaction_id (i.e. imported from Pluggy).
 *
 * Run:
 *   DATABASE_URL=... PLUGGY_CLIENT_ID=... PLUGGY_CLIENT_SECRET=... \
 *     pnpm --filter @workspace/scripts run fix-pluggy-balances
 *
 * Or with a .env file in the project root:
 *   pnpm --filter @workspace/scripts run fix-pluggy-balances
 */

import "dotenv/config";
import axios from "axios";
import { db, walletsTable, transactionsTable } from "@workspace/db";
import { eq, and, isNotNull, sql } from "drizzle-orm";

const PLUGGY_BASE = "https://api.pluggy.ai";

// ── Pluggy auth ───────────────────────────────────────────────────────────────

async function getPluggyApiKey(): Promise<string> {
  const clientId = process.env.PLUGGY_CLIENT_ID;
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET são obrigatórios. " +
        "Defina as variáveis de ambiente antes de rodar o script."
    );
  }

  const response = await axios.post(`${PLUGGY_BASE}/auth`, {
    clientId,
    clientSecret,
  });

  return response.data.apiKey as string;
}

async function getAccountBalance(
  accountId: string,
  apiKey: string
): Promise<number | null> {
  try {
    const response = await axios.get(`${PLUGGY_BASE}/accounts/${accountId}`, {
      headers: { "X-API-KEY": apiKey },
    });
    const balance = response.data?.balance;
    return typeof balance === "number" ? balance : null;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      console.warn(`  [AVISO] Conta ${accountId} não encontrada no Pluggy (404). Pulando.`);
      return null;
    }
    throw err;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== fix-pluggy-balances ===\n");

  // 1. Get Pluggy API key
  console.log("Autenticando com Pluggy...");
  const apiKey = await getPluggyApiKey();
  console.log("Autenticado com sucesso.\n");

  // 2. Find all wallets with a pluggy_account_id
  const pluggyWallets = await db
    .select()
    .from(walletsTable)
    .where(isNotNull(walletsTable.pluggyAccountId));

  if (pluggyWallets.length === 0) {
    console.log("Nenhuma carteira vinculada ao Pluggy encontrada. Nada a fazer.");
    return;
  }

  console.log(`Encontradas ${pluggyWallets.length} carteira(s) vinculada(s) ao Pluggy.\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const wallet of pluggyWallets) {
    console.log(`Carteira #${wallet.id} — "${wallet.name}" (account: ${wallet.pluggyAccountId})`);

    try {
      // 3. Fetch current balance from Pluggy
      const currentBalance = await getAccountBalance(wallet.pluggyAccountId!, apiKey);

      if (currentBalance === null) {
        console.log("  Pulando — saldo não disponível.\n");
        skipped++;
        continue;
      }

      console.log(`  Saldo atual (Pluggy): R$ ${currentBalance.toFixed(2)}`);

      // 4. Calculate net of all Pluggy-imported transactions for this wallet
      //    Only count rows with pluggy_transaction_id to avoid counting manual entries.
      const netResult = await db
        .select({
          netIncome: sql<string>`COALESCE(SUM(CASE WHEN type = 'income' THEN amount::numeric ELSE 0 END), 0)`,
          netExpense: sql<string>`COALESCE(SUM(CASE WHEN type = 'expense' THEN amount::numeric ELSE 0 END), 0)`,
        })
        .from(transactionsTable)
        .where(
          and(
            eq(transactionsTable.walletId, wallet.id),
            isNotNull(transactionsTable.pluggyTransactionId)
          )
        );

      const netIncome = parseFloat(netResult[0]?.netIncome ?? "0");
      const netExpense = parseFloat(netResult[0]?.netExpense ?? "0");
      const netImported = netIncome - netExpense;

      console.log(
        `  Transações importadas: receitas R$ ${netIncome.toFixed(2)}, ` +
          `despesas R$ ${netExpense.toFixed(2)}, líquido R$ ${netImported.toFixed(2)}`
      );

      // 5. Compute correct initial_balance
      //    initial_balance + net_imported = current_balance
      //    => initial_balance = current_balance - net_imported
      const correctInitialBalance = currentBalance - netImported;
      const oldInitialBalance = parseFloat(wallet.initialBalance);

      console.log(`  initial_balance anterior: R$ ${oldInitialBalance.toFixed(2)}`);
      console.log(`  initial_balance corrigido: R$ ${correctInitialBalance.toFixed(2)}`);

      if (Math.abs(correctInitialBalance - oldInitialBalance) < 0.005) {
        console.log("  Sem alteração necessária (diferença < R$ 0,01).\n");
        skipped++;
        continue;
      }

      // 6. Update the wallet
      await db
        .update(walletsTable)
        .set({ initialBalance: correctInitialBalance.toFixed(2) })
        .where(eq(walletsTable.id, wallet.id));

      console.log("  Atualizado com sucesso.\n");
      updated++;
    } catch (err: any) {
      console.error(`  [ERRO] Falha ao processar carteira #${wallet.id}: ${err?.message ?? err}\n`);
      errors++;
    }
  }

  console.log("=== Resumo ===");
  console.log(`  Atualizadas: ${updated}`);
  console.log(`  Sem alteração: ${skipped}`);
  console.log(`  Erros: ${errors}`);

  if (errors > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Erro fatal:", err?.message ?? err);
  process.exit(1);
});

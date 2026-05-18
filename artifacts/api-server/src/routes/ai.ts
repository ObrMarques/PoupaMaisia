import { Router } from "express";
import {
  db,
  aiConversationsTable,
  aiMessagesTable,
  transactionsTable,
  walletsTable,
  goalsTable,
  categoriesTable,
} from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { authMiddleware, getUser } from "../lib/auth";
import { ai } from "@workspace/integrations-gemini-ai";

const router = Router();

async function buildFinancialContext(userId: number): Promise<string> {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [transactions, wallets, goals, categories] = await Promise.all([
    db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, userId))
      .orderBy(desc(transactionsTable.date))
      .limit(50),
    db.select().from(walletsTable).where(eq(walletsTable.userId, userId)),
    db.select().from(goalsTable).where(eq(goalsTable.userId, userId)),
    db
      .select()
      .from(categoriesTable)
      .where(
        sql`${categoriesTable.userId} IS NULL OR ${categoriesTable.userId} = ${userId}`
      ),
  ]);

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const monthTx = transactions.filter((t) => new Date(t.date) >= firstOfMonth);
  const monthIncome = monthTx
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + parseFloat(t.amount), 0);
  const monthExpense = monthTx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + parseFloat(t.amount), 0);

  const totalBalance = wallets.reduce(
    (s, w) => s + parseFloat(w.initialBalance ?? "0"),
    0
  );

  const recentTx = transactions.slice(0, 15).map((t) => ({
    tipo: t.type === "income" ? "RECEITA" : "DESPESA",
    valor: parseFloat(t.amount).toFixed(2),
    categoria: catMap[t.categoryId ?? 0] ?? "Sem categoria",
    data: new Date(t.date).toLocaleDateString("pt-BR"),
    descricao: t.description ?? "",
  }));

  const goalsInfo = goals.map((g) => ({
    nome: g.name,
    meta: parseFloat(g.targetAmount).toFixed(2),
    atual: parseFloat(g.currentAmount).toFixed(2),
    progresso: Math.round(
      (parseFloat(g.currentAmount) / parseFloat(g.targetAmount)) * 100
    ),
    prazo: g.deadline
      ? new Date(g.deadline).toLocaleDateString("pt-BR")
      : "Sem prazo",
  }));

  const walletsInfo = wallets.map((w) => ({
    nome: w.name,
    saldo: parseFloat(w.initialBalance ?? "0").toFixed(2),
  }));

  const expenseByCategory: Record<string, number> = {};
  monthTx
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const cat = catMap[t.categoryId ?? 0] ?? "Sem categoria";
      expenseByCategory[cat] = (expenseByCategory[cat] ?? 0) + parseFloat(t.amount);
    });

  const topCategories = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return `
=== DADOS FINANCEIROS DO USUÁRIO (${new Date().toLocaleDateString("pt-BR")}) ===

RESUMO DO MÊS ATUAL (${now.toLocaleString("pt-BR", { month: "long", year: "numeric" })}):
- Receitas: R$ ${monthIncome.toFixed(2)}
- Despesas: R$ ${monthExpense.toFixed(2)}
- Saldo do mês: R$ ${(monthIncome - monthExpense).toFixed(2)}
- Total de transações no mês: ${monthTx.length}

MAIORES CATEGORIAS DE GASTO NO MÊS:
${topCategories.length ? topCategories.map(([cat, val]) => `- ${cat}: R$ ${val.toFixed(2)}`).join("\n") : "- Sem dados de categorias"}

CARTEIRAS E SALDOS:
${walletsInfo.length ? walletsInfo.map((w) => `- ${w.nome}: R$ ${w.saldo}`).join("\n") : "- Nenhuma carteira cadastrada"}
Patrimônio total: R$ ${totalBalance.toFixed(2)}

METAS FINANCEIRAS:
${goalsInfo.length ? goalsInfo.map((g) => `- ${g.nome}: R$ ${g.atual}/${g.meta} (${g.progresso}%) — Prazo: ${g.prazo}`).join("\n") : "- Nenhuma meta cadastrada"}

ÚLTIMAS TRANSAÇÕES:
${recentTx.length ? recentTx.map((t) => `- ${t.data} | ${t.tipo} | R$ ${t.valor} | ${t.categoria}${t.descricao ? ` — ${t.descricao}` : ""}`).join("\n") : "- Nenhuma transação registrada"}
=====================================`;
}

const SYSTEM_PROMPT = `Você é o PoupaAI, assistente financeiro pessoal inteligente e premium do aplicativo PoupaMais. Você é especialista em finanças pessoais brasileiras.

DIRETRIZES:
- Responda em português brasileiro, de forma clara, objetiva e personalizada
- Analise os dados financeiros reais do usuário antes de responder
- Ofereça insights acionáveis com base nos dados reais
- Use tom profissional mas acolhedor — como um consultor financeiro de confiança
- Valores sempre em Reais (R$), use referências brasileiras (Tesouro Direto, CDI, IPCA, PIX, etc.)
- Formate bem as respostas com listas e tópicos quando adequado
- Se os dados forem insuficientes, oriente como começar a registrar
- Não repita os dados brutos — interprete-os e gere insights

CAPACIDADES:
- Analisar padrões de gastos e receitas
- Identificar oportunidades de economia
- Avaliar progresso de metas financeiras
- Detectar alertas financeiros (gastos excessivos, metas atrasadas, saldo negativo)
- Gerar resumo mensal completo
- Recomendar estratégias de investimento básicas
- Orientar sobre organização financeira`;

router.post("/ai/stream", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const { message, conversationId } = req.body as {
    message: string;
    conversationId?: number;
  };

  if (!message?.trim()) {
    res.status(400).json({ error: "Mensagem não pode ser vazia" });
    return;
  }

  let convId = conversationId;

  if (!convId) {
    const [conv] = await db
      .insert(aiConversationsTable)
      .values({
        userId: user.id,
        title: message.slice(0, 60),
        updatedAt: new Date(),
      })
      .returning();
    convId = conv.id;
  } else {
    const conv = await db
      .select()
      .from(aiConversationsTable)
      .where(
        and(
          eq(aiConversationsTable.id, convId),
          eq(aiConversationsTable.userId, user.id)
        )
      )
      .limit(1);
    if (!conv.length) {
      res.status(404).json({ error: "Conversa não encontrada" });
      return;
    }
    await db
      .update(aiConversationsTable)
      .set({ updatedAt: new Date() })
      .where(eq(aiConversationsTable.id, convId));
  }

  await db.insert(aiMessagesTable).values({
    conversationId: convId,
    role: "user",
    content: message,
  });

  const [financialContext, allHistory] = await Promise.all([
    buildFinancialContext(user.id),
    db
      .select()
      .from(aiMessagesTable)
      .where(eq(aiMessagesTable.conversationId, convId))
      .orderBy(aiMessagesTable.createdAt),
  ]);

  const historyMessages = allHistory
    .slice(0, -1)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  // Disable proxy buffering so chunks reach the client immediately
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Transfer-Encoding", "chunked");
  res.flushHeaders();

  // Send a heartbeat comment so the connection is accepted immediately
  res.write(": connected\n\n");
  (res as any).flush?.();

  let fullResponse = "";

  try {
    const geminiContents = [
      ...historyMessages.map((m) => ({
        role: m.role === "assistant" ? "model" as const : "user" as const,
        parts: [{ text: m.content }],
      })),
      { role: "user" as const, parts: [{ text: message }] },
    ];

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: geminiContents,
      config: {
        systemInstruction: SYSTEM_PROMPT + "\n\n" + financialContext,
        maxOutputTokens: 8192,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
        (res as any).flush?.();
      }
    }
  } catch (_err) {
    res.write(
      `data: ${JSON.stringify({
        error: "Erro ao processar sua mensagem. Tente novamente.",
      })}\n\n`
    );
    (res as any).flush?.();
    res.end();
    return;
  }

  if (fullResponse) {
    await db.insert(aiMessagesTable).values({
      conversationId: convId,
      role: "assistant",
      content: fullResponse,
    });
  }

  res.write(
    `data: ${JSON.stringify({ done: true, conversationId: convId })}\n\n`
  );
  (res as any).flush?.();
  res.end();
});

router.get("/ai/conversations", authMiddleware, async (req, res) => {
  const user = getUser(req);

  const convs = await db
    .select()
    .from(aiConversationsTable)
    .where(eq(aiConversationsTable.userId, user.id))
    .orderBy(desc(aiConversationsTable.updatedAt));

  res.json(
    convs.map((c) => ({
      id: c.id,
      userId: c.userId,
      title: c.title,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }))
  );
});

router.post("/ai/conversations", authMiddleware, async (req, res) => {
  const user = getUser(req);

  const [conv] = await db
    .insert(aiConversationsTable)
    .values({
      userId: user.id,
      title: "Nova conversa",
      updatedAt: new Date(),
    })
    .returning();

  res.status(201).json({
    id: conv.id,
    userId: conv.userId,
    title: conv.title,
    createdAt: conv.createdAt.toISOString(),
    updatedAt: conv.updatedAt.toISOString(),
  });
});

router.delete("/ai/conversations/:id", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const id = parseInt(req.params["id"] as string);

  const conv = await db
    .select()
    .from(aiConversationsTable)
    .where(
      and(
        eq(aiConversationsTable.id, id),
        eq(aiConversationsTable.userId, user.id)
      )
    )
    .limit(1);

  if (!conv.length) {
    res.status(404).json({ error: "Conversa não encontrada" });
    return;
  }

  await db
    .delete(aiMessagesTable)
    .where(eq(aiMessagesTable.conversationId, id));
  await db
    .delete(aiConversationsTable)
    .where(eq(aiConversationsTable.id, id));

  res.status(204).end();
});

router.get(
  "/ai/conversations/:id/messages",
  authMiddleware,
  async (req, res) => {
    const user = getUser(req);
    const id = parseInt(req.params["id"] as string);

    const conv = await db
      .select()
      .from(aiConversationsTable)
      .where(
        and(
          eq(aiConversationsTable.id, id),
          eq(aiConversationsTable.userId, user.id)
        )
      )
      .limit(1);

    if (!conv.length) {
      res.status(404).json({ error: "Conversa não encontrada" });
      return;
    }

    const messages = await db
      .select()
      .from(aiMessagesTable)
      .where(eq(aiMessagesTable.conversationId, id))
      .orderBy(aiMessagesTable.createdAt);

    res.json(
      messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      }))
    );
  }
);

export default router;

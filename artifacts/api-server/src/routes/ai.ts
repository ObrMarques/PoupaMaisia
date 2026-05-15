import { Router } from "express";
import { db, aiConversationsTable, aiMessagesTable, transactionsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { authMiddleware, getUser } from "../lib/auth";
import { ChatWithAIBody } from "@workspace/api-zod";

const router = Router();

const FINANCIAL_TIPS: Record<string, string[]> = {
  economia: [
    "Para economizar mais, recomendo aplicar a regra 50/30/20: 50% para necessidades, 30% para desejos e 20% para poupança e investimentos.",
    "Revise suas assinaturas mensais. Muitas pessoas pagam por serviços que raramente usam. Cancele o que não usa e pode economizar bastante!",
    "Considere criar um fundo de emergência equivalente a 6 meses de despesas. Isso te dá segurança financeira real.",
  ],
  dividas: [
    "Para sair das dívidas, use o método bola de neve: pague o mínimo em todas e aplique todo o extra na menor dívida. Ao quitar uma, passe o valor para a próxima.",
    "Priorize sempre as dívidas com juros mais altos primeiro (método avalanche). Cartão de crédito e cheque especial costumam ter as taxas mais abusivas.",
    "Negocie diretamente com os credores — muitas empresas oferecem descontos de 30-60% para pagamento à vista de dívidas antigas.",
  ],
  investimento: [
    "Para iniciantes, o Tesouro Selic é uma ótima opção: seguro, líquido e com rendimento acima da poupança.",
    "Diversifique seus investimentos entre renda fixa e variável conforme seu perfil de risco. Não coloque todos os ovos em uma cesta.",
    "Invista regularmente, mesmo que seja pouco. O efeito dos juros compostos ao longo do tempo é poderoso.",
  ],
  salario: [
    "A regra de ouro é: pague-se primeiro. Assim que o salário chegar, transfira automaticamente o valor da poupança antes de gastar.",
    "Crie um orçamento mensal detalhado. Saiba exatamente quanto você ganha, quanto gasta e com o quê.",
    "Considere ter pelo menos 3 contas: uma para gastos fixos, uma para gastos variáveis e uma para poupança.",
  ],
  default: [
    "Analisei seus dados financeiros. Minha principal recomendação é manter um registro fiel de todas as despesas — conhecer seus gastos é o primeiro passo para controlá-los.",
    "Finanças saudáveis se constroem com hábitos consistentes. Pequenas ações diárias têm grande impacto no longo prazo.",
    "Você está no caminho certo ao usar o PoupaMais para monitorar suas finanças. A consciência financeira é o início de uma vida financeira mais saudável.",
  ],
};

function generateAIResponse(message: string, _txCount: number): { response: string; suggestions: string[] } {
  const lower = message.toLowerCase();
  let tips: string[];
  let suggestions: string[];

  if (lower.includes("economizar") || lower.includes("poupar") || lower.includes("economia")) {
    tips = FINANCIAL_TIPS.economia;
    suggestions = ["Como criar um fundo de emergência?", "Qual o melhor app para controlar gastos?", "Como investir com pouco dinheiro?"];
  } else if (lower.includes("dívida") || lower.includes("divida") || lower.includes("débito") || lower.includes("sair")) {
    tips = FINANCIAL_TIPS.dividas;
    suggestions = ["Como negociar dívidas?", "Qual dívida pagar primeiro?", "Como evitar novas dívidas?"];
  } else if (lower.includes("investir") || lower.includes("investimento") || lower.includes("aplicar")) {
    tips = FINANCIAL_TIPS.investimento;
    suggestions = ["O que é Tesouro Selic?", "Como diversificar investimentos?", "Qual o perfil de risco ideal?"];
  } else if (lower.includes("salário") || lower.includes("salario") || lower.includes("organizar") || lower.includes("orçamento")) {
    tips = FINANCIAL_TIPS.salario;
    suggestions = ["Como fazer um orçamento mensal?", "Quanto guardar por mês?", "Como cortar gastos desnecessários?"];
  } else {
    tips = FINANCIAL_TIPS.default;
    suggestions = ["Como economizar mais?", "Como sair das dívidas?", "Como organizar meu salário?"];
  }

  const response = tips[Math.floor(Math.random() * tips.length)];
  return { response, suggestions };
}

router.post("/ai/chat", authMiddleware, async (req, res) => {
  const user = getUser(req);

  if (!user.isPremium) {
    res.status(403).json({ error: "Premium required" });
    return;
  }

  const parsed = ChatWithAIBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { message, conversationId } = parsed.data;

  let convId = conversationId;

  if (!convId) {
    const [conv] = await db.insert(aiConversationsTable).values({
      userId: user.id,
      title: message.slice(0, 50),
      updatedAt: new Date(),
    }).returning();
    convId = conv.id;
  } else {
    await db.update(aiConversationsTable).set({ updatedAt: new Date() })
      .where(and(eq(aiConversationsTable.id, convId), eq(aiConversationsTable.userId, user.id)));
  }

  await db.insert(aiMessagesTable).values({
    conversationId: convId,
    role: "user",
    content: message,
  });

  const txCount = (await db.select().from(transactionsTable).where(eq(transactionsTable.userId, user.id))).length;
  const { response, suggestions } = generateAIResponse(message, txCount);

  await db.insert(aiMessagesTable).values({
    conversationId: convId,
    role: "assistant",
    content: response,
  });

  res.json({ message: response, conversationId: convId, suggestions });
});

router.get("/ai/conversations", authMiddleware, async (req, res) => {
  const user = getUser(req);

  if (!user.isPremium) {
    res.json([]);
    return;
  }

  const convs = await db.select().from(aiConversationsTable)
    .where(eq(aiConversationsTable.userId, user.id))
    .orderBy(desc(aiConversationsTable.updatedAt));

  res.json(convs.map(c => ({
    id: c.id,
    userId: c.userId,
    title: c.title,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  })));
});

router.post("/ai/conversations", authMiddleware, async (req, res) => {
  const user = getUser(req);

  if (!user.isPremium) {
    res.status(403).json({ error: "Premium required" });
    return;
  }

  const [conv] = await db.insert(aiConversationsTable).values({
    userId: user.id,
    title: "Nova conversa",
    updatedAt: new Date(),
  }).returning();

  res.status(201).json({
    id: conv.id,
    userId: conv.userId,
    title: conv.title,
    createdAt: conv.createdAt.toISOString(),
    updatedAt: conv.updatedAt.toISOString(),
  });
});

router.get("/ai/conversations/:id/messages", authMiddleware, async (req, res) => {
  const user = getUser(req);
  const id = parseInt(req.params["id"] as string);

  const conv = await db.select().from(aiConversationsTable)
    .where(and(eq(aiConversationsTable.id, id), eq(aiConversationsTable.userId, user.id))).limit(1);
  if (!conv.length) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const messages = await db.select().from(aiMessagesTable)
    .where(eq(aiMessagesTable.conversationId, id))
    .orderBy(aiMessagesTable.createdAt);

  res.json(messages.map(m => ({
    id: m.id,
    conversationId: m.conversationId,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  })));
});

export default router;

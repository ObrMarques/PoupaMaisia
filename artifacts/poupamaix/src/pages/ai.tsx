import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles, Send, Plus, Trash2, MessageSquare, ChevronLeft, X, TrendingUp, Shield, Target, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

interface Conversation {
  id: number;
  title: string;
  updatedAt: string;
}

const QUICK_SUGGESTIONS = [
  { icon: TrendingUp,   label: "Analisar meus gastos",          msg: "Analise meus gastos do mês e me dê um diagnóstico financeiro." },
  { icon: Lightbulb,    label: "Como economizar mais?",          msg: "Com base nos meus dados, como posso economizar mais dinheiro?" },
  { icon: Shield,       label: "Alertas financeiros",            msg: "Identifique alertas financeiros nos meus dados e riscos que devo atentar." },
  { icon: Target,       label: "Progresso das minhas metas",     msg: "Como estão minhas metas financeiras? Estou no caminho certo?" },
  { icon: MessageSquare, label: "Resumo do mês",                 msg: "Faça um resumo completo das minhas finanças deste mês." },
  { icon: Lightbulb,    label: "Dicas de investimento",          msg: "Com meu perfil financeiro atual, quais investimentos você recomenda?" },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current opacity-60 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
        />
      ))}
    </div>
  );
}

function AIAvatar({ size = "sm" }: { size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const icon = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <div className={cn(dim, "rounded-full bg-foreground text-background flex items-center justify-center shrink-0 shadow-sm")}>
      <Sparkles className={icon} />
    </div>
  );
}

function MessageBubble({ msg, isLast }: { msg: Message; isLast: boolean }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3 group", isUser ? "flex-row-reverse" : "flex-row")}>
      {isUser ? (
        <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 text-xs font-semibold text-foreground">
          Eu
        </div>
      ) : (
        <AIAvatar size="sm" />
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-foreground text-background rounded-tr-sm"
            : "bg-card border border-border rounded-tl-sm shadow-sm"
        )}
      >
        {msg.streaming && !msg.content ? (
          <TypingDots />
        ) : (
          <FormattedMessage content={msg.content} />
        )}
        {msg.streaming && msg.content && isLast && (
          <span className="inline-block w-0.5 h-4 bg-current opacity-70 animate-pulse ml-0.5 align-middle" />
        )}
      </div>
    </div>
  );
}

function FormattedMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return <p key={i} className="font-semibold">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <div key={i} className="flex gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
              <p>{line.slice(2)}</p>
            </div>
          );
        }
        if (/^\d+\./.test(line)) {
          const match = line.match(/^(\d+)\.\s*(.*)/);
          if (match) {
            return (
              <div key={i} className="flex gap-2">
                <span className="text-xs font-bold opacity-60 mt-0.5 shrink-0 w-4">{match[1]}.</span>
                <p>{match[2]}</p>
              </div>
            );
          }
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

function ConversationItem({
  conv,
  active,
  onClick,
  onDelete,
}: {
  conv: Conversation;
  active: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2.5 rounded-lg group flex items-center gap-2 transition-colors text-sm",
        active
          ? "bg-foreground text-background"
          : "hover:bg-secondary text-muted-foreground hover:text-foreground"
      )}
    >
      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
      <span className="flex-1 truncate">{conv.title}</span>
      <span
        role="button"
        tabIndex={0}
        onClick={onDelete}
        onKeyDown={(e) => e.key === "Enter" && onDelete(e as unknown as React.MouseEvent)}
        className={cn(
          "p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20",
          active ? "hover:bg-background/20" : ""
        )}
        aria-label="Excluir conversa"
      >
        <Trash2 className="w-3 h-3" />
      </span>
    </button>
  );
}

async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch(`${BASE_URL}/api/ai/conversations`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

async function fetchMessages(convId: number) {
  const res = await fetch(`${BASE_URL}/api/ai/conversations/${convId}/messages`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json() as Promise<{ role: string; content: string; id: number }[]>;
}

export default function AIPage() {
  const { user } = useAuth();
  const [conversations, setConversations]   = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId]     = useState<number | null>(null);
  const [messages, setMessages]             = useState<Message[]>([]);
  const [input, setInput]                   = useState("");
  const [streaming, setStreaming]           = useState(false);
  const [showSidebar, setShowSidebar]       = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);
  const abortRef       = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConversations().then(setConversations);
  }, []);

  const loadConversation = useCallback(async (convId: number) => {
    setLoadingHistory(true);
    setActiveConvId(convId);
    setShowSidebar(false);
    try {
      const msgs = await fetchMessages(convId);
      setMessages(msgs.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const startNew = useCallback(() => {
    abortRef.current?.abort();
    setActiveConvId(null);
    setMessages([]);
    setInput("");
    setShowSidebar(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const deleteConversation = useCallback(async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await fetch(`${BASE_URL}/api/ai/conversations/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) startNew();
  }, [activeConvId, startNew]);

  const sendMessage = useCallback(async (text: string) => {
    const msg = text.trim();
    if (!msg || streaming) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setStreaming(true);
    const streamingIdx = messages.length + 1;
    setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch(`${BASE_URL}/api/ai/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortRef.current.signal,
        body: JSON.stringify({ message: msg, conversationId: activeConvId }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) =>
          prev.map((m, i) =>
            i === streamingIdx
              ? { role: "assistant", content: "Erro ao conectar com a PoupaAI. Tente novamente." }
              : m
          )
        );
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullContent += data.content;
              setMessages((prev) =>
                prev.map((m, i) =>
                  i === prev.length - 1
                    ? { role: "assistant", content: fullContent, streaming: true }
                    : m
                )
              );
            } else if (data.done) {
              if (data.conversationId && !activeConvId) {
                setActiveConvId(data.conversationId);
                const updated = await fetchConversations();
                setConversations(updated);
              }
            } else if (data.error) {
              fullContent = data.error;
            }
          } catch {
            // ignore parse errors
          }
        }
      }

      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { role: "assistant", content: fullContent || "Não consegui gerar uma resposta.", streaming: false }
            : m
        )
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m, i) =>
            i === prev.length - 1
              ? { role: "assistant", content: "Erro de conexão. Verifique sua internet e tente novamente." }
              : m
          )
        );
      }
    } finally {
      setStreaming(false);
    }
  }, [streaming, messages.length, activeConvId]);

  const isEmptyChat = messages.length === 0 && !loadingHistory;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar overlay (mobile) */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-40 md:z-auto",
          "w-64 flex flex-col bg-card border-r border-border",
          "transition-transform duration-200",
          showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <AIAvatar size="sm" />
            <span className="font-semibold text-sm">PoupaAI</span>
          </div>
          <button
            onClick={() => setShowSidebar(false)}
            className="md:hidden p-1 rounded hover:bg-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={startNew}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-secondary/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova conversa
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8 px-2">
              Suas conversas aparecerão aqui
            </p>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                active={activeConvId === conv.id}
                onClick={() => loadConversation(conv.id)}
                onDelete={(e) => deleteConversation(e, conv.id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
          <button
            onClick={() => setShowSidebar(true)}
            className="md:hidden p-1.5 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Ver histórico"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {activeConvId && (
            <button
              onClick={startNew}
              className="md:hidden p-1.5 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Nova conversa"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <AIAvatar size="sm" />
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sm">PoupaAI</h2>
            <p className="text-xs text-muted-foreground truncate">
              {streaming ? "Digitando…" : "Assistente Financeiro · Online"}
            </p>
          </div>

          <button
            onClick={startNew}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo chat
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
            </div>
          ) : isEmptyChat ? (
            /* Empty state with welcome + suggestions */
            <div className="flex flex-col items-center justify-center h-full px-4 py-8 max-w-xl mx-auto text-center">
              <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center mb-5 shadow-lg">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Olá{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! Sou o PoupaAI
              </h3>
              <p className="text-muted-foreground text-sm mb-8 max-w-sm">
                Seu assistente financeiro pessoal. Analiso seus dados reais para oferecer insights e recomendações personalizadas.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                {QUICK_SUGGESTIONS.map(({ icon: Icon, label, msg }) => (
                  <button
                    key={label}
                    onClick={() => sendMessage(msg)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-secondary hover:border-foreground/20 transition-all text-left text-sm group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary group-hover:bg-background flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                    </div>
                    <span className="text-foreground font-medium leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 py-6 space-y-5 max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  msg={msg}
                  isLast={i === messages.length - 1}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="shrink-0 px-4 pb-4 pt-3 border-t border-border bg-background">
          {/* Quick chips (only when conversation is active and not empty) */}
          {!isEmptyChat && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_SUGGESTIONS.slice(0, 4).map(({ label, msg }) => (
                <button
                  key={label}
                  onClick={() => sendMessage(msg)}
                  disabled={streaming}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-foreground/20 transition-all disabled:opacity-50 shrink-0"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex gap-2 items-end"
          >
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Pergunte sobre suas finanças…"
                disabled={streaming}
                className="w-full px-4 py-3 pr-12 rounded-2xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all disabled:opacity-60"
                data-testid="input-ai-message"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              className="w-11 h-11 rounded-2xl bg-foreground text-background flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              data-testid="button-send"
            >
              {streaming ? (
                <div className="w-4 h-4 border-2 border-background/40 border-t-background rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
          <p className="text-center text-xs text-muted-foreground/60 mt-2">
            PoupaAI analisa seus dados reais · Respostas podem conter erros
          </p>
        </div>
      </div>
    </div>
  );
}

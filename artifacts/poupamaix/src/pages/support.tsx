import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Mail, Phone, ChevronDown, ChevronUp, Search, ExternalLink, HelpCircle, BookOpen, Zap, Send } from "lucide-react";

// ─── FAQ ────────────────────────────────────────────────────────────────────
const FAQS = [
  { cat: "login",        q: "Como recuperar minha senha?",         a: "Na tela de login, clique em 'Esqueci a senha'. Você receberá um e-mail com instruções para criar uma nova senha." },
  { cat: "transactions", q: "Como adicionar uma transação?",        a: "Vá para Transações e clique em 'Nova'. Preencha tipo, valor, descrição, data e categoria. Clique em Salvar." },
  { cat: "categories",   q: "Posso criar categorias personalizadas?", a: "Sim! No formulário de nova transação, clique em 'Selecionar Categoria' e depois em 'Categoria personalizada' no rodapé." },
  { cat: "goals",        q: "Como criar uma meta financeira?",      a: "Acesse Metas e clique em 'Nova Meta'. Defina o nome, valor alvo e tipo. Você pode adicionar contribuições a qualquer momento." },
  { cat: "ai",           q: "O que é o PoupaAI?",                   a: "O PoupaAI é seu consultor financeiro com IA. Analisa seus gastos, sugere economias e responde perguntas financeiras." },
  { cat: "premium",      q: "Como funciona o Premium?",             a: "O Premium inclui PoupaAI ilimitado, relatórios avançados e exportação de extratos. R$ 9,90/mês com 7 dias grátis." },
  { cat: "login",        q: "Meus dados estão seguros?",            a: "Sim. Todos os dados são criptografados em trânsito e em repouso. Nunca compartilhamos suas informações." },
  { cat: "categories",   q: "Por que as categorias não aparecem?",  a: "Verifique sua conexão. Se persistir, saia e entre novamente. As categorias carregam automaticamente após o login." },
];

const FAQ_CATEGORIES = [
  { key: "all",          label: "Todos" },
  { key: "login",        label: "Conta & Login" },
  { key: "transactions", label: "Transações" },
  { key: "categories",   label: "Categorias" },
  { key: "goals",        label: "Metas" },
  { key: "ai",           label: "PoupaAI" },
  { key: "premium",      label: "Premium" },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-primary transition-colors">
        <span className="font-medium text-sm">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && <p className="pb-4 text-sm text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1">{a}</p>}
    </div>
  );
}

// ─── CHAT BOT ────────────────────────────────────────────────────────────────
interface Message { id: number; from: "user" | "bot"; text: string; time: string }

const QUICK_REPLIES = [
  "Como adicionar transação?",
  "Criar meta financeira",
  "O que é o PoupaAI?",
  "Como usar categorias?",
  "Problemas com login",
];

const BOT_RESPONSES: [RegExp, string][] = [
  [/senha|password|login|entrar/i,     "Para recuperar sua senha, clique em 'Esqueci a senha' na tela de login. Você receberá um e-mail em até 5 minutos."],
  [/transaç|gasto|receita|despesa/i,   "Para adicionar uma transação, vá em Transações > Nova. Preencha o tipo (receita/despesa), valor, descrição e categoria. É bem rápido! 💸"],
  [/meta|objetivo|poupança|economiz/i, "Nas Metas Financeiras você pode criar qualquer objetivo — viagem, compra, reserva de emergência. Defina o valor alvo e vá adicionando contribuições!"],
  [/categoria|categori/i,              "As categorias aparecem no formulário de transações. Você pode escolher uma padrão ou criar uma personalizada clicando em 'Categoria personalizada'."],
  [/ai|inteligência|assistente/i,      "O PoupaAI é seu consultor financeiro pessoal com IA! Ele analisa seus gastos, identifica padrões e responde perguntas financeiras. Disponível no plano Premium."],
  [/premium|assina|plano/i,            "O Premium custa R$ 9,90/mês com 7 dias grátis. Inclui PoupaAI ilimitado, relatórios avançados e exportação de extratos. Cancele quando quiser!"],
  [/cartão|card|fatura/i,              "Em Cartões você cadastra seus cartões de crédito, acompanha a fatura atual, limite disponível e dias de fechamento e vencimento."],
  [/relatório|gráfico|report/i,        "Os Relatórios mostram seus gastos por categoria, tendência mensal e comparativos. Ótimo para entender para onde vai seu dinheiro!"],
  [/oi|olá|hello|hi|bom dia|boa tarde/i, "Olá! 👋 Sou o assistente do PoupaMais. Como posso ajudar você hoje? Pode perguntar sobre transações, metas, categorias, Premium ou qualquer funcionalidade."],
  [/obrigad|thanks|valeu/i,            "Fico feliz em ajudar! 😊 Se tiver mais dúvidas, é só perguntar. Estou aqui para isso!"],
  [/problema|erro|bug|não funciona/i,  "Lamento pelo transtorno! Para problemas técnicos, tente: 1) Sair e entrar novamente, 2) Limpar o cache do navegador. Se persistir, entre em contato pelo WhatsApp ou e-mail."],
];

function getBotResponse(text: string): string {
  for (const [pattern, response] of BOT_RESPONSES) {
    if (pattern.test(text)) return response;
  }
  return "Entendido! Para dúvidas mais específicas ou problemas técnicos, nossa equipe está disponível pelo WhatsApp ou e-mail. Como mais posso ajudar?";
}

function now() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function SupportChat() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: "bot", text: "Olá! 👋 Sou o assistente virtual do PoupaMais. Estou aqui para ajudar com qualquer dúvida sobre o app. O que posso fazer por você?", time: now() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg) return;
    setInput("");

    const userMsg: Message = { id: Date.now(), from: "user", text: msg, time: now() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const response = getBotResponse(msg);
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, from: "bot", text: response, time: now() }]);
    }, 900 + Math.random() * 600);
  };

  return (
    <div className="flex flex-col h-[520px] bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-secondary/30">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center font-bold text-sm text-primary-foreground">P</div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#00C851] border-2 border-card rounded-full" />
        </div>
        <div>
          <p className="font-semibold text-sm">{t("support.chatTitle")}</p>
          <p className="text-xs text-[#00C851] font-medium">{t("support.chatOnline")}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] space-y-0.5 ${msg.from === "user" ? "items-end" : "items-start"} flex flex-col`}>
              <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.from === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-secondary text-foreground rounded-bl-sm"
              }`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-muted-foreground px-1">{msg.time}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-secondary px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick replies */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide border-t border-border/50">
        {QUICK_REPLIES.map(r => (
          <button
            key={r}
            onClick={() => sendMessage(r)}
            className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
          >
            {r}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder={t("support.chatPlaceholder")}
          className="bg-secondary border-0 text-sm"
        />
        <Button size="icon" className="shrink-0 h-10 w-10" onClick={() => sendMessage()} disabled={!input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function Support() {
  const { t } = useI18n();
  const [search, setSearch]   = useState("");
  const [faqCat, setFaqCat]   = useState("all");
  const [activeTab, setActiveTab] = useState<"faq" | "chat">("chat");

  const filteredFaqs = FAQS.filter(f =>
    (faqCat === "all" || f.cat === faqCat) &&
    (!search.trim() || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("support.title")}</h1>
        <p className="text-muted-foreground">{t("support.subtitle")}</p>
      </div>

      {/* Contact channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="https://wa.me/5511999999999?text=Olá,%20preciso%20de%20ajuda%20com%20o%20PoupaMais" target="_blank" rel="noopener noreferrer">
          <Card className="bg-card border-border hover:border-[#00C851]/50 hover:bg-[#00C851]/5 transition-all cursor-pointer group h-full">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#00C851]/10 flex items-center justify-center group-hover:bg-[#00C851]/20 transition-colors">
                <Phone className="w-6 h-6 text-[#00C851]" />
              </div>
              <div><p className="font-semibold">{t("support.whatsapp")}</p><p className="text-sm text-muted-foreground">Resposta em minutos</p></div>
              <div className="flex items-center gap-1 text-xs text-[#00C851] font-medium"><span>Abrir conversa</span><ExternalLink className="w-3 h-3" /></div>
            </CardContent>
          </Card>
        </a>
        <a href="mailto:poupamaisia@gmail.com">
          <Card className="bg-card border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group h-full">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div><p className="font-semibold">{t("support.email")}</p><p className="text-sm text-muted-foreground">Resposta em até 24h</p></div>
              <div className="flex items-center gap-1 text-xs text-primary font-medium"><span>Enviar e-mail</span><ExternalLink className="w-3 h-3" /></div>
            </CardContent>
          </Card>
        </a>
        <button onClick={() => setActiveTab("chat")}>
          <Card className={`bg-card border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group h-full ${activeTab === "chat" ? "border-primary" : ""}`}>
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div><p className="font-semibold">{t("support.chat")}</p></div>
              <div className="flex items-center gap-1 text-xs text-[#00C851] font-medium"><Zap className="w-3 h-3" /><span>Online agora</span></div>
            </CardContent>
          </Card>
        </button>
      </div>

      {/* Tabs: Chat | FAQ */}
      <div>
        <div className="flex gap-1 p-1 bg-secondary rounded-lg w-fit mb-6">
          {(["chat", "faq"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "chat" ? "Chat de Suporte" : t("support.faqTitle")}
            </button>
          ))}
        </div>

        {activeTab === "chat" ? (
          <SupportChat />
        ) : (
          <div className="space-y-4">
            {/* FAQ filters */}
            <div className="flex flex-wrap gap-2">
              {FAQ_CATEGORIES.map(c => (
                <button
                  key={c.key}
                  onClick={() => setFaqCat(c.key)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    faqCat === c.key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`${t("common.search")} nas perguntas...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-card"
              />
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma pergunta encontrada.</p>
                  </div>
                ) : (
                  filteredFaqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* CTA */}
      <Card className="bg-card border-border">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold">{t("support.notFound")}</p>
            <p className="text-sm text-muted-foreground">Nossa equipe está pronta para ajudar você.</p>
          </div>
          <div className="flex gap-3">
            <a href="mailto:poupamaisia@gmail.com">
              <Button variant="outline" className="bg-background"><Mail className="w-4 h-4 mr-2" />{t("support.sendEmail")}</Button>
            </a>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
              <Button><Phone className="w-4 h-4 mr-2" />{t("support.whatsapp")}</Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

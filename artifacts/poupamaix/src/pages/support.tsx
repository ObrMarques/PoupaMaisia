import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Mail, Phone, ChevronDown, ChevronUp, Search, ExternalLink, HelpCircle, Zap, Send } from "lucide-react";

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

interface Message { id: number; from: "user" | "bot"; text: string; time: string }

function now() {
  return new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function SupportChat() {
  const { t } = useI18n();

  const BOT_RESPONSES: [RegExp, string][] = [
    [/senha|password|login|entrar|contraseña|mot de passe/i,     t("support.faq1a")],
    [/transaç|gasto|receita|despesa|transacc|ingreso|transaction/i, t("support.faq2a")],
    [/meta|objetivo|poupança|economiz|ahorro|objectif|épargne/i,  t("support.faq4a")],
    [/categoria|categori|catégorie/i,                             t("support.faq3a")],
    [/ai|inteligência|assistente|asistente|assistant/i,           t("support.faq5a")],
    [/premium|assina|plano|suscri|abonnement/i,                   t("support.faq6a")],
    [/relatório|gráfico|report|rapport/i,                         `${t("nav.reports")}: ${t("reports.subtitle")}`],
    [/oi|olá|hello|hi|bom dia|boa tarde|hola|bonjour/i,          t("support.botGreeting")],
    [/obrigad|thanks|valeu|gracias|merci/i,                       t("support.chatOnline")],
    [/problema|erro|bug|não funciona|error|problème/i,            t("support.faq8a")],
  ];

  const getBotResponse = (text: string): string => {
    for (const [pattern, response] of BOT_RESPONSES) {
      if (pattern.test(text)) return response;
    }
    return t("support.botFallback");
  };

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: "bot", text: t("support.botGreeting"), time: now() },
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

  const quickReplies = [t("support.qr1"), t("support.qr2"), t("support.qr3"), t("support.qr4"), t("support.qr5")];

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
        {quickReplies.map(r => (
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

export default function Support() {
  const { t } = useI18n();
  const [search, setSearch]   = useState("");
  const [faqCat, setFaqCat]   = useState("all");
  const [activeTab, setActiveTab] = useState<"faq" | "chat">("chat");

  const FAQS = [
    { cat: "login",        q: t("support.faq1q"), a: t("support.faq1a") },
    { cat: "transactions", q: t("support.faq2q"), a: t("support.faq2a") },
    { cat: "categories",   q: t("support.faq3q"), a: t("support.faq3a") },
    { cat: "goals",        q: t("support.faq4q"), a: t("support.faq4a") },
    { cat: "ai",           q: t("support.faq5q"), a: t("support.faq5a") },
    { cat: "premium",      q: t("support.faq6q"), a: t("support.faq6a") },
    { cat: "login",        q: t("support.faq7q"), a: t("support.faq7a") },
    { cat: "categories",   q: t("support.faq8q"), a: t("support.faq8a") },
  ];

  const FAQ_CATEGORIES = [
    { key: "all",          label: t("support.faqAll") },
    { key: "login",        label: t("support.faqLogin") },
    { key: "transactions", label: t("support.faqTransactions") },
    { key: "categories",   label: t("support.faqCategories") },
    { key: "goals",        label: t("support.faqGoals") },
    { key: "ai",           label: t("support.faqAI") },
    { key: "premium",      label: t("support.faqPremium") },
  ];

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
              <div><p className="font-semibold">{t("support.whatsapp")}</p><p className="text-sm text-muted-foreground">{t("support.responseMinutes")}</p></div>
              <div className="flex items-center gap-1 text-xs text-[#00C851] font-medium"><span>{t("support.openConversation")}</span><ExternalLink className="w-3 h-3" /></div>
            </CardContent>
          </Card>
        </a>
        <a href="mailto:suporte.poupamaisbr@gmail.com">
          <Card className="bg-card border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group h-full">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div><p className="font-semibold">{t("support.email")}</p><p className="text-sm text-muted-foreground">{t("support.responseHours")}</p></div>
              <div className="flex items-center gap-1 text-xs text-primary font-medium"><span>{t("support.sendEmailLink")}</span><ExternalLink className="w-3 h-3" /></div>
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
              <div className="flex items-center gap-1 text-xs text-[#00C851] font-medium"><Zap className="w-3 h-3" /><span>{t("support.onlineNow")}</span></div>
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
              {tab === "chat" ? t("support.chatTab") : t("support.faqTitle")}
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
                placeholder={t("support.searchFaqs")}
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
                    <p>{t("support.noFaqFound")}</p>
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
            <p className="text-sm text-muted-foreground">{t("support.teamReady")}</p>
          </div>
          <div className="flex gap-3">
            <a href="mailto:suporte.poupamaisbr@gmail.com">
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

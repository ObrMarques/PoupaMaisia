import {
  Crown, Bot, Bell, Wallet, Target, Zap, Star,
  CheckCircle2, ChevronRight, ArrowRight,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";

const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/6oUbJ12gi04T2Ix4L6gMw00";

const BENEFITS = [
  {
    icon: Bot,
    title: "PoupaAI — Assistente Financeira",
    description: "Assistente inteligente com IA que analisa seus dados reais e dá conselhos financeiros personalizados em tempo real.",
    highlight: true,
  },
  {
    icon: Bell,
    title: "Alertas Inteligentes",
    description: "Receba avisos automáticos quando estiver gastando acima do esperado em alguma categoria.",
    highlight: false,
  },
  {
    icon: Wallet,
    title: "Carteiras Ilimitadas",
    description: "Crie quantas carteiras precisar — corrente, poupança, investimentos, dinheiro físico e muito mais.",
    highlight: false,
  },
  {
    icon: Target,
    title: "Metas Ilimitadas",
    description: "Organize metas financeiras ilimitadas com barras de progresso, prazos e contribuições personalizadas.",
    highlight: false,
  },
  {
    icon: Zap,
    title: "Recursos Premium",
    description: "Acesso antecipado a novas funcionalidades e relatórios avançados antes de todos.",
    highlight: false,
  },
];

const INCLUDED = [
  "7 dias gratuitos para testar",
  "Cancele quando quiser",
  "Suporte prioritário",
  "Sem taxas ocultas",
];

export default function Premium() {
  const { isPremium } = useSubscription();

  return (
    <div className="min-h-full bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative px-4 pt-10 pb-8 md:pt-16 md:pb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-foreground shadow-2xl mx-auto mb-6">
            <Crown className="w-10 h-10 text-background" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Poupa Mais Premium
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Desbloqueie recursos avançados para controlar melhor sua vida financeira.
          </p>
          {isPremium && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Você já é Premium
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-12 max-w-2xl mx-auto space-y-6">

        {/* Benefits */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
            O que está incluído
          </p>
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                  b.highlight
                    ? "border-foreground/20 bg-card shadow-sm"
                    : "border-border bg-card hover:border-foreground/10"
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  b.highlight ? "bg-foreground" : "bg-secondary"
                }`}>
                  <Icon className={`w-5 h-5 ${b.highlight ? "text-background" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-sm">{b.title}</p>
                    {b.highlight && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-foreground text-background text-[10px] font-semibold">
                        <Star className="w-2.5 h-2.5 fill-background" />
                        Destaque
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.description}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              </div>
            );
          })}
        </div>

        {/* Price card */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Plano Premium</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">R$ 9,90</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                <Crown className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <ul className="space-y-2.5">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {isPremium ? (
              <Link href="/settings">
                <Button variant="outline" className="w-full h-12 font-semibold">
                  Gerenciar assinatura
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <a href={STRIPE_CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full h-12 text-base font-semibold">
                  Assinar Premium
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </a>
            )}

            <p className="text-center text-xs text-muted-foreground">
              {isPremium ? (
                <>Obrigado por ser Premium!</>
              ) : (
                <>
                  Já assinante?{" "}
                  <Link href="/settings" className="underline underline-offset-2 hover:text-foreground transition-colors">
                    Gerenciar plano
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

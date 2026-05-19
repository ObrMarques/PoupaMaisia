import { Bot, Bell, Wallet, Target, Lock, Star, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/test_fZuaEQfTB7AHem6cA5frW01";

const benefits = [
  {
    icon: Bot,
    title: "PoupaAI exclusivo",
    description: "Assistente financeiro inteligente que analisa seus dados reais e dá conselhos personalizados em tempo real.",
    locked: false,
  },
  {
    icon: Bell,
    title: "Alertas inteligentes",
    description: "Receba notificações quando estiver gastando mais que o normal em alguma categoria.",
    locked: true,
  },
  {
    icon: Wallet,
    title: "Carteiras ilimitadas",
    description: "Crie quantas carteiras precisar: corrente, poupança, investimentos, dinheiro físico e mais.",
    locked: false,
  },
  {
    icon: Target,
    title: "Metas ilimitadas",
    description: "Defina e acompanhe metas financeiras ilimitadas com barras de progresso e prazos personalizados.",
    locked: false,
  },
];

export default function Premium() {
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center mx-auto shadow-lg">
          <Star className="w-7 h-7 text-background fill-background" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">PoupaMais Premium</h1>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Desbloqueie todo o potencial do PoupaMais e transforme sua vida financeira.
        </p>
      </div>
      {/* Benefits list */}
      <div className="space-y-3">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div
              key={benefit.title}
              className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                benefit.locked
                  ? "border-border bg-card/50 opacity-70"
                  : "border-border bg-card hover:border-foreground/20"
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                benefit.locked ? "bg-secondary" : "bg-foreground"
              }`}>
                <Icon className={`w-5 h-5 ${benefit.locked ? "text-muted-foreground" : "text-background"}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{benefit.title}</p>
                  {benefit.locked && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary border border-border text-[10px] font-medium text-muted-foreground">
                      <Lock className="w-2.5 h-2.5" />
                      Disponível no Prêmio
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {benefit.description}
                </p>
              </div>

              {benefit.locked && (
                <Lock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
            </div>
          );
        })}
      </div>
      {/* CTA */}
      <div className="space-y-3 pb-4">
        <div className="p-4 rounded-2xl border border-border bg-card text-center space-y-1">
          <p className="text-xs text-muted-foreground">Plano Premium</p>
          <p className="text-2xl font-bold">R$ 9,90<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
          <p className="text-xs text-muted-foreground">7 dias grátis · Cancele quando quiser</p>
        </div>

        <a href={STRIPE_CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className="block w-full">
          <Button className="w-full h-12 text-sm font-semibold">
            Começar 7 dias grátis
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </a>

        <p className="text-center text-xs text-muted-foreground">
          Já assinante?{" "}
          <Link href="/settings" className="underline underline-offset-2 hover:text-foreground transition-colors">
            Gerenciar plano
          </Link>
        </p>
      </div>
    </div>
  );
}

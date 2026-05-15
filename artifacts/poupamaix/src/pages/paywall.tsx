import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Check, Lock, Sparkles, Shield, TrendingUp, MessageCircle, BarChart3, Loader2 } from "lucide-react";

const PAYMENT_LINK = "https://buy.stripe.com/6oUbJ12gi04T2Ix4L6gMw00";

const FEATURES = [
  { icon: TrendingUp,    label: "Dashboard financeiro completo" },
  { icon: BarChart3,     label: "Relatórios e gráficos avançados" },
  { icon: Check,         label: "Gestão ilimitada de transações" },
  { icon: Check,         label: "Metas financeiras personalizadas" },
  { icon: Check,         label: "Controle de cartões de crédito" },
  { icon: Sparkles,      label: "PoupaAI — assistente com IA" },
  { icon: MessageCircle, label: "Suporte prioritário" },
  { icon: Shield,        label: "Seus dados 100% seguros" },
];

interface PlanInfo {
  priceId: string;
  unitAmount: number;
  currency: string;
  interval: string;
  productName: string;
  productDescription: string | null;
}

function formatPrice(unitAmount: number, currency: string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(unitAmount / 100);
}

export default function Paywall() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [loading, setLoading]   = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [planLoading, setPlanLoading] = useState(true);

  // Fetch plan details directly from Stripe API via backend
  useEffect(() => {
    fetch("/api/stripe/plan")
      .then((r) => r.json())
      .then((data: PlanInfo) => { if (data.priceId) setPlan(data); })
      .catch(() => {})
      .finally(() => setPlanLoading(false));
  }, []);

  // Check if returning from successful Stripe checkout redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("session_id")) {
      verifyAndActivate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verifyAndActivate() {
    setRestoring(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/stripe/subscription-status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.active && data.user) {
        updateUser(data.user);
        toast({ title: "Assinatura ativada! Bem-vindo ao Premium." });
        setLocation("/dashboard");
      } else {
        toast({ title: "Aguardando confirmação do pagamento…" });
      }
    } catch {
      toast({ title: "Não foi possível verificar o pagamento.", variant: "destructive" });
    } finally {
      setRestoring(false);
    }
  }

  const handleSubscribe = () => {
    setLoading(true);
    const url = new URL(PAYMENT_LINK);
    if (user?.email) url.searchParams.set("prefilled_email", user.email);
    window.location.href = url.toString();
  };

  const handleRestoreManual = async () => {
    setRestoring(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/stripe/subscription-status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.active && data.user) {
        updateUser(data.user);
        toast({ title: "Assinatura ativa restaurada com sucesso!" });
        setLocation("/dashboard");
      } else {
        toast({ title: "Nenhuma assinatura ativa encontrada para este e-mail.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao verificar assinatura.", variant: "destructive" });
    } finally {
      setRestoring(false);
    }
  };

  const priceLabel = plan
    ? `${formatPrice(plan.unitAmount, plan.currency)}/${plan.interval === "month" ? "mês" : "ano"}`
    : "R$ 9,90/mês";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center font-black text-2xl mx-auto">
            P
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-white/80 mb-3">
              <Lock className="w-3 h-3" />
              Período de teste encerrado
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Continue usando o PoupaMais
            </h1>
            <p className="text-white/60 text-sm mt-2 leading-relaxed">
              Seus 7 dias grátis acabaram. Assine o Premium para retomar o acesso completo ao seu financeiro.
            </p>
          </div>
        </div>

        {/* Pricing card */}
        <div className="bg-white/8 border border-white/15 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider font-medium">Plano</p>
              <p className="font-bold text-lg">
                {plan?.productName ?? "PoupaMais Premium"}
              </p>
              {plan?.productDescription && (
                <p className="text-xs text-white/40 mt-0.5 max-w-[180px] leading-relaxed">
                  {plan.productDescription}
                </p>
              )}
            </div>
            <div className="text-right shrink-0 ml-4">
              {planLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white/40 ml-auto" />
              ) : (
                <>
                  <p className="text-2xl font-black">
                    {plan ? formatPrice(plan.unitAmount, plan.currency) : "R$ 9,90"}
                  </p>
                  <p className="text-xs text-white/50">
                    /{plan?.interval === "month" ? "mês" : plan?.interval === "year" ? "ano" : "mês"}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="h-px bg-white/10" />

          <ul className="space-y-2.5">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-white/80">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3 h-3 text-white" />
                </div>
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            className="w-full h-12 text-base font-bold bg-white text-black hover:bg-white/90 rounded-xl"
            onClick={handleSubscribe}
            disabled={loading || restoring}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecionando…
              </span>
            ) : (
              `Assinar Premium — ${priceLabel}`
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full h-10 text-sm text-white/60 hover:text-white hover:bg-white/5"
            onClick={handleRestoreManual}
            disabled={loading || restoring}
          >
            {restoring ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verificando…
              </span>
            ) : (
              "Restaurar compra"
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center space-y-1">
          <p className="text-xs text-white/40">
            Cancele quando quiser · Renovação automática mensal
          </p>
          <p className="text-xs text-white/40">
            Dúvidas?{" "}
            <a
              href="mailto:poupamaisia@gmail.com"
              className="text-white/60 hover:text-white transition-colors"
            >
              poupamaisia@gmail.com
            </a>
          </p>
        </div>

        {user && (
          <p className="text-center text-xs text-white/30">
            Conectado como {user.email}
          </p>
        )}
      </div>
    </div>
  );
}

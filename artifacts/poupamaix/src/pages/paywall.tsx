import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Check, Lock, Sparkles, Shield, TrendingUp, MessageCircle, BarChart3 } from "lucide-react";

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

export default function Paywall() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Falha ao ativar assinatura");
      const updated = await res.json();
      updateUser(updated);
      toast({ title: "Assinatura ativada! Bem-vindo ao Premium." });
    } catch {
      toast({ title: "Erro ao processar pagamento. Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      updateUser(updated);
      toast({ title: "Compra restaurada com sucesso!" });
    } catch {
      toast({ title: "Nenhuma compra encontrada para restaurar.", variant: "destructive" });
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Gradient background */}
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
              Seus {7} dias grátis acabaram. Assine o Premium para retomar o acesso completo ao seu financeiro.
            </p>
          </div>
        </div>

        {/* Pricing card */}
        <div className="bg-white/8 border border-white/15 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider font-medium">Plano</p>
              <p className="font-bold text-lg">PoupaMais Premium</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black">R$ 9,90</p>
              <p className="text-xs text-white/50">/mês</p>
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
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Processando...
              </span>
            ) : (
              "Assinar Premium — R$ 9,90/mês"
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full h-10 text-sm text-white/60 hover:text-white hover:bg-white/5"
            onClick={handleRestore}
            disabled={loading || restoring}
          >
            {restoring ? "Verificando..." : "Restaurar compra"}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center space-y-1">
          <p className="text-xs text-white/40">
            Cancele quando quiser · Renovação automática mensal
          </p>
          <p className="text-xs text-white/40">
            Dúvidas?{" "}
            <a href="mailto:poupamaisia@gmail.com" className="text-white/60 hover:text-white transition-colors">
              poupamaisia@gmail.com
            </a>
          </p>
        </div>

        {/* User info */}
        {user && (
          <p className="text-center text-xs text-white/30">
            Conectado como {user.email}
          </p>
        )}
      </div>
    </div>
  );
}

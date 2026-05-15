import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Shield, PieChart, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Premium() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const planRes = await fetch("/api/stripe/plan");
      const plan = await planRes.json();
      const priceId = plan?.priceId;

      if (!priceId) throw new Error("Plano indisponível no momento.");

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priceId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Falha ao criar sessão de pagamento");
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err: any) {
      toast({ title: err.message ?? "Erro ao iniciar checkout. Tente novamente.", variant: "destructive" });
      setLoading(false);
    }
  };

  if (user?.isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold">Você é membro Premium</h1>
          <p className="text-muted-foreground">Obrigado por apoiar o PoupaMais. Aproveite todos os recursos exclusivos.</p>
        </div>
      </div>
    );
  }

  const features = [
    { icon: Sparkles, title: "PoupaAI Consultor", desc: "Chat ilimitado com seu consultor financeiro pessoal por IA." },
    { icon: PieChart, title: "Relatórios Inteligentes", desc: "Análises profundas e relatórios personalizados dos seus gastos." },
    { icon: Shield, title: "Backup em Nuvem", desc: "Sincronização e backup em tempo real de todos os seus dados." },
    { icon: FileText, title: "Exportar PDF/Excel", desc: "Exporte extratos mensais elegantes para seus registros." },
  ];

  return (
    <div className="py-12 px-4 md:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4">
        <div className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
          <Sparkles className="w-3 h-3 mr-2" /> PoupaMais Premium
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Tome o controle total das suas finanças.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Desbloqueie o kit financeiro definitivo e alcance suas metas mais rápido.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
          {features.map((f, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="bg-card rounded-3xl border border-border p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

            <h3 className="text-2xl font-bold mb-2">Plano Mensal</h3>
            <p className="text-muted-foreground mb-6">Cancele quando quiser.</p>

            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-extrabold tracking-tighter">R$ 9,90</span>
              <span className="text-muted-foreground font-medium">/mês</span>
            </div>

            <ul className="space-y-4 mb-8">
              {['7 dias grátis', 'Todos os recursos premium', 'Suporte prioritário'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#00C851]" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold"
              onClick={handleUpgrade}
              disabled={loading}
              data-testid="button-upgrade"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirecionando…
                </span>
              ) : (
                "Começar 7 Dias Grátis"
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Você não será cobrado até o fim do período gratuito.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

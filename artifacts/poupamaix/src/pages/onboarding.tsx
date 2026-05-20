import { useState } from "react";
import { useLocation } from "wouter";
import { useCompleteOnboarding } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

const CURRENCIES = [
  { id: "BRL", symbol: "R$", name: "Real Brasileiro" },
  { id: "USD", symbol: "$", name: "Dólar Americano" },
  { id: "EUR", symbol: "€", name: "Euro" },
];

const CATEGORIES = [
  "Alimentação", "Mercado", "Farmácia", "Transporte", "Combustível",
  "Uber", "Moradia", "Água", "Energia", "Internet", "Streaming",
  "Educação", "Faculdade", "Investimentos", "Lazer", "Viagens",
  "Compras", "Saúde", "Academia", "Assinaturas"
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { updateUser } = useAuth();
  const { toast } = useToast();
  const completeMutation = useCompleteOnboarding();

  const [currency, setCurrency] = useState("BRL");
  const [goalName, setGoalName] = useState("Reserva de Emergência");
  const [goalAmount, setGoalAmount] = useState("10000");
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);

  const toggleCategory = (cat: string) => {
    setFavoriteCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleComplete = () => {
    completeMutation.mutate(
      {
        data: {
          currency,
          initialGoalName: goalName,
          initialGoalAmount: parseFloat(goalAmount) || 0,
          favoriteCategories,
        }
      },
      {
        onSuccess: (user) => {
          updateUser(user);
          setLocation("/dashboard");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível concluir o cadastro. Tente novamente.",
          });
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center space-x-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : i < step ? 'w-8 bg-primary/50' : 'w-2 bg-secondary'}`} />
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-background" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Bem-vindo ao PoupaMais</h2>
                <p className="text-muted-foreground">Seu assistente financeiro premium. Vamos configurar seu painel para o sucesso financeiro.</p>
              </div>
              <Button className="w-full" onClick={() => setStep(2)} data-testid="button-get-started">Começar</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">Escolha sua moeda</h2>
                <p className="text-sm text-muted-foreground mt-1">Essa será a moeda principal para todos os registros.</p>
              </div>
              <div className="space-y-3">
                {CURRENCIES.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setCurrency(c.id)}
                    className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                      currency === c.id ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currency === c.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                        {c.symbol}
                      </div>
                      <span className="font-medium">{c.name}</span>
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">{c.id}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-background" onClick={() => setStep(1)}>Voltar</Button>
                <Button className="flex-1" onClick={() => setStep(3)}>Continuar</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">Defina sua primeira meta</h2>
                <p className="text-sm text-muted-foreground mt-1">Para o que você está economizando?</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da meta</Label>
                  <Input value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="ex: Reserva de Emergência, Viagem" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Valor alvo</Label>
                  <Input type="number" value={goalAmount} onChange={e => setGoalAmount(e.target.value)} placeholder="10000" className="bg-background" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-background" onClick={() => setStep(2)}>Voltar</Button>
                <Button className="flex-1" onClick={() => setStep(4)}>Continuar</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">Categorias favoritas</h2>
                <p className="text-sm text-muted-foreground mt-1">Selecione as que você usa com mais frequência.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      favoriteCategories.includes(cat)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1 bg-background" onClick={() => setStep(3)}>Voltar</Button>
                <Button className="flex-1" onClick={handleComplete} disabled={completeMutation.isPending}>
                  {completeMutation.isPending ? "Finalizando..." : "Concluir"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useGetGoals, useCreateGoal, useContributeToGoal, getGetGoalsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/currency-input";
import { Input } from "@/components/ui/input";
import { Plus, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const GOAL_TYPES: Record<string, string> = {
  savings:   "Poupança",
  travel:    "Viagem",
  emergency: "Emergência",
  purchase:  "Compra",
  other:     "Personalizada",
};

const GOAL_ICONS: Record<string, string> = {
  savings:   "💰",
  travel:    "✈️",
  emergency: "🛡️",
  purchase:  "🛍️",
  other:     "🎯",
};

const EXAMPLES: Record<string, string[]> = {
  savings:   ["Reserva de emergência", "Fundo de aposentadoria"],
  travel:    ["Viagem para Europa", "Férias em Gramado"],
  emergency: ["3 meses de gastos", "Fundo de emergência"],
  purchase:  ["Comprar um iPhone", "Notebook novo", "Carro usado"],
  other:     ["Casa própria", "Curso online", "Negócio próprio"],
};

export default function Goals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: goals, isLoading } = useGetGoals();
  const createMutation = useCreateGoal();
  const contributeMutation = useContributeToGoal();

  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [contributeAmount, setContributeAmount] = useState("");
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [type, setType] = useState<"savings" | "travel" | "emergency" | "purchase" | "other">("savings");

  const handleCreate = () => {
    if (!name.trim() || !targetAmount) {
      toast({ title: "Preencha o nome e o valor da meta", variant: "destructive" });
      return;
    }
    createMutation.mutate(
      { data: { name: name.trim(), targetAmount: parseFloat(targetAmount), type } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetGoalsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          setIsNewGoalOpen(false);
          setName(""); setTargetAmount(""); setType("savings");
          toast({ title: "Meta criada com sucesso" });
        },
        onError: () => toast({ title: "Erro ao criar meta", variant: "destructive" })
      }
    );
  };

  const handleContribute = () => {
    if (!selectedGoalId || !contributeAmount) return;
    contributeMutation.mutate(
      { id: selectedGoalId, data: { amount: parseFloat(contributeAmount) } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetGoalsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          setIsContributeOpen(false);
          setContributeAmount("");
          toast({ title: "Contribuição adicionada!" });
        },
        onError: () => toast({ title: "Erro ao contribuir", variant: "destructive" })
      }
    );
  };

  const openContribute = (goalId: number) => {
    setSelectedGoalId(goalId);
    setContributeAmount("");
    setIsContributeOpen(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas Financeiras</h1>
          <p className="text-muted-foreground">Acompanhe suas economias e conquistas.</p>
        </div>

        <Dialog open={isNewGoalOpen} onOpenChange={setIsNewGoalOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-goal">
              <Plus className="w-4 h-4 mr-2" /> Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Meta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">

              <div className="space-y-2">
                <Label>Tipo de meta</Label>
                <Select value={type} onValueChange={(v: any) => { setType(v); setName(""); }}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(GOAL_TYPES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  {type === "other" ? "Qual é o seu objetivo?" : "Nome da meta"}
                </Label>
                <Input
                  placeholder={
                    type === "other"
                      ? "Ex: Casa própria, iPhone, Curso..."
                      : (EXAMPLES[type]?.[0] ?? "Nome da meta")
                  }
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-background"
                  data-testid="input-goal-name"
                  autoFocus={type === "other"}
                />
                {type !== "other" && EXAMPLES[type] && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {EXAMPLES[type].map(ex => (
                      <button
                        key={ex}
                        onClick={() => setName(ex)}
                        className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Valor alvo</Label>
                <CurrencyInput
                  value={targetAmount}
                  onValueChange={setTargetAmount}
                  className="bg-background text-lg font-semibold h-12"
                  data-testid="input-goal-amount"
                />
              </div>

            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewGoalOpen(false)}>Cancelar</Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending || !name.trim() || !targetAmount}
              >
                {createMutation.isPending ? "Salvando..." : "Criar Meta"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
          <DialogContent className="sm:max-w-[380px]">
            <DialogHeader>
              <DialogTitle>Adicionar Contribuição</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Quanto deseja adicionar?</Label>
                <CurrencyInput
                  value={contributeAmount}
                  onValueChange={setContributeAmount}
                  className="bg-background text-lg font-semibold h-12"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["50", "100", "250", "500", "1000"].map(v => (
                  <Button
                    key={v}
                    variant="outline"
                    size="sm"
                    className="bg-background text-xs"
                    onClick={() => setContributeAmount(v + ".00")}
                  >
                    {formatCurrency(parseFloat(v), user?.currency)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsContributeOpen(false)}>Cancelar</Button>
              <Button onClick={handleContribute} disabled={contributeMutation.isPending || !contributeAmount}>
                {contributeMutation.isPending ? "Salvando..." : "Confirmar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-xl" />)
        ) : goals?.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-card rounded-xl border border-border">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 text-3xl">🎯</div>
            <h3 className="text-lg font-semibold">Nenhuma meta ativa</h3>
            <p className="text-muted-foreground mt-1 mb-4">Comece a poupar para seus sonhos hoje.</p>
            <Button onClick={() => setIsNewGoalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Criar Primeira Meta
            </Button>
          </div>
        ) : (
          goals?.map((g) => {
            const progress = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            const remaining = g.targetAmount - g.currentAmount;
            return (
              <Card key={g.id} className="bg-card flex flex-col" data-testid={`card-goal-${g.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{g.name}</CardTitle>
                      <CardDescription>{GOAL_TYPES[g.type] || g.type}</CardDescription>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-2xl shrink-0 ml-2">
                      {GOAL_ICONS[g.type] || "🎯"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-2xl font-bold tabular-nums">{formatCurrency(g.currentAmount, user?.currency)}</div>
                      <div className="text-xs text-muted-foreground">de {formatCurrency(g.targetAmount, user?.currency)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">{progress}%</div>
                      <div className="text-xs text-muted-foreground">concluído</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-700 rounded-full"
                        style={{ width: `${progress}%`, backgroundColor: g.color || "var(--primary)" }}
                      />
                    </div>
                    {remaining > 0 ? (
                      <p className="text-xs text-muted-foreground">Faltam {formatCurrency(remaining, user?.currency)}</p>
                    ) : (
                      <p className="text-xs text-[#00C851] font-medium">✓ Meta atingida!</p>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full bg-background"
                    onClick={() => openContribute(g.id)}
                    disabled={remaining <= 0}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Adicionar Valor
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

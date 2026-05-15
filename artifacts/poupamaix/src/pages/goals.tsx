import { useState } from "react";
import { useGetGoals, useCreateGoal, useContributeToGoal, getGetGoalsQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const GOAL_TYPES: Record<string, string> = {
  savings: "Poupança",
  travel: "Viagem",
  emergency: "Emergência",
  purchase: "Compra",
  other: "Outro",
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
    if (!name || !targetAmount) return;
    createMutation.mutate(
      { data: { name, targetAmount: parseFloat(targetAmount), type } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetGoalsQueryKey() });
          setIsNewGoalOpen(false);
          setName("");
          setTargetAmount("");
          toast({ title: "Meta criada com sucesso" });
        }
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
          setIsContributeOpen(false);
          setContributeAmount("");
          toast({ title: "Contribuição adicionada!", description: `${formatCurrency(parseFloat(contributeAmount), user?.currency)} adicionado à meta.` });
        }
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Meta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome da meta</Label>
                <Input placeholder="Carro novo" value={name} onChange={e => setName(e.target.value)} data-testid="input-goal-name" />
              </div>
              <div className="space-y-2">
                <Label>Valor alvo (R$)</Label>
                <Input type="number" placeholder="50000" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} data-testid="input-goal-amount" />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Poupança</SelectItem>
                    <SelectItem value="travel">Viagem</SelectItem>
                    <SelectItem value="emergency">Emergência</SelectItem>
                    <SelectItem value="purchase">Compra</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewGoalOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>Salvar Meta</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Contribuição</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" placeholder="100" value={contributeAmount} onChange={e => setContributeAmount(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsContributeOpen(false)}>Cancelar</Button>
              <Button onClick={handleContribute} disabled={contributeMutation.isPending}>Confirmar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
        ) : goals?.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-card rounded-xl border border-border">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Nenhuma meta ativa</h3>
            <p className="text-muted-foreground mt-1">Comece a poupar para seus sonhos hoje.</p>
          </div>
        ) : (
          goals?.map((g) => {
            const progress = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            return (
              <Card key={g.id} className="bg-card flex flex-col" data-testid={`card-goal-${g.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{g.name}</CardTitle>
                      <CardDescription>{GOAL_TYPES[g.type] || g.type}</CardDescription>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                      {g.icon ? g.icon : <Target className="w-5 h-5" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <div className="text-2xl font-bold">{formatCurrency(g.currentAmount, user?.currency)}</div>
                        <div className="text-xs text-muted-foreground mt-1">de {formatCurrency(g.targetAmount, user?.currency)} meta</div>
                      </div>
                      <div className="text-xl font-bold text-primary">{progress}%</div>
                    </div>

                    <div className="h-3 w-full bg-secondary rounded-full overflow-hidden mt-4">
                      <div
                        className="h-full bg-primary transition-all duration-1000"
                        style={{ width: `${progress}%`, backgroundColor: g.color || 'var(--primary)' }}
                      />
                    </div>

                    <div className="pt-4 flex gap-2">
                      <Button variant="outline" className="w-full bg-background" onClick={() => openContribute(g.id)}>
                        + Contribuir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

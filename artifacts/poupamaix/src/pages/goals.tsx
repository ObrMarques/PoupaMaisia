import { useState } from "react";
import {
  useGetGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useContributeToGoal,
  getGetGoalsQueryKey, getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/currency-input";
import { Input } from "@/components/ui/input";
import { Plus, TrendingUp, Pencil, Trash2, Sparkles, Infinity, BarChart3, Target, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const FREE_GOAL_LIMIT = 3;
const PAYMENT_LINK = "https://buy.stripe.com/6oUbJ12gi04T2Ix4L6gMw00";

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

const GOAL_COLORS = [
  { label: "Roxo",     value: "#7C3AED" },
  { label: "Azul",     value: "#2563EB" },
  { label: "Verde",    value: "#059669" },
  { label: "Âmbar",   value: "#D97706" },
  { label: "Rosa",     value: "#DB2777" },
  { label: "Ciano",   value: "#0891B2" },
  { label: "Vermelho", value: "#DC2626" },
  { label: "Preto",    value: "#0A0A0A" },
];

const PREMIUM_BENEFITS = [
  { icon: Infinity,   text: "Metas ilimitadas" },
  { icon: BarChart3,  text: "Acompanhamento avançado" },
  { icon: Target,     text: "Metas personalizadas completas" },
  { icon: TrendingUp, text: "Análise de progresso detalhada" },
  { icon: Sparkles,   text: "Experiência premium completa" },
];

function PremiumModal({ open, onClose, userEmail }: { open: boolean; onClose: () => void; userEmail?: string }) {
  if (!open) return null;
  const handleSubscribe = () => {
    const url = new URL(PAYMENT_LINK);
    if (userEmail) url.searchParams.set("prefilled_email", userEmail);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="bg-foreground text-background px-6 pt-8 pb-6">
          <div className="w-10 h-10 rounded-xl bg-background/15 flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold">Desbloqueie metas ilimitadas</h2>
          <p className="text-background/70 text-sm mt-1">com <span className="font-semibold text-background">PoupaMais Premium</span></p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="p-3 bg-secondary/60 rounded-xl border border-border">
            <p className="text-xs text-muted-foreground text-center">
              Você atingiu o limite de <span className="font-semibold text-foreground">{FREE_GOAL_LIMIT} metas</span> do plano gratuito
            </p>
          </div>
          <ul className="space-y-2.5">
            {PREMIUM_BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-background" />
                </div>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">R$&nbsp;9,90</span>
            <span className="text-muted-foreground text-sm">/mês</span>
          </div>
          <div className="flex flex-col gap-2">
            <Button className="w-full h-11 font-semibold" onClick={handleSubscribe}>
              <Sparkles className="w-4 h-4 mr-2" /> Assinar Premium
            </Button>
            <Button variant="ghost" className="w-full h-9 text-sm text-muted-foreground" onClick={onClose}>
              Agora não
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

type GoalType = "savings" | "travel" | "emergency" | "purchase" | "other";

function GoalForm({
  name, setName, targetAmount, setTargetAmount, currentAmount, setCurrentAmount,
  type, setType, color, setColor, deadline, setDeadline, isEditing,
}: {
  name: string; setName: (v: string) => void;
  targetAmount: string; setTargetAmount: (v: string) => void;
  currentAmount: string; setCurrentAmount: (v: string) => void;
  type: GoalType; setType: (v: GoalType) => void;
  color: string; setColor: (v: string) => void;
  deadline: string; setDeadline: (v: string) => void;
  isEditing: boolean;
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label>Tipo de meta</Label>
        <Select value={type} onValueChange={(v: any) => { setType(v); if (!isEditing) setName(""); }}>
          <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(GOAL_TYPES).map(([k, v]) => (
              <SelectItem key={k} value={k}>{GOAL_ICONS[k]} {v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{type === "other" ? "Qual é o seu objetivo?" : "Nome da meta"}</Label>
        <Input
          placeholder={type === "other" ? "Ex: Casa própria, iPhone, Curso..." : (EXAMPLES[type]?.[0] ?? "Nome da meta")}
          value={name}
          onChange={e => setName(e.target.value)}
          className="bg-background"
          data-testid="input-goal-name"
        />
        {!isEditing && type !== "other" && EXAMPLES[type] && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {EXAMPLES[type].map(ex => (
              <button
                key={ex}
                type="button"
                onClick={() => setName(ex)}
                className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Valor alvo</Label>
          <CurrencyInput
            value={targetAmount}
            onValueChange={setTargetAmount}
            className="bg-background font-semibold h-11"
            data-testid="input-goal-amount"
          />
        </div>
        <div className="space-y-2">
          <Label>Valor atual <span className="text-muted-foreground text-xs">(opcional)</span></Label>
          <CurrencyInput
            value={currentAmount}
            onValueChange={setCurrentAmount}
            className="bg-background h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Prazo <span className="text-muted-foreground text-xs">(opcional)</span></Label>
        <Input
          type="date"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          className="bg-background"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">COR DA META</Label>
        <div className="grid grid-cols-8 gap-1.5">
          {GOAL_COLORS.map(c => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              onClick={() => setColor(c.value)}
              className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                color === c.value ? "border-primary scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Goals() {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: goals, isLoading } = useGetGoals();
  const createMutation     = useCreateGoal();
  const updateMutation     = useUpdateGoal();
  const deleteMutation     = useDeleteGoal();
  const contributeMutation = useContributeToGoal();

  const [isFormOpen, setIsFormOpen]               = useState(false);
  const [isContributeOpen, setIsContributeOpen]   = useState(false);
  const [showPremiumModal, setShowPremiumModal]   = useState(false);
  const [editingGoal, setEditingGoal]             = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedGoalId, setSelectedGoalId]       = useState<number | null>(null);
  const [contributeAmount, setContributeAmount]   = useState("");

  const [name, setName]                 = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [type, setType]                 = useState<GoalType>("savings");
  const [color, setColor]               = useState("#7C3AED");
  const [deadline, setDeadline]         = useState("");

  const goalCount = goals?.length ?? 0;
  const atLimit   = !isPremium && goalCount >= FREE_GOAL_LIMIT;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetGoalsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  };

  const resetForm = () => {
    setName(""); setTargetAmount(""); setCurrentAmount("0");
    setType("savings"); setColor("#7C3AED"); setDeadline("");
    setEditingGoal(null); setShowDeleteConfirm(false);
  };

  const openCreate = () => {
    if (atLimit) { setShowPremiumModal(true); return; }
    resetForm(); setIsFormOpen(true);
  };

  const openEdit = (g: any) => {
    setEditingGoal(g);
    setName(g.name);
    setTargetAmount(String(g.targetAmount));
    setCurrentAmount(String(g.currentAmount));
    setType(g.type);
    setColor(g.color || "#7C3AED");
    setDeadline(g.deadline ? String(g.deadline).split("T")[0] : "");
    setShowDeleteConfirm(false);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !targetAmount) {
      toast({ title: "Preencha o nome e o valor da meta", variant: "destructive" });
      return;
    }
    const payload = {
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      type,
      color,
      deadline: deadline || null,
    };

    if (editingGoal) {
      updateMutation.mutate(
        { id: editingGoal.id, data: payload },
        {
          onSuccess: () => { invalidate(); setIsFormOpen(false); resetForm(); toast({ title: "Meta atualizada" }); },
          onError: () => toast({ title: "Erro ao atualizar meta", variant: "destructive" }),
        }
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: () => { invalidate(); setIsFormOpen(false); resetForm(); toast({ title: "Meta criada" }); },
          onError: (err: any) => {
            if (err?.response?.status === 403) { setIsFormOpen(false); setShowPremiumModal(true); }
            else toast({ title: "Erro ao criar meta", variant: "destructive" });
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (!editingGoal) return;
    deleteMutation.mutate(
      { id: editingGoal.id },
      {
        onSuccess: () => { invalidate(); setIsFormOpen(false); resetForm(); toast({ title: "Meta excluída" }); },
        onError: () => toast({ title: "Erro ao excluir meta", variant: "destructive" }),
      }
    );
  };

  const openContribute = (goalId: number) => {
    setSelectedGoalId(goalId);
    setContributeAmount("");
    setIsContributeOpen(true);
  };

  const handleContribute = () => {
    if (!selectedGoalId || !contributeAmount) return;
    contributeMutation.mutate(
      { id: selectedGoalId, data: { amount: parseFloat(contributeAmount) } },
      {
        onSuccess: () => {
          invalidate();
          setIsContributeOpen(false);
          setContributeAmount("");
          toast({ title: "Contribuição adicionada!" });
        },
        onError: () => toast({ title: "Erro ao contribuir", variant: "destructive" }),
      }
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <PremiumModal open={showPremiumModal} onClose={() => setShowPremiumModal(false)} userEmail={user?.email} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas Financeiras</h1>
          <p className="text-muted-foreground">Acompanhe suas economias e conquistas.</p>
        </div>
        <div className="flex items-center gap-3">
          {!isPremium && (
            <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border">
              {goalCount}/{FREE_GOAL_LIMIT} metas
            </span>
          )}
          <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} data-testid="button-new-goal">
                <Plus className="w-4 h-4 mr-2" /> Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingGoal ? "Editar Meta" : "Criar Nova Meta"}</DialogTitle>
              </DialogHeader>

              <GoalForm
                name={name} setName={setName}
                targetAmount={targetAmount} setTargetAmount={setTargetAmount}
                currentAmount={currentAmount} setCurrentAmount={setCurrentAmount}
                type={type} setType={setType}
                color={color} setColor={setColor}
                deadline={deadline} setDeadline={setDeadline}
                isEditing={!!editingGoal}
              />

              <div className="flex justify-between gap-2 pt-2">
                {editingGoal ? (
                  showDeleteConfirm ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">Confirmar exclusão?</span>
                      <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
                        Sim, excluir
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Não</Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost" size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Excluir
                    </Button>
                  )
                ) : <div />}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSave} disabled={isPending || !name.trim() || !targetAmount}>
                    {isPending ? "Salvando..." : editingGoal ? "Salvar" : "Criar Meta"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Contribute dialog */}
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
                <Button key={v} variant="outline" size="sm" className="bg-background text-xs"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-xl" />)
        ) : goals?.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-card rounded-xl border border-border">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 text-3xl">🎯</div>
            <h3 className="text-lg font-semibold">Nenhuma meta ativa</h3>
            <p className="text-muted-foreground mt-1 mb-4">Comece a poupar para seus sonhos hoje.</p>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" /> Criar Primeira Meta
            </Button>
          </div>
        ) : (
          goals?.map((g) => {
            const progress  = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
            const remaining = g.targetAmount - g.currentAmount;
            const goalColor = g.color || "#7C3AED";

            return (
              <Card key={g.id} className="bg-card flex flex-col group" data-testid={`card-goal-${g.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{g.name}</CardTitle>
                      <CardDescription>{GOAL_TYPES[g.type] || g.type}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      <button
                        onClick={() => openEdit(g)}
                        className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Editar meta"
                      >
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${goalColor}20` }}
                      >
                        {GOAL_ICONS[g.type] || "🎯"}
                      </div>
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
                      <div className="text-xl font-bold" style={{ color: goalColor }}>{progress}%</div>
                      <div className="text-xs text-muted-foreground">concluído</div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-700 rounded-full"
                        style={{ width: `${progress}%`, backgroundColor: goalColor }}
                      />
                    </div>
                    {g.deadline && remaining > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Prazo: {new Date(g.deadline).toLocaleDateString("pt-BR")}
                      </p>
                    )}
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

import { useState } from "react";
import {
  useGetGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useContributeToGoal,
  getGetGoalsQueryKey, getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useI18n } from "@/contexts/i18n-context";
import { useQueryClient } from "@tanstack/react-query";
import { UpgradeModal } from "@/components/upgrade-modal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/currency-input";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, TrendingUp, PiggyBank, Plane, Shield, ShoppingBag, Target, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";

const GOAL_ICON_MAP: Record<string, LucideIcon> = {
  savings:   PiggyBank,
  travel:    Plane,
  emergency: Shield,
  purchase:  ShoppingBag,
  other:     Target,
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

type GoalType = "savings" | "travel" | "emergency" | "purchase" | "other";

function GoalTypeIcon({ type, color }: { type: string; color: string }) {
  const Icon = GOAL_ICON_MAP[type] ?? Target;
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}20`, color }}
    >
      <Icon className="w-5 h-5" />
    </div>
  );
}

function GoalForm({
  name, setName, targetAmount, setTargetAmount, currentAmount, setCurrentAmount,
  type, color, setColor, deadline, setDeadline, isEditing, t,
}: {
  name: string; setName: (v: string) => void;
  targetAmount: string; setTargetAmount: (v: string) => void;
  currentAmount: string; setCurrentAmount: (v: string) => void;
  type: GoalType;
  color: string; setColor: (v: string) => void;
  deadline: string; setDeadline: (v: string) => void;
  isEditing: boolean;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label>{type === "other" ? t("goals.goalNameCustom") : t("goals.goalName")}</Label>
        <Input
          placeholder={type === "other" ? "Ex: Casa própria, iPhone, Curso..." : (EXAMPLES[type]?.[0] ?? t("goals.goalName"))}
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
          <Label>{t("goals.targetAmount")}</Label>
          <CurrencyInput
            value={targetAmount}
            onValueChange={setTargetAmount}
            className="bg-background font-semibold h-11"
            data-testid="input-goal-amount"
          />
        </div>
        <div className="space-y-2">
          <Label>{t("goals.currentAmount")} <span className="text-muted-foreground text-xs">({t("goals.optional")})</span></Label>
          <CurrencyInput
            value={currentAmount}
            onValueChange={setCurrentAmount}
            className="bg-background h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("goals.deadline")} <span className="text-muted-foreground text-xs">({t("goals.optional")})</span></Label>
        <Input
          type="date"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          className="bg-background"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">{t("goals.goalColor")}</Label>
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

const FREE_GOAL_LIMIT = 2;

export default function Goals() {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useGetGoals();
  const createMutation     = useCreateGoal();
  const updateMutation     = useUpdateGoal();
  const deleteMutation     = useDeleteGoal();
  const contributeMutation = useContributeToGoal();

  const goalTypeLabels: Record<string, string> = {
    savings:   t("goals.typeSavings"),
    travel:    t("goals.typeTravel"),
    emergency: t("goals.typeEmergency"),
    purchase:  t("goals.typePurchase"),
    other:     t("goals.typeOther"),
  };

  const [isFormOpen, setIsFormOpen]               = useState(false);
  const [isContributeOpen, setIsContributeOpen]   = useState(false);
  const [editingGoal, setEditingGoal]             = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedGoalId, setSelectedGoalId]       = useState<number | null>(null);
  const [contributeAmount, setContributeAmount]   = useState("");
  const [showUpgrade, setShowUpgrade]             = useState(false);

  const [name, setName]                   = useState("");
  const [targetAmount, setTargetAmount]   = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [type, setType]                   = useState<GoalType>("savings");
  const [color, setColor]                 = useState("#7C3AED");
  const [deadline, setDeadline]           = useState("");

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
    if (!isPremium && (goals?.length ?? 0) >= FREE_GOAL_LIMIT) {
      setShowUpgrade(true);
      return;
    }
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
    if (!name.trim() || !targetAmount) return;
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
        { onSuccess: () => { invalidate(); setIsFormOpen(false); resetForm(); } }
      );
    } else {
      if (!isPremium && (goals?.length ?? 0) >= FREE_GOAL_LIMIT) {
        setIsFormOpen(false);
        resetForm();
        setShowUpgrade(true);
        return;
      }
      createMutation.mutate(
        { data: payload },
        { onSuccess: () => { invalidate(); setIsFormOpen(false); resetForm(); } }
      );
    }
  };

  const handleDelete = () => {
    if (!editingGoal) return;
    deleteMutation.mutate(
      { id: editingGoal.id },
      { onSuccess: () => { invalidate(); setIsFormOpen(false); resetForm(); } }
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
        },
      }
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("goals.title")}</h1>
          <p className="text-muted-foreground">{t("goals.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} data-testid="button-new-goal">
                <Plus className="w-4 h-4 mr-2" /> {t("goals.newGoal")}
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingGoal ? t("goals.editGoal") : t("goals.createGoal")}</DialogTitle>
              </DialogHeader>

              <GoalForm
                name={name} setName={setName}
                targetAmount={targetAmount} setTargetAmount={setTargetAmount}
                currentAmount={currentAmount} setCurrentAmount={setCurrentAmount}
                type={type}
                color={color} setColor={setColor}
                deadline={deadline} setDeadline={setDeadline}
                isEditing={!!editingGoal}
                t={t}
              />

              <div className="flex justify-between gap-2 pt-2">
                {editingGoal ? (
                  showDeleteConfirm ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">{t("goals.confirmDelete")}</span>
                      <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
                        {t("goals.yesDelete")}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>{t("goals.no")}</Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost" size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> {t("common.delete")}
                    </Button>
                  )
                ) : <div />}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsFormOpen(false)}>{t("common.cancel")}</Button>
                  <Button onClick={handleSave} disabled={isPending || !name.trim() || !targetAmount}>
                    {isPending ? t("goals.saving") : editingGoal ? t("common.save") : t("goals.createGoal")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Contribute dialog */}
      <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>{t("goals.contributeTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("goals.howMuch")}</Label>
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
            <Button variant="outline" onClick={() => setIsContributeOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleContribute} disabled={contributeMutation.isPending || !contributeAmount}>
              {contributeMutation.isPending ? t("goals.saving") : t("goals.confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-xl" />)
        ) : goals?.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-card rounded-2xl premium-card border">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">{t("goals.noGoals")}</h3>
            <p className="text-muted-foreground mt-1 mb-4">{t("goals.noGoalsDesc")}</p>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" /> {t("goals.createFirst")}
            </Button>
          </div>
        ) : (
          goals?.map((g) => {
            const progress  = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
            const remaining = g.targetAmount - g.currentAmount;
            const goalColor = g.color || "#7C3AED";

            return (
              <Card key={g.id} className="flex flex-col group" data-testid={`card-goal-${g.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{g.name}</CardTitle>
                      <CardDescription>{goalTypeLabels[g.type] || g.type}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      <button
                        onClick={() => openEdit(g)}
                        className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                        aria-label={t("common.edit")}
                      >
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <GoalTypeIcon type={g.type} color={goalColor} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-2xl font-bold tabular-nums">{formatCurrency(g.currentAmount, user?.currency)}</div>
                      <div className="text-xs text-muted-foreground">{t("goals.of")} {formatCurrency(g.targetAmount, user?.currency)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold" style={{ color: goalColor }}>{progress}%</div>
                      <div className="text-xs text-muted-foreground">{t("goals.completed")}</div>
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
                        {t("goals.deadline")}: {new Date(g.deadline).toLocaleDateString()}
                      </p>
                    )}
                    {remaining > 0 ? (
                      <p className="text-xs text-muted-foreground">{t("goals.remaining")} {formatCurrency(remaining, user?.currency)}</p>
                    ) : (
                      <p className="text-xs text-[#00C851] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t("goals.goalReached")}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full bg-background"
                    onClick={() => openContribute(g.id)}
                    disabled={remaining <= 0}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {t("goals.addValue")}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="Metas ilimitadas"
      />
    </div>
  );
}

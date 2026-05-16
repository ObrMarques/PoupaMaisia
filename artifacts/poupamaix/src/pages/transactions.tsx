import { useState } from "react";
import {
  useGetTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction,
  getGetTransactionsQueryKey, getGetRecentTransactionsQueryKey, getGetDashboardSummaryQueryKey,
  getGetSpendingByCategoryQueryKey, getGetMonthlyTrendQueryKey, getGetGoalsQueryKey,
  useGetCategories, useGetCards, getGetCardsQueryKey,
} from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/currency-input";
import { CategoryPicker } from "@/components/category-picker";
import { Plus, Filter, Trash2, Pencil, ChevronRight, CreditCard, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const CARD_BRAND_LABEL: Record<string, string> = {
  mastercard: "Mastercard", visa: "Visa", amex: "Amex",
  elo: "Elo", hipercard: "Hipercard", other: "Outro",
};

function CardSelector({
  cards, value, onChange,
}: {
  cards: any[];
  value: number | null;
  onChange: (id: number | null) => void;
}) {
  if (!cards.length) return null;
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5">
        <CreditCard className="w-3.5 h-3.5" />
        Cartão <span className="text-muted-foreground text-xs">(opcional)</span>
      </Label>
      <div className="space-y-1.5">
        {/* "Nenhum" option */}
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors ${
            value === null
              ? "border-foreground bg-secondary font-medium"
              : "border-border hover:border-foreground/30 hover:bg-secondary/50"
          }`}
        >
          <span className="text-muted-foreground">Sem cartão</span>
          {value === null && <div className="w-4 h-4 rounded-full bg-foreground flex items-center justify-center"><X className="w-2.5 h-2.5 text-background" /></div>}
        </button>
        {cards.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors ${
              value === c.id
                ? "border-foreground bg-secondary font-medium"
                : "border-border hover:border-foreground/30 hover:bg-secondary/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-4 rounded-sm shrink-0"
                style={{ backgroundColor: c.color || "#0A0A0A" }}
              />
              <span>{c.name}</span>
              <span className="text-muted-foreground font-mono text-xs">•••• {c.lastFourDigits}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{CARD_BRAND_LABEL[c.brand] ?? "Cartão"}</span>
              {value === c.id && <div className="w-4 h-4 rounded-full bg-foreground flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-background" /></div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Transactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const [amount, setAmount]           = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate]               = useState(new Date().toISOString().split("T")[0]);
  const [type, setType]               = useState<"income" | "expense">("expense");
  const [categoryId, setCategoryId]   = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [notes, setNotes]             = useState("");
  const [cardId, setCardId]           = useState<number | null>(null);

  const { data: categories } = useGetCategories();
  const { data: cards } = useGetCards();
  const params = filterType !== "all" ? { type: filterType as "income" | "expense" } : {};
  const { data: transactions, isLoading } = useGetTransactions(params);

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getGetTransactionsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetRecentTransactionsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetSpendingByCategoryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetMonthlyTrendQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetGoalsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetCardsQueryKey() });
  };

  const resetForm = () => {
    setAmount(""); setDescription(""); setDate(new Date().toISOString().split("T")[0]);
    setType("expense"); setCategoryId(""); setCategoryName(""); setNotes("");
    setCardId(null); setEditingTransaction(null);
  };

  const handleOpenModal = (t?: any) => {
    if (t) {
      setEditingTransaction(t);
      setAmount(t.amount.toFixed(2));
      setDescription(t.description);
      setDate(t.date.split("T")[0]);
      setType(t.type);
      setCategoryId(t.categoryId.toString());
      setCategoryName(t.categoryName || "");
      setNotes(t.notes || "");
      setCardId(t.cardId ?? null);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!amount || !description || !categoryId) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos necessários.", variant: "destructive" });
      return;
    }

    const parsedAmount = parseFloat(amount);
    const currentType = type;
    const currentDescription = description;
    const currentDate = date;
    const currentCategoryId = parseInt(categoryId, 10);
    const currentCategoryName = categoryName;
    const currentNotes = notes || null;
    const currentCardId = type === "expense" ? (cardId ?? null) : null;

    const payload = {
      type: currentType,
      amount: parsedAmount,
      description: currentDescription,
      date: currentDate,
      categoryId: currentCategoryId,
      notes: currentNotes,
      cardId: currentCardId,
    };

    if (editingTransaction) {
      const prevId = editingTransaction.id;
      setIsModalOpen(false);
      resetForm();
      updateMutation.mutate({ id: prevId, data: payload }, {
        onSuccess: () => { toast({ title: "Transação atualizada" }); },
        onError: () => toast({ title: "Erro ao atualizar", variant: "destructive" }),
        onSettled: () => { invalidateAll(); },
      });
      return;
    }

    const txQueryKey = getGetTransactionsQueryKey(params);
    const summaryQueryKey = getGetDashboardSummaryQueryKey();

    await queryClient.cancelQueries({ queryKey: txQueryKey });
    await queryClient.cancelQueries({ queryKey: summaryQueryKey });

    const previousTransactions = queryClient.getQueryData(txQueryKey);
    const previousSummary = queryClient.getQueryData(summaryQueryKey);

    const category = (categories ?? []).find(c => c.id === currentCategoryId);

    const optimisticTx = {
      id: Date.now() * -1,
      userId: user?.id ?? 0,
      type: currentType,
      amount: parsedAmount,
      description: currentDescription,
      date: currentDate,
      categoryId: currentCategoryId,
      categoryName: currentCategoryName || "",
      categoryColor: category?.color || "#6C5CE7",
      categoryIcon: category?.icon || "",
      cardId: currentCardId,
      notes: currentNotes,
      createdAt: new Date().toISOString(),
    };

    const shouldAddToList = filterType === "all" || filterType === currentType;
    if (shouldAddToList) {
      queryClient.setQueryData(txQueryKey, (old: any) => {
        if (!Array.isArray(old)) return [optimisticTx];
        return [optimisticTx, ...old];
      });
    }

    const txDate = new Date(currentDate + "T12:00:00");
    const now = new Date();
    const isCurrentMonth =
      txDate.getMonth() === now.getMonth() &&
      txDate.getFullYear() === now.getFullYear();

    queryClient.setQueryData(summaryQueryKey, (old: any) => {
      if (!old) return old;
      let { totalBalance = 0, monthlyIncome = 0, monthlyExpenses = 0 } = old;
      if (currentType === "income") {
        totalBalance += parsedAmount;
        if (isCurrentMonth) monthlyIncome += parsedAmount;
      } else {
        totalBalance -= parsedAmount;
        if (isCurrentMonth) monthlyExpenses += parsedAmount;
      }
      const savingsRate = monthlyIncome > 0
        ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
        : 0;
      return { ...old, totalBalance, monthlyIncome, monthlyExpenses, savingsRate };
    });

    setIsModalOpen(false);
    resetForm();

    createMutation.mutate({ data: payload }, {
      onError: () => {
        queryClient.setQueryData(txQueryKey, previousTransactions);
        queryClient.setQueryData(summaryQueryKey, previousSummary);
        toast({ title: "Erro ao salvar transação", variant: "destructive" });
      },
      onSuccess: () => {
        toast({ title: "Transação adicionada" });
      },
      onSettled: () => {
        invalidateAll();
      },
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => { invalidateAll(); toast({ title: "Transação excluída" }); },
    });
  };

  const expenseCards = cards ?? [];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px] bg-background">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenModal()} className="flex-1 md:flex-none" data-testid="button-add-transaction">
                <Plus className="w-4 h-4 mr-2" /> Nova
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTransaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={type === "expense" ? "default" : "outline"}
                    className={type === "expense" ? "bg-destructive hover:bg-destructive/90 text-white" : "bg-background"}
                    onClick={() => { setType("expense"); setCategoryId(""); setCategoryName(""); }}
                  >
                    Despesa
                  </Button>
                  <Button
                    variant={type === "income" ? "default" : "outline"}
                    className={type === "income" ? "bg-[#00C851] hover:bg-[#00C851]/90 text-white" : "bg-background"}
                    onClick={() => { setType("income"); setCategoryId(""); setCategoryName(""); setCardId(null); }}
                  >
                    Receita
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Valor</Label>
                  <CurrencyInput
                    value={amount}
                    onValueChange={setAmount}
                    className="bg-background text-lg font-semibold h-12"
                    data-testid="input-amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    placeholder="Ex: Supermercado Extra"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="bg-background"
                    data-testid="input-description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryPickerOpen(true)}
                      className="w-full flex items-center justify-between px-3 h-10 rounded-md border border-input bg-background text-sm transition-colors hover:bg-secondary"
                      data-testid="select-category"
                    >
                      <span className={categoryName ? "text-foreground" : "text-muted-foreground"}>
                        {categoryName || "Selecionar..."}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {type === "expense" && expenseCards.length > 0 && (
                  <CardSelector cards={expenseCards} value={cardId} onChange={setCardId} />
                )}

                <div className="space-y-2">
                  <Label>Observações <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <Input
                    placeholder="Notas adicionais..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button
                  onClick={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <CategoryPicker
        open={isCategoryPickerOpen}
        onOpenChange={setIsCategoryPickerOpen}
        value={categoryId}
        type={type}
        onSelect={(id, name) => { setCategoryId(id); setCategoryName(name); }}
      />

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full m-2" />)
            ) : transactions?.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
                <Button variant="outline" className="mt-4 bg-background" onClick={() => handleOpenModal()}>
                  <Plus className="w-4 h-4 mr-2" /> Adicionar primeira transação
                </Button>
              </div>
            ) : (
              transactions?.map((t) => {
                const linkedCard = t.cardId ? (cards ?? []).find(c => c.id === t.cardId) : null;
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors group"
                    data-testid={`row-transaction-${t.id}`}
                  >
                    <div className="flex items-center gap-4 flex-1 cursor-pointer min-w-0" onClick={() => handleOpenModal(t)}>
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-semibold text-xs"
                        style={{ backgroundColor: `${t.categoryColor || "#6C5CE7"}20`, color: t.categoryColor || "#6C5CE7" }}
                      >
                        {(t.categoryName || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{t.description}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString("pt-BR")}</span>
                          {t.categoryName && (
                            <>
                              <span className="text-xs text-muted-foreground">·</span>
                              <Badge variant="outline" className="text-xs py-0 px-1.5 border-border font-normal">
                                {t.categoryName}
                              </Badge>
                            </>
                          )}
                          {linkedCard && (
                            <>
                              <span className="text-xs text-muted-foreground">·</span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: linkedCard.color || "#0A0A0A" }} />
                                {linkedCard.name} •{linkedCard.lastFourDigits}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      <div className={`font-semibold text-right tabular-nums ${t.type === "income" ? "text-[#00C851]" : "text-foreground"}`}>
                        {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount, user?.currency)}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleOpenModal(t)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(t.id)} data-testid={`button-delete-${t.id}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

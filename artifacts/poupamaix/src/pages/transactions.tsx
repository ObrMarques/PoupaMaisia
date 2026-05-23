import { useState, useEffect, useRef } from "react";
import {
  useGetTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction,
  usePayTransaction, useGetWallets, useGetCategories,
  getGetTransactionsQueryKey, getGetRecentTransactionsQueryKey, getGetDashboardSummaryQueryKey,
  getGetSpendingByCategoryQueryKey, getGetMonthlyTrendQueryKey, getGetGoalsQueryKey,
  getGetWalletsQueryKey, getGetPendingTransactionsQueryKey,
} from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/currency-input";
import { CategoryPicker } from "@/components/category-picker";
import { WalletPicker } from "@/components/wallet-picker";
import { CategoryIcon } from "@/components/category-icon";
import { Plus, Trash2, Pencil, ChevronRight, Wallet, AlertCircle, Clock, CheckCircle2, SlidersHorizontal, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Filter types ────────────────────────────────────────────────────────────
type FilterKey = "all" | "pending" | "income" | "expense";

interface FilterOption {
  key: FilterKey;
  label: string;
  description: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: "all",     label: "Todas",      description: "Todas as transações" },
  { key: "pending", label: "Pendentes",  description: "Contas a pagar / data futura" },
  { key: "income",  label: "Receitas",   description: "Entradas de dinheiro" },
  { key: "expense", label: "Despesas",   description: "Gastos concluídos" },
];

const SESSION_KEY = "poupamaix:tx-filter";

function getQueryParams(filter: FilterKey): Record<string, string> {
  if (filter === "pending")  return { status: "pending" };
  if (filter === "income")   return { type: "income" };
  if (filter === "expense")  return { type: "expense", status: "completed" };
  return {};
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

// ─── FilterDropdown ───────────────────────────────────────────────────────────
function FilterDropdown({
  value, onChange,
}: { value: FilterKey; onChange: (k: FilterKey) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const active = value !== "all";

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        onClick={() => setOpen(o => !o)}
        className={cn(
          "gap-2 transition-all",
          active && "border-foreground/40 bg-secondary"
        )}
        aria-label="Filtrar transações"
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="hidden sm:inline">
          {active ? FILTER_OPTIONS.find(o => o.key === value)?.label : "Filtrar"}
        </span>
        {active && (
          <span className="w-1.5 h-1.5 rounded-full bg-foreground/60 sm:hidden" />
        )}
      </Button>

      {/* Dropdown panel */}
      <div
        className={cn(
          "absolute right-0 top-[calc(100%+6px)] z-50 min-w-[210px]",
          "rounded-xl border border-border bg-popover shadow-lg",
          "origin-top-right transition-all duration-150",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="p-1.5">
          {FILTER_OPTIONS.map((opt) => {
            const isSelected = value === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => { onChange(opt.key); setOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left",
                  "text-sm transition-colors duration-100",
                  isSelected
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                  isSelected ? "border-foreground bg-foreground" : "border-border"
                )}>
                  {isSelected && <Check className="w-2.5 h-2.5 text-background" />}
                </div>
                <div>
                  <p className="leading-none">{opt.label}</p>
                  <p className={cn(
                    "text-xs mt-0.5 leading-none",
                    isSelected ? "text-muted-foreground" : "text-muted-foreground/60"
                  )}>{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Transactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<FilterKey>(() => {
    try { return (sessionStorage.getItem(SESSION_KEY) as FilterKey) || "all"; }
    catch { return "all"; }
  });

  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isWalletPickerOpen, setIsWalletPickerOpen]     = useState(false);
  const [editingTransaction, setEditingTransaction]     = useState<any>(null);
  const [walletError, setWalletError]   = useState(false);

  const [amount, setAmount]             = useState("");
  const [description, setDescription]   = useState("");
  const [date, setDate]                 = useState(new Date().toISOString().split("T")[0]);
  const [type, setType]                 = useState<"income" | "expense">("expense");
  const [categoryId, setCategoryId]     = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [walletId, setWalletId]         = useState<number | null>(null);
  const [walletName, setWalletName]     = useState<string | null>(null);
  const [walletColor, setWalletColor]   = useState<string | null>(null);
  const [notes, setNotes]               = useState("");

  const { data: categories } = useGetCategories();
  const { data: wallets }    = useGetWallets();
  const walletList = wallets ?? [];

  const queryParams = getQueryParams(filter);
  const { data: transactions, isLoading } = useGetTransactions(queryParams as any);

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();
  const payMutation    = usePayTransaction();

  // Persist filter in session storage
  const handleFilterChange = (k: FilterKey) => {
    setFilter(k);
    try { sessionStorage.setItem(SESSION_KEY, k); } catch { /* noop */ }
  };

  useEffect(() => {
    if (isModalOpen && !editingTransaction && walletId === null && walletList.length === 1) {
      const w = walletList[0];
      setWalletId(w.id); setWalletName(w.name); setWalletColor(w.color);
    }
  }, [isModalOpen, editingTransaction, walletList, walletId]);

  const invalidateAll = () => {
    [
      getGetTransactionsQueryKey(),
      getGetWalletsQueryKey(),
      getGetGoalsQueryKey(),
      getGetRecentTransactionsQueryKey(),
      getGetDashboardSummaryQueryKey(),
      getGetSpendingByCategoryQueryKey(),
      getGetMonthlyTrendQueryKey(),
      getGetPendingTransactionsQueryKey(),
    ].forEach(key => queryClient.invalidateQueries({ queryKey: key, refetchType: 'all' }));
  };

  const resetForm = () => {
    setAmount(""); setDescription(""); setDate(new Date().toISOString().split("T")[0]);
    setType("expense"); setCategoryId(""); setCategoryName("");
    setWalletId(null); setWalletName(null); setWalletColor(null);
    setNotes(""); setEditingTransaction(null); setWalletError(false);
  };

  const handleOpenModal = (t?: any) => {
    if (t) {
      setEditingTransaction(t);
      setAmount(t.amount.toFixed(2));
      setDescription(t.description ?? "");
      setDate(t.date.split("T")[0]);
      setType(t.type);
      setCategoryId(t.categoryId.toString());
      setCategoryName(t.categoryName || "");
      setWalletId(t.walletId ?? null);
      setWalletName(t.walletName ?? null);
      setWalletColor(t.walletColor ?? null);
      setNotes(t.notes || "");
    } else {
      resetForm();
      if (walletList.length === 1) {
        const w = walletList[0]; setWalletId(w.id); setWalletName(w.name); setWalletColor(w.color);
      }
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!amount || !categoryId) return;
    if (!walletId) { setWalletError(true); return; }
    setWalletError(false);

    const payload: any = {
      type, amount: parseFloat(amount), description,
      date, categoryId: parseInt(categoryId, 10), walletId,
      notes: notes || null,
    };

    if (editingTransaction) {
      const prevId = editingTransaction.id;
      setIsModalOpen(false); resetForm();
      updateMutation.mutate({ id: prevId, data: payload }, { onSettled: () => invalidateAll() });
      return;
    }

    const txQueryKey = getGetTransactionsQueryKey(queryParams as any);
    await queryClient.cancelQueries({ queryKey: txQueryKey });
    const previousTransactions = queryClient.getQueryData(txQueryKey);

    const category = (categories ?? []).find(c => c.id === parseInt(categoryId, 10));
    const today = new Date().toISOString().split("T")[0];
    const autoStatus = date > today ? "pending" : "completed";

    const optimisticTx = {
      id: Date.now() * -1, userId: user?.id ?? 0,
      type, amount: parseFloat(amount), description, date,
      categoryId: parseInt(categoryId, 10), categoryName,
      categoryColor: category?.color || "#6C5CE7",
      categoryIcon: category?.icon || "",
      walletId, walletName, walletColor,
      cardId: null, notes: notes || null,
      status: autoStatus,
      createdAt: new Date().toISOString(),
    };

    const shouldAdd = filter === "all"
      || (filter === "pending"  && autoStatus === "pending")
      || (filter === "income"   && type === "income")
      || (filter === "expense"  && type === "expense" && autoStatus === "completed");

    if (shouldAdd) {
      queryClient.setQueryData(txQueryKey, (old: any) =>
        Array.isArray(old) ? [optimisticTx, ...old] : [optimisticTx]
      );
    }

    setIsModalOpen(false); resetForm();
    createMutation.mutate({ data: payload }, {
      onError: () => queryClient.setQueryData(txQueryKey, previousTransactions),
      onSettled: () => invalidateAll(),
    });
  };

  const handleDelete = (id: number) => {
    const txQueryKey = getGetTransactionsQueryKey(queryParams as any);
    const prev = queryClient.getQueryData(txQueryKey);
    queryClient.setQueryData(txQueryKey, (old: any) =>
      Array.isArray(old) ? old.filter((t: any) => t.id !== id) : old
    );
    deleteMutation.mutate({ id }, {
      onError: () => queryClient.setQueryData(txQueryKey, prev),
      onSettled: () => invalidateAll(),
    });
  };

  const handleMarkPaid = (id: number) => {
    payMutation.mutate({ id }, { onSettled: () => invalidateAll() });
  };

  const noWallets = walletList.length === 0;
  const canSave   = !!amount && !!categoryId && !!walletId;
  const emptyMsg  = filter === "pending" ? "Nenhuma conta a pagar." : "Nenhuma transação encontrada.";

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-5 animate-in fade-in">

      {/* ── Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenModal()} data-testid="button-add-transaction">
                <Plus className="w-4 h-4 mr-2" /> Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[440px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTransaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={type === "expense" ? "default" : "outline"}
                    className={type === "expense" ? "bg-destructive hover:bg-destructive/90 text-white" : "bg-background"}
                    onClick={() => { setType("expense"); setCategoryId(""); setCategoryName(""); }}
                  >Despesa</Button>
                  <Button
                    variant={type === "income" ? "default" : "outline"}
                    className={type === "income" ? "bg-[#00C851] hover:bg-[#00C851]/90 text-white" : "bg-background"}
                    onClick={() => { setType("income"); setCategoryId(""); setCategoryName(""); }}
                  >Receita</Button>
                </div>

                <div className="space-y-2">
                  <Label>Valor</Label>
                  <CurrencyInput value={amount} onValueChange={setAmount} className="bg-background text-lg font-semibold h-12" data-testid="input-amount" />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input placeholder="Ex: Supermercado Extra" value={description} onChange={e => setDescription(e.target.value)} className="bg-background" data-testid="input-description" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Data{" "}
                      {date > new Date().toISOString().split("T")[0] && (
                        <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-[#FFF8E1] dark:bg-[#F4C542]/10 text-[#8B6914] dark:text-[#F4C542] ml-1">
                          pendente
                        </span>
                      )}
                    </Label>
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
                      <span className={categoryName ? "text-foreground" : "text-muted-foreground"}>{categoryName || "Selecionar..."}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Carteira <span className="text-destructive text-xs">*</span></Label>
                  {noWallets ? (
                    <div className="flex items-center gap-2 px-3 h-10 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Crie uma carteira antes de adicionar transações.</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setIsWalletPickerOpen(true); setWalletError(false); }}
                      className={`w-full flex items-center gap-2 px-3 h-10 rounded-md border text-sm transition-colors hover:bg-secondary ${walletError ? "border-destructive bg-destructive/5" : "border-input bg-background"}`}
                    >
                      {walletId !== null && walletColor ? (
                        <>
                          <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: walletColor }} />
                          <span className="flex-1 text-left text-foreground">{walletName}</span>
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="flex-1 text-left text-muted-foreground">Selecionar carteira...</span>
                        </>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                  {walletError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Selecione uma carteira para continuar.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Observações <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <Input placeholder="Notas adicionais..." value={notes} onChange={e => setNotes(e.target.value)} className="bg-background" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave} disabled={!canSave || noWallets || createMutation.isPending || updateMutation.isPending} data-testid="button-save">
                  {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <FilterDropdown value={filter} onChange={handleFilterChange} />
        </div>
      </div>

      <CategoryPicker open={isCategoryPickerOpen} onOpenChange={setIsCategoryPickerOpen} value={categoryId} type={type} onSelect={(id, name) => { setCategoryId(id); setCategoryName(name); }} />
      <WalletPicker open={isWalletPickerOpen} onOpenChange={setIsWalletPickerOpen} value={walletId} onSelect={(id, name, color) => { setWalletId(id); setWalletName(name); setWalletColor(color); setWalletError(false); }} />

      {/* ── Active filter indicator ───────────────────── */}
      {filter !== "all" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Mostrando:</span>
          <span className="font-medium text-foreground">
            {FILTER_OPTIONS.find(o => o.key === filter)?.description}
          </span>
          <button
            onClick={() => handleFilterChange("all")}
            className="text-xs underline-offset-2 hover:underline ml-1"
          >
            Limpar filtro
          </button>
        </div>
      )}

      {/* ── Transaction list ─────────────────────────── */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full m-2" />)
            ) : transactions?.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">{emptyMsg}</p>
                <Button variant="outline" className="mt-4 bg-background" onClick={() => handleOpenModal()}>
                  <Plus className="w-4 h-4 mr-2" /> Adicionar transação
                </Button>
              </div>
            ) : (
              transactions?.map((t) => {
                const isPending = t.status === "pending";
                const days      = isPending ? daysUntil(t.date) : 0;
                const isUrgent  = isPending && days <= 3 && days >= 0;
                const isOverdue = isPending && days < 0;

                return (
                  <div
                    key={t.id}
                    className={cn(
                      "flex items-center justify-between p-4 transition-colors",
                      isPending
                        ? "bg-[#FFF8E1] dark:bg-[#F4C542]/5 hover:bg-[#FFF3CC] dark:hover:bg-[#F4C542]/10"
                        : "hover:bg-secondary/30"
                    )}
                    data-testid={`row-transaction-${t.id}`}
                  >
                    {/* Left: icon + details */}
                    <div className="flex items-center gap-4 flex-1 cursor-pointer min-w-0" onClick={() => handleOpenModal(t)}>
                      <div className="relative">
                        <CategoryIcon name={t.categoryName || ""} color={t.categoryColor || "#6C5CE7"} />
                        {isPending && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F4C542] flex items-center justify-center">
                            <Clock className="w-2.5 h-2.5 text-[#3D2800]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground truncate">{t.description || t.categoryName}</p>
                          {isPending && (
                            <span className={cn(
                              "text-[10px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0",
                              isOverdue
                                ? "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                                : isUrgent
                                  ? "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                                  : "bg-[#FFF3CC] dark:bg-[#F4C542]/15 text-[#8B6914] dark:text-[#F4C542] border-[#F4C542]/40"
                            )}>
                              {isOverdue ? "Vencida" : isUrgent ? "Vence em breve" : "Conta a Pagar"}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            {isPending
                              ? `Vence em ${new Date(t.date + "T00:00:00").toLocaleDateString("pt-BR")}`
                              : new Date(t.date + "T00:00:00").toLocaleDateString("pt-BR")}
                          </span>
                          {t.categoryName && (
                            <>
                              <span className="text-xs text-muted-foreground">·</span>
                              <Badge variant="outline" className="text-xs py-0 px-1.5 border-border font-normal">{t.categoryName}</Badge>
                            </>
                          )}
                          {t.walletName && (
                            <>
                              <span className="text-xs text-muted-foreground">·</span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.walletColor || "#6B7280" }} />
                                {t.walletName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: amount + actions */}
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <div className={cn(
                        "font-semibold text-right tabular-nums",
                        isPending
                          ? "text-[#8B6914] dark:text-[#F4C542]"
                          : t.type === "income" ? "text-[#00C851]" : "text-foreground"
                      )}>
                        {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount, user?.currency)}
                      </div>
                      <div className="flex gap-0.5">
                        {isPending && (
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-[#8B6914] dark:text-[#F4C542] hover:bg-[#F4C542]/20"
                            title="Marcar como pago"
                            onClick={() => handleMarkPaid(t.id)}
                            disabled={payMutation.isPending}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
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

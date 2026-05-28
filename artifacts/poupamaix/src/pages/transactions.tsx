import { useState, useRef, useEffect } from "react";
import {
  useGetTransactions, useDeleteTransaction, usePayTransaction,
  getGetTransactionsQueryKey, getGetRecentTransactionsQueryKey, getGetDashboardSummaryQueryKey,
  getGetSpendingByCategoryQueryKey, getGetMonthlyTrendQueryKey, getGetGoalsQueryKey,
  getGetWalletsQueryKey, getGetPendingTransactionsQueryKey,
} from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/contexts/i18n-context";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionDialog } from "@/components/transaction-dialog";
import { CategoryIcon } from "@/components/category-icon";
import { Plus, Trash2, Pencil, Clock, CheckCircle2, SlidersHorizontal, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type FilterKey = "all" | "pending" | "income" | "expense";

interface FilterOption {
  key: FilterKey;
  label: string;
  description: string;
}

const SESSION_KEY = "poupamaix:tx-filter";

function getQueryParams(filter: FilterKey): Record<string, string> {
  if (filter === "pending")  return { status: "pending" };
  if (filter === "income")   return { type: "income" };
  if (filter === "expense")  return { type: "expense", status: "completed" };
  return {};
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

function FilterDropdown({
  value, onChange, options,
}: { value: FilterKey; onChange: (k: FilterKey) => void; options: FilterOption[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

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
        className={cn("gap-2 transition-all", active && "border-foreground/40 bg-secondary")}
        aria-label={t("transactions.filterBtn")}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="hidden sm:inline">
          {active ? options.find(o => o.key === value)?.label : t("transactions.filterBtn")}
        </span>
        {active && (
          <span className="w-1.5 h-1.5 rounded-full bg-foreground/60 sm:hidden" />
        )}
      </Button>

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
          {options.map((opt) => {
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

export default function Transactions() {
  const { user } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const filterOptions: FilterOption[] = [
    { key: "all",     label: t("transactions.filterAll"),     description: t("transactions.filterAllDesc") },
    { key: "pending", label: t("transactions.filterPending"), description: t("transactions.filterPendingDesc") },
    { key: "income",  label: t("transactions.filterIncome"),  description: t("transactions.filterIncomeDesc") },
    { key: "expense", label: t("transactions.filterExpense"), description: t("transactions.filterExpenseDesc") },
  ];

  const [filter, setFilter] = useState<FilterKey>(() => {
    try { return (sessionStorage.getItem(SESSION_KEY) as FilterKey) || "all"; }
    catch { return "all"; }
  });

  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const queryParams = getQueryParams(filter);
  const { data: transactions, isLoading } = useGetTransactions(queryParams as any);

  const deleteMutation = useDeleteTransaction();
  const payMutation    = usePayTransaction();

  const handleFilterChange = (k: FilterKey) => {
    setFilter(k);
    try { sessionStorage.setItem(SESSION_KEY, k); } catch { /* noop */ }
  };

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
    ].forEach(key => queryClient.invalidateQueries({ queryKey: key, refetchType: "all" }));
  };

  const handleOpenModal = (tx?: any) => {
    setEditingTransaction(tx ?? null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    const txQueryKey = getGetTransactionsQueryKey(queryParams as any);
    const prev = queryClient.getQueryData(txQueryKey);
    queryClient.setQueryData(txQueryKey, (old: any) =>
      Array.isArray(old) ? old.filter((tx: any) => tx.id !== id) : old
    );
    deleteMutation.mutate({ id }, {
      onError: () => queryClient.setQueryData(txQueryKey, prev),
      onSettled: () => invalidateAll(),
    });
  };

  const handleMarkPaid = (id: number) => {
    payMutation.mutate({ id }, { onSettled: () => invalidateAll() });
  };

  const emptyMsg  = filter === "pending" ? t("transactions.noPendingMsg") : t("transactions.noTransactions");

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-5 animate-in fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("transactions.title")}</h1>
          <p className="text-muted-foreground">{t("transactions.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button onClick={() => handleOpenModal()} data-testid="button-add-transaction">
            <Plus className="w-4 h-4 mr-2" /> {t("transactions.newTransaction")}
          </Button>
          <FilterDropdown value={filter} onChange={handleFilterChange} options={filterOptions} />
        </div>
      </div>

      {/* Shared transaction form dialog */}
      <TransactionDialog
        open={isModalOpen}
        onOpenChange={(v) => { setIsModalOpen(v); if (!v) setEditingTransaction(null); }}
        editingTransaction={editingTransaction}
      />

      {/* Active filter indicator */}
      {filter !== "all" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t("transactions.showing")}</span>
          <span className="font-medium text-foreground">
            {filterOptions.find(o => o.key === filter)?.description}
          </span>
          <button
            onClick={() => handleFilterChange("all")}
            className="text-xs underline-offset-2 hover:underline ml-1"
          >
            {t("transactions.clearFilter")}
          </button>
        </div>
      )}

      {/* Transaction list */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full m-2" />)
            ) : transactions?.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">{emptyMsg}</p>
                <Button variant="outline" className="mt-4 bg-background" onClick={() => handleOpenModal()}>
                  <Plus className="w-4 h-4 mr-2" /> {t("transactions.addTransaction")}
                </Button>
              </div>
            ) : (
              transactions?.map((tx) => {
                const isPending = tx.status === "pending";
                const days      = isPending ? daysUntil(tx.date) : 0;
                const isUrgent  = isPending && days <= 3 && days >= 0;
                const isOverdue = isPending && days < 0;

                const statusLabel = isOverdue
                  ? t("transactions.overdue")
                  : days === 0
                    ? t("transactions.today")
                    : days === 1
                      ? t("transactions.tomorrow")
                      : `${days}${t("transactions.dUnit")}`;

                return (
                  <div
                    key={tx.id}
                    className={cn(
                      "flex items-center justify-between p-4 transition-colors",
                      isPending
                        ? "bg-[#FFF8E1] dark:bg-[#F4C542]/5 hover:bg-[#FFF3CC] dark:hover:bg-[#F4C542]/10"
                        : "hover:bg-secondary/30"
                    )}
                    data-testid={`row-transaction-${tx.id}`}
                  >
                    <div className="flex items-center gap-4 flex-1 cursor-pointer min-w-0" onClick={() => handleOpenModal(tx)}>
                      <div className="relative">
                        <CategoryIcon name={tx.categoryName || ""} color={tx.categoryColor || "#6C5CE7"} />
                        {isPending && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F4C542] flex items-center justify-center">
                            <Clock className="w-2.5 h-2.5 text-[#3D2800]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground truncate">{tx.description || tx.categoryName}</p>
                          {isPending && (
                            <span className={cn(
                              "text-[10px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0",
                              isOverdue
                                ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                                : isUrgent
                                  ? "bg-[#FFF8E1] dark:bg-[#F4C542]/10 border-[#F4C542]/40 text-[#8B6914] dark:text-[#F4C542]"
                                  : "bg-secondary border-border text-muted-foreground"
                            )}>
                              {statusLabel}
                            </span>
                          )}
                          {!isPending && tx.status === "completed" && tx.type === "expense" && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground shrink-0">
                              {t("transactions.paid")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.date + "T00:00:00").toLocaleDateString()}
                          </p>
                          {tx.walletName && (
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tx.walletColor || "#888" }} />
                              <p className="text-xs text-muted-foreground truncate max-w-[80px]">{tx.walletName}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className={cn(
                        "font-semibold tabular-nums text-sm",
                        tx.type === "income" ? "text-[#00C851]" : isPending ? "text-[#C49A00] dark:text-[#F4C542]" : "text-foreground"
                      )}>
                        {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount, user?.currency || "BRL")}
                      </span>

                      {isPending && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs bg-background shrink-0"
                          onClick={() => handleMarkPaid(tx.id)}
                          disabled={payMutation.isPending}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {t("transactions.payBtn")}
                        </Button>
                      )}

                      <div className="flex gap-0.5">
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenModal(tx)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(tx.id)}
                        >
                          <Trash2 className="w-3 h-3" />
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

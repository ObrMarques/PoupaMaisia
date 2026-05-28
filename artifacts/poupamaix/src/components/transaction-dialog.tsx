import { useState, useEffect } from "react";
import {
  useCreateTransaction, useUpdateTransaction,
  useGetWallets, useGetCategories,
  getGetTransactionsQueryKey, getGetRecentTransactionsQueryKey,
  getGetDashboardSummaryQueryKey, getGetSpendingByCategoryQueryKey,
  getGetMonthlyTrendQueryKey, getGetGoalsQueryKey,
  getGetWalletsQueryKey, getGetPendingTransactionsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/contexts/i18n-context";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/currency-input";
import { CategoryPicker } from "@/components/category-picker";
import { WalletPicker } from "@/components/wallet-picker";
import { WalletFormDialog } from "@/components/wallet-form-dialog";
import { AlertCircle, ChevronRight, Wallet, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTransaction?: any | null;
  initialType?: "expense" | "income";
  initialWalletId?: number | null;
  lockWallet?: boolean;
  onSuccess?: () => void;
}

export function TransactionDialog({
  open,
  onOpenChange,
  editingTransaction,
  initialType,
  initialWalletId,
  lockWallet = false,
  onSuccess,
}: TransactionDialogProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isWalletPickerOpen, setIsWalletPickerOpen]     = useState(false);
  const [isWalletFormOpen, setIsWalletFormOpen]         = useState(false);
  const [walletError, setWalletError]                   = useState(false);

  const [type, setType]                 = useState<"income" | "expense">(initialType ?? "expense");
  const [amount, setAmount]             = useState("");
  const [description, setDescription]   = useState("");
  const [date, setDate]                 = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId]     = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [walletId, setWalletId]         = useState<number | null>(initialWalletId ?? null);
  const [walletName, setWalletName]     = useState<string | null>(null);
  const [walletColor, setWalletColor]   = useState<string | null>(null);
  const [notes, setNotes]               = useState("");

  const { data: categories } = useGetCategories();
  const { data: wallets }    = useGetWallets();
  const walletList = wallets ?? [];

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const resetForm = () => {
    setType(initialType ?? "expense");
    setAmount(""); setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setCategoryId(""); setCategoryName("");
    setNotes(""); setWalletError(false);
    if (initialWalletId != null) {
      const w = walletList.find(w => w.id === initialWalletId);
      setWalletId(initialWalletId);
      setWalletName(w?.name ?? null);
      setWalletColor(w?.color ?? null);
    } else if (!lockWallet) {
      setWalletId(null); setWalletName(null); setWalletColor(null);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (editingTransaction) {
      const tx = editingTransaction;
      setType(tx.type);
      setAmount(tx.amount.toFixed(2));
      setDescription(tx.description ?? "");
      setDate(tx.date.split("T")[0]);
      setCategoryId(tx.categoryId.toString());
      setCategoryName(tx.categoryName || "");
      setWalletId(tx.walletId ?? null);
      setWalletName(tx.walletName ?? null);
      setWalletColor(tx.walletColor ?? null);
      setNotes(tx.notes || "");
      setWalletError(false);
    } else {
      resetForm();
    }
  }, [open, editingTransaction]);

  useEffect(() => {
    if (open && !editingTransaction && walletId === null && !lockWallet && walletList.length === 1) {
      const w = walletList[0];
      setWalletId(w.id); setWalletName(w.name); setWalletColor(w.color);
    }
  }, [open, walletList]);

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
      onOpenChange(false);
      updateMutation.mutate({ id: prevId, data: payload }, {
        onSettled: () => { invalidateAll(); onSuccess?.(); },
      });
      return;
    }

    const txQueryKey = getGetTransactionsQueryKey({} as any);
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

    queryClient.setQueryData(txQueryKey, (old: any) =>
      Array.isArray(old) ? [optimisticTx, ...old] : [optimisticTx]
    );

    onOpenChange(false);
    createMutation.mutate({ data: payload }, {
      onError: () => queryClient.setQueryData(txQueryKey, previousTransactions),
      onSettled: () => { invalidateAll(); onSuccess?.(); },
    });
  };

  const noWallets = walletList.length === 0;
  const canSave   = !!amount && !!categoryId && !!walletId;
  const isEditing = !!editingTransaction;
  const today     = new Date().toISOString().split("T")[0];
  const isPending = date > today;
  const isBusy    = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
        <DialogContent
          aria-describedby={undefined}
          className={cn(
            "p-0 gap-0 border-0 shadow-2xl overflow-hidden",
            "w-[calc(100%-32px)] max-w-[420px]",
            "rounded-2xl sm:rounded-2xl",
            "flex flex-col",
            "max-h-[92dvh]",
            "duration-200",
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* ── Header ─────────────────────────────────────── */}
          <div className="px-6 pt-6 pb-4 shrink-0">
            <DialogTitle className="text-base font-semibold tracking-tight">
              {isEditing ? t("transactions.editTransaction") : t("transactions.newTransaction")}
            </DialogTitle>
          </div>

          {/* ── Scrollable body ────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 pb-2 min-h-0">
            {noWallets
              ? (
                /* Empty state when no wallets exist */
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-5">
                  <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center">
                    <Wallet className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-1.5 max-w-[260px]">
                    <p className="font-semibold text-base text-foreground">
                      {t("wallets.createFirst")}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t("transactions.noWalletWarning")}
                    </p>
                  </div>
                </div>
              )
              : (
                /* Normal transaction form */
                <div className="space-y-5 py-2">
                  {/* Type toggle — segmented pill */}
                  <div className="relative flex rounded-xl bg-secondary p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => { setType("expense"); setCategoryId(""); setCategoryName(""); }}
                      className={cn(
                        "flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        type === "expense"
                          ? "bg-background shadow text-[#EF4444]"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      disabled={lockWallet && initialType === "income"}
                    >
                      {t("transactions.expense")}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setType("income"); setCategoryId(""); setCategoryName(""); }}
                      className={cn(
                        "flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        type === "income"
                          ? "bg-background shadow text-[#00C851]"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      disabled={lockWallet && initialType === "expense"}
                    >
                      {t("transactions.income")}
                    </button>
                  </div>

                  {/* Amount — hero input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t("transactions.amount")}
                    </label>
                    <CurrencyInput
                      value={amount}
                      onValueChange={setAmount}
                      className={cn(
                        "h-14 text-2xl font-bold bg-secondary border-0 rounded-xl px-4",
                        "focus-visible:ring-2 placeholder:text-muted-foreground/40",
                        type === "expense"
                          ? "focus-visible:ring-[#EF4444]/40 text-[#EF4444] placeholder:text-[#EF4444]/30"
                          : "focus-visible:ring-[#00C851]/40 text-[#00C851] placeholder:text-[#00C851]/30"
                      )}
                      placeholder={type === "expense" ? "- R$ 0,00" : "+ R$ 0,00"}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t("transactions.description")}
                    </label>
                    <Input
                      placeholder={t("transactions.descPlaceholder")}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="h-11 bg-secondary border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-ring/40"
                    />
                  </div>

                  {/* Date + Category */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                        {t("transactions.date")}
                        {isPending && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 normal-case tracking-normal">
                            {t("transactions.pendingBadge")}
                          </span>
                        )}
                      </label>
                      <Input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="h-11 bg-secondary border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-ring/40 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {t("transactions.category")}
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCategoryPickerOpen(true)}
                        className={cn(
                          "w-full h-11 flex items-center justify-between px-3 rounded-xl text-sm transition-colors",
                          "bg-secondary border-0 hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                          !categoryName && "text-muted-foreground"
                        )}
                      >
                        <span className="truncate">{categoryName || t("transactions.selectCategory")}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 ml-1" />
                      </button>
                    </div>
                  </div>

                  {/* Wallet */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      {t("transactions.wallet")}
                      <span className="text-destructive text-[10px] normal-case font-normal">*</span>
                    </label>
                    {lockWallet && walletId !== null
                      ? (
                        <div className="flex items-center gap-2 px-3 h-11 rounded-xl bg-secondary text-sm">
                          {walletColor && (
                            <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: walletColor }} />
                          )}
                          <span className="flex-1 text-foreground font-medium">{walletName}</span>
                        </div>
                      )
                      : (
                        <button
                          type="button"
                          onClick={() => { setIsWalletPickerOpen(true); setWalletError(false); }}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 h-11 rounded-xl text-sm transition-colors",
                            "focus-visible:outline-none focus-visible:ring-2",
                            walletError
                              ? "bg-destructive/8 ring-2 ring-destructive/40 focus-visible:ring-destructive/40"
                              : "bg-secondary hover:bg-secondary/70 focus-visible:ring-ring/40"
                          )}
                        >
                          {walletId !== null && walletColor
                            ? (
                              <>
                                <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: walletColor }} />
                                <span className="flex-1 text-left text-foreground font-medium">{walletName}</span>
                              </>
                            )
                            : (
                              <>
                                <Wallet className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="flex-1 text-left text-muted-foreground">{t("transactions.selectWallet")}</span>
                              </>
                            )
                          }
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        </button>
                      )
                    }
                    {walletError && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {t("transactions.walletRequired")}
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5 pb-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t("transactions.notes")}{" "}
                      <span className="normal-case font-normal tracking-normal">({t("common.optional")})</span>
                    </label>
                    <Input
                      placeholder={t("transactions.notesPlaceholder")}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="h-11 bg-secondary border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-ring/40"
                    />
                  </div>
                </div>
              )
            }
          </div>

          {/* ── Sticky footer ──────────────────────────────── */}
          <div className="shrink-0 px-6 py-4 bg-background border-t border-border flex gap-3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-none text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {t("common.cancel")}
            </Button>
            {noWallets
              ? (
                <Button
                  className="flex-1 h-12 text-base font-semibold rounded-xl bg-foreground hover:bg-foreground/90 text-background transition-all"
                  onClick={() => setIsWalletFormOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("wallets.newWallet")}
                </Button>
              )
              : (
                <Button
                  className={cn(
                    "flex-1 h-12 text-base font-semibold rounded-xl transition-all",
                    type === "expense"
                      ? "bg-[#EF4444] hover:bg-[#EF4444]/90 text-white"
                      : "bg-[#00C851] hover:bg-[#00C851]/90 text-white"
                  )}
                  onClick={handleSave}
                  disabled={!canSave || isBusy}
                >
                  {isBusy ? t("transactions.saving") : isEditing ? t("common.save") : t("transactions.newTransaction")}
                </Button>
              )
            }
          </div>
        </DialogContent>
      </Dialog>

      <CategoryPicker
        open={isCategoryPickerOpen}
        onOpenChange={setIsCategoryPickerOpen}
        value={categoryId}
        type={type}
        onSelect={(id, name) => { setCategoryId(id); setCategoryName(name); }}
      />

      <WalletPicker
        open={isWalletPickerOpen}
        onOpenChange={setIsWalletPickerOpen}
        value={walletId}
        onSelect={(id, name, color) => { setWalletId(id); setWalletName(name); setWalletColor(color); }}
      />

      <WalletFormDialog
        open={isWalletFormOpen}
        onOpenChange={setIsWalletFormOpen}
      />
    </>
  );
}

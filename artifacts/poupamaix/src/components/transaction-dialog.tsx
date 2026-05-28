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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/currency-input";
import { CategoryPicker } from "@/components/category-picker";
import { WalletPicker } from "@/components/wallet-picker";
import { AlertCircle, ChevronRight, Wallet } from "lucide-react";

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
  const [isWalletPickerOpen, setIsWalletPickerOpen] = useState(false);
  const [walletError, setWalletError] = useState(false);

  const [type, setType]               = useState<"income" | "expense">(initialType ?? "expense");
  const [amount, setAmount]           = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate]               = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId]   = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [walletId, setWalletId]       = useState<number | null>(initialWalletId ?? null);
  const [walletName, setWalletName]   = useState<string | null>(null);
  const [walletColor, setWalletColor] = useState<string | null>(null);
  const [notes, setNotes]             = useState("");

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
      updateMutation.mutate({ id: prevId, data: payload }, { onSettled: () => { invalidateAll(); onSuccess?.(); } });
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

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-[440px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t("transactions.editTransaction") : t("transactions.newTransaction")}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Type */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={type === "expense" ? "default" : "outline"}
                className={type === "expense" ? "bg-destructive hover:bg-destructive/90 text-white" : "bg-background"}
                onClick={() => { setType("expense"); setCategoryId(""); setCategoryName(""); }}
                disabled={lockWallet && initialType === "income"}
              >{t("transactions.expense")}</Button>
              <Button
                variant={type === "income" ? "default" : "outline"}
                className={type === "income" ? "bg-[#00C851] hover:bg-[#00C851]/90 text-white" : "bg-background"}
                onClick={() => { setType("income"); setCategoryId(""); setCategoryName(""); }}
                disabled={lockWallet && initialType === "expense"}
              >{t("transactions.income")}</Button>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>{t("transactions.amount")}</Label>
              <CurrencyInput
                value={amount}
                onValueChange={setAmount}
                className="bg-background text-lg font-semibold h-12"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>{t("transactions.description")}</Label>
              <Input
                placeholder={t("transactions.descPlaceholder")}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="bg-background"
              />
            </div>

            {/* Date + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {t("transactions.date")}{" "}
                  {isPending && (
                    <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-[#FFF8E1] dark:bg-[#F4C542]/10 text-[#8B6914] dark:text-[#F4C542] ml-1">
                      {t("transactions.pendingBadge")}
                    </span>
                  )}
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("transactions.category")}</Label>
                <button
                  type="button"
                  onClick={() => setIsCategoryPickerOpen(true)}
                  className="w-full flex items-center justify-between px-3 h-10 rounded-md border border-input bg-background text-sm transition-colors hover:bg-secondary"
                >
                  <span className={categoryName ? "text-foreground" : "text-muted-foreground"}>
                    {categoryName || t("transactions.selectCategory")}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Wallet */}
            <div className="space-y-2">
              <Label>
                {t("transactions.wallet")} <span className="text-destructive text-xs">*</span>
              </Label>
              {noWallets ? (
                <div className="flex items-center gap-2 px-3 h-10 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{t("transactions.noWalletWarning")}</span>
                </div>
              ) : lockWallet && walletId !== null ? (
                <div className="flex items-center gap-2 px-3 h-10 rounded-md border border-input bg-secondary/50 text-sm">
                  {walletColor && (
                    <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: walletColor }} />
                  )}
                  <span className="flex-1 text-foreground font-medium">{walletName}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { setIsWalletPickerOpen(true); setWalletError(false); }}
                  className={`w-full flex items-center gap-2 px-3 h-10 rounded-md border text-sm transition-colors hover:bg-secondary ${
                    walletError ? "border-destructive bg-destructive/5" : "border-input bg-background"
                  }`}
                >
                  {walletId !== null && walletColor ? (
                    <>
                      <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: walletColor }} />
                      <span className="flex-1 text-left text-foreground">{walletName}</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="flex-1 text-left text-muted-foreground">{t("transactions.selectWallet")}</span>
                    </>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              {walletError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {t("transactions.walletRequired")}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>
                {t("transactions.notes")}{" "}
                <span className="text-muted-foreground text-xs">({t("common.optional")})</span>
              </Label>
              <Input
                placeholder={t("transactions.notesPlaceholder")}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button
              onClick={handleSave}
              disabled={!canSave || noWallets || createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? t("transactions.saving") : t("common.save")}
            </Button>
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
    </>
  );
}

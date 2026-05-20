import { useState, useEffect } from "react";
import {
  useCreateTransaction,
  useGetWallets,
  getGetTransactionsQueryKey, getGetRecentTransactionsQueryKey,
  getGetDashboardSummaryQueryKey, getGetSpendingByCategoryQueryKey,
  getGetMonthlyTrendQueryKey, getGetWalletsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/currency-input";
import { CategoryPicker } from "@/components/category-picker";
import { Plus, ChevronRight, ChevronDown, Wallet, AlertCircle } from "lucide-react";

export function QuickAddTransaction({ children }: { children?: React.ReactNode }) {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [catPickerOpen, setCatPickerOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [walletError, setWalletError] = useState(false);

  const [type, setType]               = useState<"expense" | "income">("expense");
  const [amount, setAmount]           = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate]               = useState(() => new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId]   = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [walletId, setWalletId]       = useState<number | null>(null);

  const createMutation = useCreateTransaction();
  const { data: wallets }  = useGetWallets();
  const walletList = wallets ?? [];

  // Auto-select the only wallet
  useEffect(() => {
    if (open && walletId === null && walletList.length === 1) {
      setWalletId(walletList[0].id);
    }
  }, [open, walletList, walletId]);

  const reset = () => {
    setType("expense"); setAmount(""); setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setCategoryId(""); setCategoryName("");
    setWalletId(null); setWalletMenuOpen(false); setWalletError(false);
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getGetTransactionsQueryKey(),        refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: getGetWalletsQueryKey(),             refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: getGetRecentTransactionsQueryKey(),  refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey(),    refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: getGetSpendingByCategoryQueryKey(), refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: getGetMonthlyTrendQueryKey(),        refetchType: 'all' });
  };

  const handleSave = async () => {
    if (!amount || !categoryId) return;
    if (!walletId) {
      setWalletError(true);
      return;
    }
    setWalletError(false);

    const parsedAmount      = parseFloat(amount);
    const currentType       = type;
    const currentDescription = description;
    const currentDate       = date;
    const currentCategoryId = parseInt(categoryId, 10);
    const currentWalletId   = walletId;

    setOpen(false);
    reset();

    createMutation.mutate(
      {
        data: {
          type: currentType,
          amount: parsedAmount,
          description: currentDescription,
          date: currentDate,
          categoryId: currentCategoryId,
          walletId: currentWalletId,
        },
      },
      { onSettled: () => { invalidateAll(); } }
    );
  };

  const noWallets  = walletList.length === 0;
  const canSave    = !!amount && !!categoryId && !!walletId;
  const selectedWallet = walletList.find(w => w.id === walletId);

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogTrigger asChild>
          {children ?? (
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Nova Transação
            </Button>
          )}
        </DialogTrigger>

        <DialogContent aria-describedby={undefined} className="sm:max-w-[420px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
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
                onClick={() => { setType("income"); setCategoryId(""); setCategoryName(""); }}
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
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: Supermercado Extra"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <button
                  type="button"
                  onClick={() => setCatPickerOpen(true)}
                  className="w-full flex items-center justify-between px-3 h-10 rounded-md border border-input bg-background text-sm transition-colors hover:bg-secondary"
                >
                  <span className={categoryName ? "text-foreground" : "text-muted-foreground"}>
                    {categoryName || "Selecionar..."}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" />
                Carteira <span className="text-destructive text-xs">*</span>
              </Label>

              {noWallets ? (
                <div className="flex items-center gap-2 px-3 h-10 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Crie uma carteira antes de adicionar transações.</span>
                </div>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setWalletMenuOpen(v => !v); setWalletError(false); }}
                    className={`w-full flex items-center justify-between px-3 h-10 rounded-md border text-sm transition-colors hover:bg-secondary ${
                      walletError ? "border-destructive bg-destructive/5" : "border-input bg-background"
                    }`}
                  >
                    {selectedWallet ? (
                      <span className="flex items-center gap-2 text-foreground">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0"
                          style={{ backgroundColor: `${selectedWallet.color}22`, border: `1.5px solid ${selectedWallet.color}` }}
                        >
                          {selectedWallet.icon}
                        </span>
                        {selectedWallet.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Selecionar carteira...</span>
                    )}
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>

                  {walletMenuOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-md border border-border bg-popover shadow-md overflow-hidden">
                      {walletList.map(w => (
                        <button
                          key={w.id}
                          type="button"
                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-secondary transition-colors flex items-center gap-2 ${walletId === w.id ? "font-medium bg-secondary/50" : ""}`}
                          onClick={() => { setWalletId(w.id); setWalletMenuOpen(false); setWalletError(false); }}
                        >
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0"
                            style={{ backgroundColor: `${w.color}22`, border: `1.5px solid ${w.color}` }}
                          >
                            {w.icon}
                          </span>
                          <span className="flex-1 truncate">{w.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {walletError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Selecione uma carteira para continuar.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!canSave || noWallets || createMutation.isPending}>
              {createMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CategoryPicker
        open={catPickerOpen}
        onOpenChange={setCatPickerOpen}
        value={categoryId}
        type={type}
        onSelect={(id, name) => { setCategoryId(id); setCategoryName(name); }}
      />
    </>
  );
}

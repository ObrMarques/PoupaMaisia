import { useState } from "react";
import {
  useCreateTransaction,
  getGetTransactionsQueryKey, getGetRecentTransactionsQueryKey,
  getGetDashboardSummaryQueryKey, getGetSpendingByCategoryQueryKey,
  getGetMonthlyTrendQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/currency-input";
import { CategoryPicker } from "@/components/category-picker";
import { Plus, ChevronRight } from "lucide-react";

export function QuickAddTransaction({ children }: { children?: React.ReactNode }) {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [catPickerOpen, setCatPickerOpen] = useState(false);

  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");

  const createMutation = useCreateTransaction();

  const reset = () => {
    setType("expense"); setAmount(""); setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setCategoryId(""); setCategoryName("");
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getGetTransactionsQueryKey(),          refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: getGetRecentTransactionsQueryKey(),    refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey(),      refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: getGetSpendingByCategoryQueryKey(),    refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: getGetMonthlyTrendQueryKey(),          refetchType: 'all' });
  };

  const handleSave = async () => {
    if (!amount || !categoryId) return;

    const parsedAmount = parseFloat(amount);
    const txDate = new Date(date + "T12:00:00");
    const now = new Date();
    const isCurrentMonth =
      txDate.getMonth() === now.getMonth() &&
      txDate.getFullYear() === now.getFullYear();

    const currentType = type;
    const currentDescription = description;
    const currentDate = date;
    const currentCategoryId = parseInt(categoryId, 10);

    await queryClient.cancelQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    const previousSummary = queryClient.getQueryData(getGetDashboardSummaryQueryKey());

    queryClient.setQueryData(getGetDashboardSummaryQueryKey(), (old: any) => {
      if (!old) return old;
      let { totalBalance = 0, monthlyIncome = 0, monthlyExpenses = 0 } = old;

      if (currentType === "income") {
        totalBalance += parsedAmount;
        if (isCurrentMonth) monthlyIncome += parsedAmount;
      } else {
        totalBalance -= parsedAmount;
        if (isCurrentMonth) monthlyExpenses += parsedAmount;
      }

      const savingsRate =
        monthlyIncome > 0
          ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
          : 0;

      return { ...old, totalBalance, monthlyIncome, monthlyExpenses, savingsRate };
    });

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
        },
      },
      {
        onError: () => {
          queryClient.setQueryData(getGetDashboardSummaryQueryKey(), previousSummary);
        },
        onSettled: () => {
          invalidateAll();
        },
      }
    );
  };

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

        <DialogContent className="sm:max-w-[420px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={type === "expense" ? "default" : "outline"}
                className={type === "expense"
                  ? "bg-destructive hover:bg-destructive/90 text-white"
                  : "bg-background"}
                onClick={() => { setType("expense"); setCategoryId(""); setCategoryName(""); }}
              >
                Despesa
              </Button>
              <Button
                variant={type === "income" ? "default" : "outline"}
                className={type === "income"
                  ? "bg-[#00C851] hover:bg-[#00C851]/90 text-white"
                  : "bg-background"}
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
                <Input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="bg-background"
                />
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
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending}>
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

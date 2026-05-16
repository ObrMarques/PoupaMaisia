import { useState } from "react";
import {
  useCreateTransaction, useGetCategories, useGetCards,
  getGetTransactionsQueryKey, getGetRecentTransactionsQueryKey,
  getGetDashboardSummaryQueryKey, getGetSpendingByCategoryQueryKey,
  getGetMonthlyTrendQueryKey, getGetCardsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/currency-input";
import { CategoryPicker } from "@/components/category-picker";
import { Plus, ChevronRight, CreditCard, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CARD_BRAND_LABEL: Record<string, string> = {
  mastercard: "Mastercard", visa: "Visa", amex: "Amex",
  elo: "Elo", hipercard: "Hipercard", other: "Outro",
};

export function QuickAddTransaction({ children }: { children?: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [catPickerOpen, setCatPickerOpen] = useState(false);

  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [cardId, setCardId] = useState<number | null>(null);

  const { data: cards } = useGetCards();
  const createMutation = useCreateTransaction();

  const reset = () => {
    setType("expense"); setAmount(""); setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setCategoryId(""); setCategoryName(""); setCardId(null);
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getGetTransactionsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetRecentTransactionsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetSpendingByCategoryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetMonthlyTrendQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetCardsQueryKey() });
  };

  const handleSave = () => {
    if (!amount || !description || !categoryId) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    createMutation.mutate(
      {
        data: {
          type, amount: parseFloat(amount), description, date,
          categoryId: parseInt(categoryId, 10),
          cardId: type === "expense" ? (cardId ?? null) : null,
        },
      },
      {
        onSuccess: () => {
          invalidateAll(); setOpen(false); reset();
          toast({ title: type === "expense" ? "Despesa adicionada" : "Receita adicionada" });
        },
        onError: () => toast({ title: "Erro ao salvar transação", variant: "destructive" }),
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

            {type === "expense" && (cards ?? []).length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  Cartão <span className="text-muted-foreground text-xs">(opcional)</span>
                </Label>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setCardId(null)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors ${
                      cardId === null
                        ? "border-foreground bg-secondary font-medium"
                        : "border-border hover:border-foreground/30 hover:bg-secondary/50"
                    }`}
                  >
                    <span className="text-muted-foreground">Sem cartão</span>
                    {cardId === null && (
                      <div className="w-4 h-4 rounded-full bg-foreground flex items-center justify-center">
                        <X className="w-2.5 h-2.5 text-background" />
                      </div>
                    )}
                  </button>
                  {(cards ?? []).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCardId(c.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                        cardId === c.id
                          ? "border-foreground bg-secondary font-medium"
                          : "border-border hover:border-foreground/30 hover:bg-secondary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-4 rounded-sm shrink-0" style={{ backgroundColor: c.color || "#0A0A0A" }} />
                        <span>{c.name}</span>
                        <span className="text-muted-foreground font-mono text-xs">•••• {c.lastFourDigits}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{CARD_BRAND_LABEL[c.brand] ?? "Cartão"}</span>
                        {cardId === c.id && (
                          <div className="w-4 h-4 rounded-full bg-foreground flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-background" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
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

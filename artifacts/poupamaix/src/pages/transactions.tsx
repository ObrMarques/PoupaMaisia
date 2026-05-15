import { useState } from "react";
import {
  useGetTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction,
  getGetTransactionsQueryKey, getGetRecentTransactionsQueryKey, getGetDashboardSummaryQueryKey,
  getGetSpendingByCategoryQueryKey, getGetMonthlyTrendQueryKey, getGetGoalsQueryKey,
  useGetCategories
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
import { Plus, Filter, Trash2, Pencil, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Transactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [notes, setNotes] = useState("");

  const { data: categories } = useGetCategories();
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
  };

  const resetForm = () => {
    setAmount(""); setDescription(""); setDate(new Date().toISOString().split("T")[0]);
    setType("expense"); setCategoryId(""); setCategoryName(""); setNotes("");
    setEditingTransaction(null);
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
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!amount || !description || !categoryId) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos necessários.", variant: "destructive" });
      return;
    }
    const payload = {
      type,
      amount: parseFloat(amount),
      description,
      date,
      categoryId: parseInt(categoryId, 10),
      notes: notes || null,
    };
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data: payload }, {
        onSuccess: () => { invalidateAll(); setIsModalOpen(false); resetForm(); toast({ title: "Transação atualizada" }); },
        onError: () => toast({ title: "Erro ao atualizar", variant: "destructive" })
      });
    } else {
      createMutation.mutate({ data: payload }, {
        onSuccess: () => { invalidateAll(); setIsModalOpen(false); resetForm(); toast({ title: "Transação adicionada" }); },
        onError: () => toast({ title: "Erro ao salvar transação", variant: "destructive" })
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => { invalidateAll(); toast({ title: "Transação excluída" }); }
    });
  };

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
            <DialogContent className="sm:max-w-[440px]">
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

      {/* Category picker rendered outside the main dialog so it stacks properly */}
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
              transactions?.map((t) => (
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
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString("pt-BR")}</span>
                        {t.categoryName && (
                          <>
                            <span className="text-xs text-muted-foreground">·</span>
                            <Badge variant="outline" className="text-xs py-0 px-1.5 border-border font-normal">
                              {t.categoryName}
                            </Badge>
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

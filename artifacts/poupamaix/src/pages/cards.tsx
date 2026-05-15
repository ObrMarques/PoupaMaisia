import { useState } from "react";
import { useGetCards, useCreateCard, getGetCardsQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Card as UICard, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/currency-input";
import { Plus, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const BRAND_LOGOS: Record<string, string> = {
  mastercard: "◖◗",
  visa: "VISA",
  amex: "AMEX",
  elo: "ELO",
  hipercard: "HIPER",
  other: "CARD",
};

const BRAND_COLORS: Record<string, string> = {
  mastercard: "from-indigo-900 to-purple-900",
  visa: "from-blue-900 to-blue-800",
  amex: "from-slate-800 to-slate-900",
  elo: "from-yellow-900 to-orange-900",
  hipercard: "from-red-900 to-rose-900",
  other: "from-gray-900 to-black",
};

export default function Cards() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: cards, isLoading } = useGetCards();
  const createMutation = useCreateCard();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [limit, setLimit] = useState("");
  const [brand, setBrand] = useState<"visa" | "mastercard" | "elo" | "amex" | "hipercard" | "other">("mastercard");
  const [closingDay, setClosingDay] = useState("1");
  const [dueDay, setDueDay] = useState("10");

  const resetForm = () => {
    setName(""); setLastFourDigits(""); setLimit("");
    setBrand("mastercard"); setClosingDay("1"); setDueDay("10");
  };

  const handleCreate = () => {
    if (!name || !lastFourDigits || !limit) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    createMutation.mutate(
      { data: { name, lastFourDigits, brand, limit: parseFloat(limit), closingDay: parseInt(closingDay), dueDay: parseInt(dueDay) } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCardsQueryKey() });
          setIsOpen(false);
          resetForm();
          toast({ title: "Cartão adicionado com sucesso" });
        },
        onError: () => toast({ title: "Erro ao adicionar cartão", variant: "destructive" })
      }
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cartões de Crédito</h1>
          <p className="text-muted-foreground">Gerencie seus cartões físicos e virtuais.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-card">
              <Plus className="w-4 h-4 mr-2" /> Adicionar Cartão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Cartão de Crédito</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do cartão</Label>
                <Input placeholder="Nubank Ultravioleta" value={name} onChange={e => setName(e.target.value)} className="bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>4 últimos dígitos</Label>
                  <Input
                    placeholder="1234"
                    maxLength={4}
                    inputMode="numeric"
                    value={lastFourDigits}
                    onChange={e => setLastFourDigits(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="bg-background tracking-widest"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bandeira</Label>
                  <Select value={brand} onValueChange={(v: any) => setBrand(v)}>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mastercard">Mastercard</SelectItem>
                      <SelectItem value="visa">Visa</SelectItem>
                      <SelectItem value="amex">American Express</SelectItem>
                      <SelectItem value="elo">Elo</SelectItem>
                      <SelectItem value="hipercard">Hipercard</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Limite de crédito</Label>
                <CurrencyInput
                  value={limit}
                  onValueChange={setLimit}
                  className="bg-background text-lg font-semibold h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dia de fechamento</Label>
                  <Input type="number" min="1" max="31" value={closingDay} onChange={e => setClosingDay(e.target.value)} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Dia de vencimento</Label>
                  <Input type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} className="bg-background" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-2xl" />)
        ) : cards?.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-card rounded-xl border border-border">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 text-3xl">💳</div>
            <h3 className="text-lg font-semibold">Nenhum cartão cadastrado</h3>
            <p className="text-muted-foreground mt-1 mb-4">Adicione seus cartões para acompanhar as faturas.</p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Primeiro Cartão
            </Button>
          </div>
        ) : (
          cards?.map((card) => {
            const utilization = Math.min(100, Math.round(((card.currentBalance || 0) / card.limit) * 100));
            const cardBg = BRAND_COLORS[card.brand] ?? BRAND_COLORS.other;

            return (
              <div key={card.id} className="space-y-4" data-testid={`card-credit-${card.id}`}>
                <div className={`relative h-52 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between overflow-hidden bg-gradient-to-br ${cardBg}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-white/60 mb-0.5">Cartão</p>
                      <span className="font-semibold tracking-wide text-white/90">{card.name}</span>
                    </div>
                    <div className="font-bold text-lg text-white/80">{BRAND_LOGOS[card.brand] ?? '💳'}</div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <div className="font-mono text-xl tracking-[0.3em] text-white/80">
                      •••• •••• •••• {card.lastFourDigits}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/50 mb-0.5">Fatura Atual</p>
                        <p className="font-bold text-lg">{formatCurrency(card.currentBalance || 0, user?.currency)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-white/50 mb-0.5">Disponível</p>
                        <p className="font-medium">{formatCurrency(card.limit - (card.currentBalance || 0), user?.currency)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <UICard className="bg-card">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Utilização do limite</span>
                      <span className={`font-semibold ${utilization > 80 ? 'text-destructive' : utilization > 60 ? 'text-yellow-500' : 'text-foreground'}`}>
                        {utilization}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${utilization > 80 ? 'bg-destructive' : utilization > 60 ? 'bg-yellow-500' : 'bg-primary'}`}
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm pt-1 border-t border-border">
                      <div>
                        <p className="text-muted-foreground text-xs">Limite total</p>
                        <p className="font-medium text-xs">{formatCurrency(card.limit, user?.currency)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Fecha dia</p>
                        <p className="font-semibold">{card.closingDay}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Vence dia</p>
                        <p className="font-semibold">{card.dueDay}</p>
                      </div>
                    </div>
                  </CardContent>
                </UICard>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

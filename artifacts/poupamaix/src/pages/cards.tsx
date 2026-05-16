import { useState } from "react";
import { useGetCards, useCreateCard, getGetCardsQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useQueryClient } from "@tanstack/react-query";
import { Card as UICard, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/currency-input";
import { Plus, X, Sparkles, CreditCard, Infinity, BarChart3, Building2, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const FREE_WALLET_LIMIT = 3;
const PAYMENT_LINK = "https://buy.stripe.com/6oUbJ12gi04T2Ix4L6gMw00";

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

const PREMIUM_BENEFITS = [
  { icon: Infinity,   text: "Carteiras e cartões ilimitados" },
  { icon: BarChart3,  text: "Organização financeira avançada" },
  { icon: Building2,  text: "Múltiplos bancos e contas" },
  { icon: TrendingUp, text: "Investimentos e metas ilimitados" },
  { icon: Sparkles,   text: "Experiência premium completa" },
];

function PremiumWalletModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();

  const handleSubscribe = () => {
    const url = new URL(PAYMENT_LINK);
    if (user?.email) url.searchParams.set("prefilled_email", user.email);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="bg-foreground text-background px-6 pt-8 pb-6">
          <div className="w-10 h-10 rounded-xl bg-background/15 flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5 text-background" />
          </div>
          <h2 className="text-xl font-bold leading-tight">Desbloqueie cartões ilimitadas</h2>
          <p className="text-background/70 text-sm mt-1.5">
            com <span className="font-semibold text-background">PoupaMais Premium</span>
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="p-3 bg-secondary/60 rounded-xl border border-border">
            <p className="text-xs text-muted-foreground text-center">
              Você atingiu o limite de <span className="font-semibold text-foreground">{FREE_WALLET_LIMIT} cartões</span> do plano gratuito
            </p>
          </div>

          <ul className="space-y-2.5">
            {PREMIUM_BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-background" />
                </div>
                <span className="text-sm text-foreground">{text}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-3xl font-bold">R$&nbsp;9,90</span>
            <span className="text-muted-foreground text-sm">/mês</span>
          </div>

          <div className="flex flex-col gap-2">
            <Button className="w-full h-11 text-sm font-semibold" onClick={handleSubscribe}>
              <Sparkles className="w-4 h-4 mr-2" />
              Assinar Premium
            </Button>
            <Button variant="ghost" className="w-full h-9 text-sm text-muted-foreground" onClick={onClose}>
              Agora não
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Cards() {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: cards, isLoading } = useGetCards();
  const createMutation = useCreateCard();

  const [isOpen, setIsOpen] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [name, setName] = useState("");
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [limit, setLimit] = useState("");
  const [brand, setBrand] = useState<"visa" | "mastercard" | "elo" | "amex" | "hipercard" | "other">("mastercard");
  const [closingDay, setClosingDay] = useState("1");
  const [dueDay, setDueDay] = useState("10");

  const cardCount = cards?.length ?? 0;
  const atLimit = !isPremium && cardCount >= FREE_WALLET_LIMIT;

  const resetForm = () => {
    setName(""); setLastFourDigits(""); setLimit("");
    setBrand("mastercard"); setClosingDay("1"); setDueDay("10");
  };

  const handleAddClick = () => {
    if (atLimit) {
      setShowPremiumModal(true);
    } else {
      setIsOpen(true);
    }
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
        onError: (err: any) => {
          const status = err?.response?.status;
          if (status === 403) {
            setIsOpen(false);
            setShowPremiumModal(true);
          } else {
            toast({ title: "Erro ao adicionar cartão", variant: "destructive" });
          }
        },
      }
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <PremiumWalletModal open={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cartões de Crédito</h1>
          <p className="text-muted-foreground">Gerencie seus cartões físicos e virtuais.</p>
        </div>

        <div className="flex items-center gap-3">
          {!isPremium && (
            <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border">
              {cardCount}/{FREE_WALLET_LIMIT} cartões
            </span>
          )}
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={handleAddClick} data-testid="button-add-card">
                <Plus className="w-4 h-4 mr-2" /> Adicionar Cartão
              </Button>
            </DialogTrigger>
            {!atLimit && (
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
            )}
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-2xl" />)
        ) : cards?.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-card rounded-xl border border-border">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 text-3xl">💳</div>
            <h3 className="text-lg font-semibold">Nenhum cartão cadastrado</h3>
            <p className="text-muted-foreground mt-1 mb-4">Adicione seus cartões para acompanhar as faturas.</p>
            <Button onClick={handleAddClick}>
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

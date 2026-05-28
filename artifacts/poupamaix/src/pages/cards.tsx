import { useState } from "react";
import {
  useGetCards, useCreateCard, useUpdateCard, useDeleteCard,
  getGetCardsQueryKey,
} from "@workspace/api-client-react";
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
import { Plus, Pencil, Trash2, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const BRAND_LABELS: Record<string, string> = {
  mastercard: "Mastercard", visa: "Visa", amex: "Amex",
  elo: "Elo", hipercard: "Hiper", other: "Cartão",
};

const COLOR_PRESETS = [
  { label: "Preto",    value: "#0A0A0A", gradient: "from-zinc-900 to-black" },
  { label: "Grafite",  value: "#2D2D2D", gradient: "from-zinc-800 to-zinc-900" },
  { label: "Azul",     value: "#1E3A8A", gradient: "from-blue-900 to-blue-800" },
  { label: "Violeta",  value: "#4C1D95", gradient: "from-violet-900 to-purple-900" },
  { label: "Verde",    value: "#064E3B", gradient: "from-emerald-900 to-green-900" },
  { label: "Vermelho", value: "#7F1D1D", gradient: "from-red-900 to-rose-900" },
  { label: "Âmbar",   value: "#78350F", gradient: "from-amber-900 to-yellow-900" },
  { label: "Ciano",   value: "#164E63", gradient: "from-cyan-900 to-sky-900" },
];

function colorToGradient(hex: string): string {
  const found = COLOR_PRESETS.find(p => p.value === hex);
  return found?.gradient ?? "from-zinc-900 to-black";
}

function CardVisual({
  name, lastFourDigits, brand, color, currentBalance, limit, currency,
}: {
  name: string; lastFourDigits: string; brand: string; color: string;
  currentBalance: number; limit: number; currency?: string;
}) {
  const gradient = colorToGradient(color);
  return (
    <div className={`relative h-48 rounded-2xl p-5 text-white shadow-lg flex flex-col justify-between overflow-hidden bg-gradient-to-br ${gradient}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/50 mb-0.5">Cartão</p>
          <span className="font-semibold text-sm text-white/90">{name || "Nome do cartão"}</span>
        </div>
        <span className="font-bold text-sm text-white/70 tracking-wide">{BRAND_LABELS[brand] ?? "Cartão"}</span>
      </div>
      <div className="space-y-2 relative z-10">
        <div className="font-mono text-lg tracking-[0.25em] text-white/70">
          •••• •••• •••• {lastFourDigits || "0000"}
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/40 mb-0.5">Fatura</p>
            <p className="font-bold text-sm">{formatCurrency(currentBalance, currency)}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-white/40 mb-0.5">Disponível</p>
            <p className="text-xs font-medium">{formatCurrency(Math.max(0, limit - currentBalance), currency)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-8 gap-1.5">
        {COLOR_PRESETS.map(p => (
          <button
            key={p.value}
            type="button"
            title={p.label}
            onClick={() => onChange(p.value)}
            className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${value === p.value ? "border-primary scale-110" : "border-transparent"}`}
            style={{ backgroundColor: p.value }}
          />
        ))}
      </div>
    </div>
  );
}

type Brand = "visa" | "mastercard" | "elo" | "amex" | "hipercard" | "other";

function CardFormFields({
  name, setName, lastFourDigits, setLastFourDigits,
  brand, setBrand, limitVal, setLimitVal,
  currentBalance, setCurrentBalance,
  closingDay, setClosingDay, dueDay, setDueDay,
  color, setColor, currency,
}: {
  name: string; setName: (v: string) => void;
  lastFourDigits: string; setLastFourDigits: (v: string) => void;
  brand: Brand; setBrand: (v: Brand) => void;
  limitVal: string; setLimitVal: (v: string) => void;
  currentBalance: string; setCurrentBalance: (v: string) => void;
  closingDay: string; setClosingDay: (v: string) => void;
  dueDay: string; setDueDay: (v: string) => void;
  color: string; setColor: (v: string) => void;
  currency?: string;
}) {
  return (
    <div className="space-y-4 py-2">
      <CardVisual
        name={name} lastFourDigits={lastFourDigits} brand={brand}
        color={color} currentBalance={parseFloat(currentBalance) || 0}
        limit={parseFloat(limitVal) || 0} currency={currency}
      />

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">COR DO CARTÃO</Label>
        <ColorPicker value={color} onChange={setColor} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2 col-span-2">
          <Label>Nome do cartão</Label>
          <Input placeholder="Nubank Ultravioleta" value={name} onChange={e => setName(e.target.value)} className="bg-background" />
        </div>
        <div className="space-y-2">
          <Label>4 últimos dígitos</Label>
          <Input
            placeholder="1234" maxLength={4} inputMode="numeric"
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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Limite de crédito</Label>
          <CurrencyInput value={limitVal} onValueChange={setLimitVal} className="bg-background h-10" />
        </div>
        <div className="space-y-2">
          <Label>Fatura atual</Label>
          <CurrencyInput value={currentBalance} onValueChange={setCurrentBalance} className="bg-background h-10" />
        </div>
        <div className="space-y-2">
          <Label>Fecha dia</Label>
          <Input type="number" min="1" max="31" value={closingDay} onChange={e => setClosingDay(e.target.value)} className="bg-background" />
        </div>
        <div className="space-y-2">
          <Label>Vence dia</Label>
          <Input type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} className="bg-background" />
        </div>
      </div>
    </div>
  );
}

export default function Cards() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: cards, isLoading } = useGetCards();
  const createMutation = useCreateCard();
  const updateMutation = useUpdateCard();
  const deleteMutation = useDeleteCard();

  const [isOpen, setIsOpen]             = useState(false);
  const [editingCard, setEditingCard]   = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [name, setName]                     = useState("");
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [limitVal, setLimitVal]             = useState("");
  const [currentBalance, setCurrentBalance] = useState("0");
  const [brand, setBrand]                   = useState<Brand>("mastercard");
  const [closingDay, setClosingDay]         = useState("1");
  const [dueDay, setDueDay]                 = useState("10");
  const [color, setColor]                   = useState("#0A0A0A");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetCardsQueryKey() });

  const updateCardInCache = (updatedCard: any) => {
    queryClient.setQueryData(getGetCardsQueryKey(), (old: any[] | undefined) => {
      if (!old) return old;
      return old.map((c) => c.id === updatedCard.id ? updatedCard : c);
    });
  };

  const resetForm = () => {
    setName(""); setLastFourDigits(""); setLimitVal(""); setCurrentBalance("0");
    setBrand("mastercard"); setClosingDay("1"); setDueDay("10"); setColor("#0A0A0A");
    setEditingCard(null); setShowDeleteConfirm(false);
  };

  const openCreate = () => { resetForm(); setIsOpen(true); };

  const openEdit = (card: any) => {
    setEditingCard(card);
    setName(card.name);
    setLastFourDigits(card.lastFourDigits);
    setBrand(card.brand);
    setLimitVal(String(card.limit));
    setCurrentBalance(String(card.currentBalance || 0));
    setClosingDay(String(card.closingDay));
    setDueDay(String(card.dueDay));
    setColor(card.color || "#0A0A0A");
    setShowDeleteConfirm(false);
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!name || !lastFourDigits || !limitVal) return;
    const data = {
      name, brand,
      limit: parseFloat(limitVal),
      currentBalance: parseFloat(currentBalance) || 0,
      closingDay: parseInt(closingDay),
      dueDay: parseInt(dueDay),
      color,
    };

    if (editingCard) {
      updateMutation.mutate(
        { id: editingCard.id, data },
        { onSuccess: (updatedCard) => { updateCardInCache(updatedCard); setIsOpen(false); resetForm(); } }
      );
    } else {
      createMutation.mutate(
        { data: { name, lastFourDigits, brand, limit: parseFloat(limitVal), closingDay: parseInt(closingDay), dueDay: parseInt(dueDay), color } },
        { onSuccess: () => { invalidate(); setIsOpen(false); resetForm(); } }
      );
    }
  };

  const handleDelete = () => {
    if (!editingCard) return;
    deleteMutation.mutate(
      { id: editingCard.id },
      { onSuccess: () => { invalidate(); setIsOpen(false); resetForm(); } }
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cartões de Crédito</h1>
          <p className="text-muted-foreground">Gerencie seus cartões físicos e virtuais.</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} data-testid="button-add-card">
                <Plus className="w-4 h-4 mr-2" /> Adicionar Cartão
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCard ? "Editar Cartão" : "Adicionar Cartão"}</DialogTitle>
              </DialogHeader>

              <CardFormFields
                name={name} setName={setName}
                lastFourDigits={editingCard ? editingCard.lastFourDigits : lastFourDigits}
                setLastFourDigits={setLastFourDigits}
                brand={brand} setBrand={setBrand}
                limitVal={limitVal} setLimitVal={setLimitVal}
                currentBalance={currentBalance} setCurrentBalance={setCurrentBalance}
                closingDay={closingDay} setClosingDay={setClosingDay}
                dueDay={dueDay} setDueDay={setDueDay}
                color={color} setColor={setColor}
                currency={user?.currency}
              />

              <div className="flex justify-between gap-2 pt-2">
                {editingCard ? (
                  showDeleteConfirm ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Confirmar exclusão?</span>
                      <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>Sim, excluir</Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Não</Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setShowDeleteConfirm(true)}>
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Excluir
                    </Button>
                  )
                ) : <div />}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? "Salvando..." : editingCard ? "Salvar" : "Adicionar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-2xl" />)
        ) : cards?.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-card rounded-2xl premium-card border">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Nenhum cartão cadastrado</h3>
            <p className="text-muted-foreground mt-1 mb-4">Adicione seus cartões para acompanhar as faturas.</p>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Primeiro Cartão
            </Button>
          </div>
        ) : (
          cards?.map((card) => {
            const utilization = card.limit > 0 ? Math.min(100, Math.round(((card.currentBalance || 0) / card.limit) * 100)) : 0;
            const gradient = colorToGradient(card.color || "#0A0A0A");

            return (
              <div key={card.id} className="space-y-3" data-testid={`card-credit-${card.id}`}>
                <div className={`relative h-52 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between overflow-hidden bg-gradient-to-br ${gradient}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-white/60 mb-0.5">Cartão</p>
                      <span className="font-semibold tracking-wide text-white/90">{card.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(card)}
                        className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        aria-label="Editar cartão"
                      >
                        <Pencil className="w-3.5 h-3.5 text-white" />
                      </button>
                      <span className="font-bold text-sm text-white/80 tracking-wide">
                        {BRAND_LABELS[card.brand] ?? "Cartão"}
                      </span>
                    </div>
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
                        <p className="font-medium">{formatCurrency(Math.max(0, card.limit - (card.currentBalance || 0)), user?.currency)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <UICard>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Utilização do limite</span>
                      <span className={`font-semibold ${utilization > 80 ? "text-destructive" : utilization > 60 ? "text-yellow-500" : "text-foreground"}`}>
                        {utilization}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${utilization > 80 ? "bg-destructive" : utilization > 60 ? "bg-yellow-500" : "bg-primary"}`}
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

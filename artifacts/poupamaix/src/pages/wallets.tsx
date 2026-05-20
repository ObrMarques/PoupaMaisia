import { useState } from "react";
import {
  useGetWallets, useCreateWallet, useUpdateWallet, useDeleteWallet,
  getGetWalletsQueryKey, getGetDashboardSummaryQueryKey,
  getGetSpendingByCategoryQueryKey, getGetMonthlyTrendQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/currency-input";
import { UpgradeModal } from "@/components/upgrade-modal";
import { PluggySyncButton, PluggyDisconnectButton } from "@/components/pluggy-connect";
import {
  Plus, Pencil, Trash2, Wallet, Building2,
  Landmark, Briefcase, PiggyBank, DollarSign, CreditCard, Banknote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const PRESET_COLORS = [
  "#1A1A1A", "#3B82F6", "#10B981", "#F59E0B",
  "#EF4444", "#8B5CF6", "#EC4899", "#F97316",
  "#06B6D4", "#6B7280",
];

// Icon identifiers stored in DB
type WalletIconId = "wallet" | "landmark" | "briefcase" | "piggy-bank" | "dollar" | "credit-card" | "banknote";

const WALLET_ICON_MAP: Record<string, LucideIcon> = {
  wallet: Wallet,
  landmark: Landmark,
  briefcase: Briefcase,
  "piggy-bank": PiggyBank,
  dollar: DollarSign,
  "credit-card": CreditCard,
  banknote: Banknote,
  // Legacy emoji fallbacks — map old DB values to icons
  "💰": Wallet,
  "🏦": Landmark,
  "💼": Briefcase,
  "🐷": PiggyBank,
};

const PRESET_ICONS: WalletIconId[] = ["wallet", "landmark", "briefcase", "piggy-bank", "dollar", "credit-card", "banknote"];

function WalletIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = WALLET_ICON_MAP[icon] ?? Wallet;
  return <Icon className={className ?? "w-5 h-5"} />;
}

interface WalletFormState {
  name: string;
  color: string;
  icon: string;
  initialBalance: string;
}

const defaultForm: WalletFormState = { name: "", color: "#3B82F6", icon: "wallet", initialBalance: "" };

const FREE_WALLET_LIMIT = 2;

export default function Wallets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currency = user?.currency || "BRL";
  const { isPremium } = useSubscription();

  const { data: wallets, isLoading } = useGetWallets();
  const createMutation = useCreateWallet();
  const updateMutation = useUpdateWallet();
  const deleteMutation = useDeleteWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [form, setForm]               = useState<WalletFormState>(defaultForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetWalletsQueryKey(),             refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey(),    refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: getGetSpendingByCategoryQueryKey(), refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: getGetMonthlyTrendQueryKey(),        refetchType: 'all' });
  };

  const openCreate = () => {
    if (!isPremium && (wallets?.length ?? 0) >= FREE_WALLET_LIMIT) {
      setShowUpgrade(true);
      return;
    }
    setEditingId(null);
    setForm(defaultForm);
    setIsModalOpen(true);
  };

  const openEdit = (w: any) => {
    setEditingId(w.id);
    setForm({ name: w.name, color: w.color, icon: w.icon, initialBalance: (w.initialBalance ?? 0).toFixed(2) });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const initialBalance = form.initialBalance ? parseFloat(form.initialBalance) : 0;
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: { name: form.name, color: form.color, icon: form.icon, initialBalance } }, {
        onSuccess: () => { setIsModalOpen(false); invalidate(); },
      });
    } else {
      createMutation.mutate({ data: { name: form.name, color: form.color, icon: form.icon, initialBalance } }, {
        onSuccess: () => { setIsModalOpen(false); invalidate(); },
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSettled: () => { setConfirmDeleteId(null); invalidate(); },
    });
  };

  const totalBalance = (wallets ?? []).reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carteiras</h1>
          <p className="text-muted-foreground">Gerencie suas contas e fontes de dinheiro.</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Dialog open={isModalOpen} onOpenChange={(v) => { setIsModalOpen(v); if (!v) { setEditingId(null); setForm(defaultForm); } }}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} data-testid="button-add-wallet">
                <Plus className="w-4 h-4 mr-2" /> Nova Carteira
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[440px]">
              <DialogHeader>
                <DialogTitle>{editingId !== null ? "Editar Carteira" : "Nova Carteira"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    placeholder="Ex: Conta Corrente, Poupança..."
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="bg-background"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label>Saldo inicial</Label>
                  <CurrencyInput
                    value={form.initialBalance}
                    onValueChange={v => setForm(f => ({ ...f, initialBalance: v }))}
                    className="bg-background"
                    placeholder="R$ 0,00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Valor que você já possui nessa conta antes de registrar transações.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Ícone</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_ICONS.map(iconId => (
                      <button
                        key={iconId}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, icon: iconId }))}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          form.icon === iconId ? "bg-secondary ring-2 ring-foreground" : "bg-secondary/50 hover:bg-secondary"
                        }`}
                        style={{ color: form.color }}
                      >
                        <WalletIcon icon={iconId} className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, color }))}
                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                          form.color === color ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${form.color}22`, border: `2px solid ${form.color}`, color: form.color }}
                  >
                    <WalletIcon icon={form.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{form.name || "Nome da carteira"}</p>
                    {form.initialBalance && parseFloat(form.initialBalance) !== 0 && (
                      <p className="text-xs text-muted-foreground">
                        Saldo inicial: {formatCurrency(parseFloat(form.initialBalance), currency)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button
                  onClick={handleSave}
                  disabled={!form.name.trim() || createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {(wallets ?? []).length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Saldo total em carteiras</span>
              </div>
              <span className={`font-bold text-lg tabular-nums ${totalBalance >= 0 ? "text-[#00C851]" : "text-[#FF4444]"}`}>
                {formatCurrency(totalBalance, currency)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center text-muted-foreground">Carregando...</CardContent>
          </Card>
        ) : (wallets ?? []).length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Nenhuma carteira criada ainda.</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" onClick={openCreate} className="bg-background">
                  <Plus className="w-4 h-4 mr-2" /> Criar primeira carteira
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          (wallets ?? []).map((w) => (
            <Card key={w.id} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 relative"
                    style={{ backgroundColor: `${w.color}22`, border: `2px solid ${w.color}`, color: w.color }}
                  >
                    <WalletIcon icon={w.icon} className="w-6 h-6" />
                    {w.pluggyAccountId && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-background border border-border flex items-center justify-center">
                        <Building2 className="w-2.5 h-2.5 text-muted-foreground" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold truncate">{w.name}</p>
                      {w.pluggyAccountId && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground font-medium">
                          Open Finance
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={`text-sm font-medium tabular-nums ${w.balance >= 0 ? "text-[#00C851]" : "text-[#FF4444]"}`}>
                        {formatCurrency(w.balance, currency)}
                      </p>
                      {w.initialBalance !== 0 && (
                        <p className="text-xs text-muted-foreground">
                          saldo inicial: {formatCurrency(w.initialBalance, currency)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {w.pluggyAccountId && (
                      <>
                        <PluggySyncButton walletId={w.id} onSynced={invalidate} />
                        <PluggyDisconnectButton walletId={w.id} onDisconnected={invalidate} />
                      </>
                    )}
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(w)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setConfirmDeleteId(w.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={confirmDeleteId !== null} onOpenChange={(v) => { if (!v) setConfirmDeleteId(null); }}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Excluir carteira?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            As transações vinculadas a esta carteira não serão excluídas, apenas desvinculadas.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => confirmDeleteId !== null && handleDelete(confirmDeleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="Carteiras ilimitadas"
      />
    </div>
  );
}

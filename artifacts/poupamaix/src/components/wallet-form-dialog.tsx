import { useState, useEffect } from "react";
import {
  useCreateWallet, useUpdateWallet, useGetWallets,
  getGetWalletsQueryKey, getGetDashboardSummaryQueryKey,
  getGetSpendingByCategoryQueryKey, getGetMonthlyTrendQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useI18n } from "@/contexts/i18n-context";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/currency-input";
import { UpgradeModal } from "@/components/upgrade-modal";
import {
  Wallet, Landmark, Briefcase, PiggyBank, DollarSign, CreditCard, Banknote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const PRESET_COLORS = [
  "#1A1A1A", "#3B82F6", "#10B981", "#F59E0B",
  "#EF4444", "#8B5CF6", "#EC4899", "#F97316",
  "#06B6D4", "#6B7280",
];

type WalletIconId = "wallet" | "landmark" | "briefcase" | "piggy-bank" | "dollar" | "credit-card" | "banknote";

const WALLET_ICON_MAP: Record<string, LucideIcon> = {
  wallet: Wallet,
  landmark: Landmark,
  briefcase: Briefcase,
  "piggy-bank": PiggyBank,
  dollar: DollarSign,
  "credit-card": CreditCard,
  banknote: Banknote,
  "💰": Wallet,
  "🏦": Landmark,
  "💼": Briefcase,
  "🐷": PiggyBank,
};

const PRESET_ICONS: WalletIconId[] = ["wallet", "landmark", "briefcase", "piggy-bank", "dollar", "credit-card", "banknote"];

const FREE_WALLET_LIMIT = 2;

interface WalletFormState {
  name: string;
  color: string;
  icon: string;
  initialBalance: string;
}

const defaultForm: WalletFormState = { name: "", color: "#3B82F6", icon: "wallet", initialBalance: "" };

function WalletIconComp({ icon, className }: { icon: string; className?: string }) {
  const Icon = WALLET_ICON_MAP[icon] ?? Wallet;
  return <Icon className={className ?? "w-5 h-5"} />;
}

export interface WalletFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingWallet?: { id: number; name: string; color: string; icon: string; initialBalance: number } | null;
  onSuccess?: () => void;
}

export function WalletFormDialog({ open, onOpenChange, editingWallet, onSuccess }: WalletFormDialogProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { isPremium } = useSubscription();
  const currency = user?.currency || "BRL";

  const { data: wallets } = useGetWallets();
  const createMutation = useCreateWallet();
  const updateMutation = useUpdateWallet();

  const [form, setForm] = useState<WalletFormState>(defaultForm);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isEditing = !!editingWallet;

  useEffect(() => {
    if (!open) return;
    if (editingWallet) {
      setForm({
        name: editingWallet.name,
        color: editingWallet.color,
        icon: editingWallet.icon,
        initialBalance: editingWallet.initialBalance !== 0 ? editingWallet.initialBalance.toFixed(2) : "",
      });
    } else {
      setForm(defaultForm);
    }
  }, [open, editingWallet]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetWalletsQueryKey(),             refetchType: "all" });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey(),    refetchType: "all" });
    queryClient.invalidateQueries({ queryKey: getGetSpendingByCategoryQueryKey(), refetchType: "all" });
    queryClient.invalidateQueries({ queryKey: getGetMonthlyTrendQueryKey(),        refetchType: "all" });
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const initialBalance = form.initialBalance ? parseFloat(form.initialBalance) : 0;

    if (isEditing) {
      updateMutation.mutate(
        { id: editingWallet.id, data: { name: form.name, color: form.color, icon: form.icon, initialBalance } },
        { onSuccess: () => { onOpenChange(false); invalidate(); onSuccess?.(); } }
      );
    } else {
      if (!isPremium && (wallets?.length ?? 0) >= FREE_WALLET_LIMIT) {
        onOpenChange(false);
        setShowUpgrade(true);
        return;
      }
      createMutation.mutate(
        { data: { name: form.name, color: form.color, icon: form.icon, initialBalance } },
        { onSuccess: () => { onOpenChange(false); invalidate(); onSuccess?.(); } }
      );
    }
  };

  const isBusy = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          aria-describedby={undefined}
          className={cn(
            "p-0 gap-0 border-0 shadow-2xl overflow-hidden",
            "w-[calc(100%-32px)] max-w-[440px]",
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
              {isEditing ? t("wallets.editWallet") : t("wallets.newWallet")}
            </DialogTitle>
          </div>

          {/* ── Scrollable body ────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 pb-2 min-h-0">
            <div className="space-y-5 py-2">

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t("wallets.name")}
                </label>
                <Input
                  placeholder={t("wallets.namePlaceholder")}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="h-11 bg-secondary border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </div>

              {/* Initial balance */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t("wallets.initialBalance")}
                </label>
                <CurrencyInput
                  value={form.initialBalance}
                  onValueChange={v => setForm(f => ({ ...f, initialBalance: v }))}
                  className="h-11 bg-secondary border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-ring/40"
                  placeholder="R$ 0,00"
                />
                <p className="text-xs text-muted-foreground">{t("wallets.initialBalanceDesc")}</p>
              </div>

              {/* Icon */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t("wallets.icon")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_ICONS.map(iconId => (
                    <button
                      key={iconId}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, icon: iconId }))}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        form.icon === iconId
                          ? "bg-secondary ring-2 ring-foreground"
                          : "bg-secondary/60 hover:bg-secondary"
                      )}
                      style={{ color: form.color }}
                    >
                      <WalletIconComp icon={iconId} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t("wallets.color")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, color }))}
                      className={cn(
                        "w-8 h-8 rounded-full transition-transform hover:scale-110",
                        form.color === color ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 pb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${form.color}22`, border: `2px solid ${form.color}`, color: form.color }}
                >
                  <WalletIconComp icon={form.icon} className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">{form.name || t("wallets.previewPlaceholder")}</p>
                  {form.initialBalance && parseFloat(form.initialBalance) !== 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t("wallets.initialBalance")}: {formatCurrency(parseFloat(form.initialBalance), currency)}
                    </p>
                  )}
                </div>
              </div>

            </div>
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
            <Button
              className="flex-1 h-12 text-base font-semibold rounded-xl bg-foreground hover:bg-foreground/90 text-background transition-all"
              onClick={handleSave}
              disabled={!form.name.trim() || isBusy}
            >
              {isBusy ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="Carteiras ilimitadas"
      />
    </>
  );
}

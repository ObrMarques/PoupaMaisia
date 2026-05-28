import { useState } from "react";
import {
  useGetWallets, useDeleteWallet,
  getGetWalletsQueryKey, getGetDashboardSummaryQueryKey,
  getGetSpendingByCategoryQueryKey, getGetMonthlyTrendQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/contexts/i18n-context";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WalletFormDialog } from "@/components/wallet-form-dialog";
import { PluggySyncButton, PluggyDisconnectButton } from "@/components/pluggy-connect";
import {
  Plus, Pencil, Trash2, Wallet, Building2,
  Landmark, Briefcase, PiggyBank, DollarSign, CreditCard, Banknote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

function WalletIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = WALLET_ICON_MAP[icon] ?? Wallet;
  return <Icon className={className ?? "w-5 h-5"} />;
}

export default function Wallets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const currency = user?.currency || "BRL";

  const { data: wallets, isLoading } = useGetWallets({
    query: { staleTime: 0, queryKey: getGetWalletsQueryKey() },
  });
  const deleteMutation = useDeleteWallet();

  const [isFormOpen, setIsFormOpen]                   = useState(false);
  const [editingWallet, setEditingWallet]             = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId]         = useState<number | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetWalletsQueryKey(),             refetchType: "all" });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey(),    refetchType: "all" });
    queryClient.invalidateQueries({ queryKey: getGetSpendingByCategoryQueryKey(), refetchType: "all" });
    queryClient.invalidateQueries({ queryKey: getGetMonthlyTrendQueryKey(),        refetchType: "all" });
  };

  const openCreate = () => {
    setEditingWallet(null);
    setIsFormOpen(true);
  };

  const openEdit = (w: any) => {
    setEditingWallet(w);
    setIsFormOpen(true);
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
          <h1 className="text-3xl font-bold tracking-tight">{t("wallets.title")}</h1>
          <p className="text-muted-foreground">{t("wallets.subtitle")}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button onClick={openCreate} data-testid="button-add-wallet">
            <Plus className="w-4 h-4 mr-2" /> {t("wallets.newWallet")}
          </Button>
        </div>
      </div>

      {(wallets ?? []).length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t("wallets.totalBalance")}</span>
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
            <CardContent className="p-8 text-center text-muted-foreground">{t("wallets.loading")}</CardContent>
          </Card>
        ) : (wallets ?? []).length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{t("wallets.noWallets")}</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" onClick={openCreate} className="bg-background">
                  <Plus className="w-4 h-4 mr-2" /> {t("wallets.createFirst")}
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
                          {t("wallets.initialBalance").toLowerCase()}: {formatCurrency(w.initialBalance, currency)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
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

      <WalletFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingWallet={editingWallet}
        onSuccess={invalidate}
      />

      <Dialog open={confirmDeleteId !== null} onOpenChange={(v) => { if (!v) setConfirmDeleteId(null); }}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>{t("wallets.deleteTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("wallets.deleteDesc")}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>{t("common.cancel")}</Button>
            <Button
              variant="destructive"
              onClick={() => confirmDeleteId !== null && handleDelete(confirmDeleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t("wallets.deleting") : t("common.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

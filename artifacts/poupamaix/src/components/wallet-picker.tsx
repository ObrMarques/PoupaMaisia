import { useGetWallets } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";

interface WalletPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: number | null;
  onSelect: (id: number | null, name: string | null, color: string | null) => void;
}

export function WalletPicker({ open, onOpenChange, value, onSelect }: WalletPickerProps) {
  const { data: wallets } = useGetWallets();
  const { user } = useAuth();
  const currency = user?.currency || "BRL";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-[380px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selecionar Carteira</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <button
            type="button"
            onClick={() => { onSelect(null, null, null); onOpenChange(false); }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg border text-sm transition-colors text-left ${
              value === null
                ? "border-foreground bg-secondary font-medium"
                : "border-border hover:bg-secondary/50"
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className={value === null ? "font-medium" : "text-muted-foreground"}>
              Sem carteira
            </span>
            {value === null && (
              <div className="ml-auto w-4 h-4 rounded-full bg-foreground shrink-0" />
            )}
          </button>

          {(wallets ?? []).map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => { onSelect(w.id, w.name, w.color); onOpenChange(false); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg border text-sm transition-colors text-left ${
                value === w.id
                  ? "border-foreground bg-secondary font-medium"
                  : "border-border hover:bg-secondary/50"
              }`}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base"
                style={{ backgroundColor: `${w.color}22`, border: `2px solid ${w.color}` }}
              >
                {w.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{w.name}</p>
                <p className="text-xs text-muted-foreground">
                  Saldo: {formatCurrency(w.balance, currency)}
                </p>
              </div>
              {value === w.id && (
                <div className="ml-auto w-4 h-4 rounded-full bg-foreground shrink-0" />
              )}
            </button>
          ))}

          {(wallets ?? []).length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Nenhuma carteira criada ainda.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

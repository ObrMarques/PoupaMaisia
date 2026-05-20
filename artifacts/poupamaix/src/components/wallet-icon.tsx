import {
  Wallet, Landmark, Briefcase, PiggyBank,
  DollarSign, CreditCard, Banknote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const WALLET_ICON_MAP: Record<string, LucideIcon> = {
  wallet:         Wallet,
  landmark:       Landmark,
  briefcase:      Briefcase,
  "piggy-bank":   PiggyBank,
  dollar:         DollarSign,
  "credit-card":  CreditCard,
  banknote:       Banknote,
  // Legacy emoji fallbacks
  "💰": Wallet,
  "🏦": Landmark,
  "💼": Briefcase,
  "🐷": PiggyBank,
};

interface WalletIconProps {
  icon: string;
  color: string;
  size?: "sm" | "md";
}

export function WalletIcon({ icon, color, size = "md" }: WalletIconProps) {
  const Icon = WALLET_ICON_MAP[icon] ?? Wallet;
  const containerSize = size === "sm" ? "w-5 h-5" : "w-9 h-9";
  const iconSize      = size === "sm" ? "w-3 h-3"  : "w-4 h-4";
  const borderWidth   = size === "sm" ? "1.5px"    : "2px";

  return (
    <div
      className={`${containerSize} rounded-full flex items-center justify-center shrink-0`}
      style={{ backgroundColor: `${color}22`, border: `${borderWidth} solid ${color}`, color }}
    >
      <Icon className={iconSize} />
    </div>
  );
}

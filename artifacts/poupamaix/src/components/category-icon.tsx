import {
  UtensilsCrossed, ShoppingCart, Pill, Bus, Fuel, CarTaxiFront,
  House, Droplets, Zap, Wifi, MonitorPlay, BookOpen, GraduationCap,
  PartyPopper, Plane, ShoppingBag, HeartPulse, Dumbbell, Repeat,
  PawPrint, ReceiptText, CreditCard, TrendingUp, Wallet, Laptop,
  BarChart3, Gift, Folder, PlusCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  "Alimentação":           UtensilsCrossed,
  "Mercado":               ShoppingCart,
  "Farmácia":              Pill,
  "Transporte":            Bus,
  "Combustível":           Fuel,
  "Uber":                  CarTaxiFront,
  "Moradia":               House,
  "Água":                  Droplets,
  "Energia":               Zap,
  "Internet":              Wifi,
  "Streaming":             MonitorPlay,
  "Educação":              BookOpen,
  "Faculdade":             GraduationCap,
  "Lazer":                 PartyPopper,
  "Viagens":               Plane,
  "Compras":               ShoppingBag,
  "Saúde":                 HeartPulse,
  "Academia":              Dumbbell,
  "Assinaturas":           Repeat,
  "Pets":                  PawPrint,
  "Impostos":              ReceiptText,
  "Cartão de crédito":     CreditCard,
  "Investimentos":         TrendingUp,
  "Salário":               Wallet,
  "Freelance":             Laptop,
  "Rendimentos":           BarChart3,
  "Presente":              Gift,
  "Outros":                Folder,
  "Categoria personalizada": PlusCircle,
};

interface CategoryIconProps {
  name: string;
  color?: string;
  className?: string;
}

export function CategoryIcon({ name, color, className }: CategoryIconProps) {
  const Icon = CATEGORY_ICON_MAP[name] ?? Folder;
  const iconColor = color || "#6C5CE7";

  return (
    <div
      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${className ?? ""}`}
      style={{ backgroundColor: `${iconColor}20`, color: iconColor }}
    >
      <Icon className="w-5 h-5" />
    </div>
  );
}

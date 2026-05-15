import { Input } from "@/components/ui/input";
import { forwardRef } from "react";

function formatDisplay(numericStr: string): string {
  const num = parseFloat(numericStr || "0");
  if (!numericStr || isNaN(num) || num === 0) return "";
  const cents = Math.round(num * 100);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

interface CurrencyInputProps
  extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value" | "type"> {
  value: string;
  onValueChange: (numericStr: string) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, placeholder = "R$ 0,00", ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "");
      if (!digits || digits === "0") {
        onValueChange("");
        return;
      }
      const cents = parseInt(digits, 10);
      onValueChange((cents / 100).toFixed(2));
    };

    return (
      <Input
        ref={ref}
        value={formatDisplay(value)}
        onChange={handleChange}
        placeholder={placeholder}
        inputMode="numeric"
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

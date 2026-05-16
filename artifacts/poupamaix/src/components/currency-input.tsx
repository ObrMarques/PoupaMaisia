import { Input } from "@/components/ui/input";
import { forwardRef, useState, useRef } from "react";

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

function parseRawInput(raw: string): string {
  let s = raw.trim();
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    if (lastComma > lastDot) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    s = s.replace(",", ".");
  }
  s = s.replace(/[^\d.]/g, "");
  const num = parseFloat(s);
  if (!s || isNaN(num) || num === 0) return "";
  return num.toFixed(2);
}

interface CurrencyInputProps
  extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value" | "type"> {
  value: string;
  onValueChange: (numericStr: string) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, placeholder = "R$ 0,00", ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const combinedRef = (node: HTMLInputElement) => {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      setTimeout(() => e.target.select(), 0);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onValueChange(parseRawInput(e.target.value));
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange(e.target.value);
    };

    return (
      <Input
        ref={combinedRef}
        value={focused ? value : formatDisplay(value)}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        inputMode="decimal"
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

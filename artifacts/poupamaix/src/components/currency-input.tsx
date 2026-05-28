import { Input } from "@/components/ui/input";
import { forwardRef, useState, useEffect } from "react";

/**
 * Parse any textual representation of a monetary value to integer cents.
 * Handles: "R$ 1.250,05", "1250.05", "1250,05", "1250", paste from clipboard, etc.
 */
function parseToCents(raw: string): number {
  if (!raw) return 0;
  let s = raw.replace(/[R$\s]/g, "").trim();
  if (!s) return 0;
  const hasComma = s.includes(",");
  const hasDot   = s.includes(".");
  if (hasComma && hasDot) {
    // BRL "1.250,05" → comma is decimal; USD "1,250.05" → dot is decimal
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    // "1250,05" — comma is decimal separator
    s = s.replace(",", ".");
  }
  const n = parseFloat(s);
  if (isNaN(n)) return 0;
  return Math.round(n * 100);
}

/** Convert a decimal string (external API) → integer cents */
function valueToCents(value: string): number {
  if (!value) return 0;
  const n = parseFloat(value);
  return isNaN(n) ? 0 : Math.round(n * 100);
}

/** Format integer cents as BRL display string ("R$ 1.250,05") or "" if zero */
function centsToDisplay(cents: number): string {
  if (cents <= 0) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/** Convert integer cents → decimal string for external API ("1250.05") or "" if zero */
function centsToValue(cents: number): string {
  if (cents <= 0) return "";
  return (cents / 100).toFixed(2);
}

/** Maximum accepted value: R$ 99.999.999,99 */
const MAX_CENTS = 9_999_999_99;

interface CurrencyInputProps
  extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value" | "type"> {
  /** Decimal string: "" | "0" | "1250.05" */
  value: string;
  /** Called with updated decimal string on every change */
  onValueChange: (numericStr: string) => void;
}

/**
 * Real-time currency input — "centavo primeiro" style (Nubank / Inter UX).
 *
 * • Every digit typed appends to the right and shifts the decimal left.
 *   Ex: 0 → 1 → 10 → 100 → 1.000,00 (in BRL display)
 * • Backspace removes the last digit (shifts right).
 * • Delete clears the field.
 * • Value is always formatted; no focus/blur mode switching.
 * • External API: `value` and `onValueChange` use plain decimal strings ("1250.05").
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, placeholder = "R$ 0,00", ...props }, ref) => {
    const [cents, setCents] = useState(() => valueToCents(value));

    // Sync when parent resets or pre-fills the field from outside
    useEffect(() => {
      const incoming = valueToCents(value);
      setCents(prev => (incoming !== prev ? incoming : prev));
    }, [value]);

    const updateCents = (newCents: number) => {
      const clamped = Math.max(0, Math.min(newCents, MAX_CENTS));
      setCents(clamped);
      onValueChange(centsToValue(clamped));
    };

    // ── Desktop: intercept key presses before the browser mutates the input ──
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Always allow browser shortcuts (Ctrl/Cmd + C/V/A/Z/X/R/F5 etc.)
      if (e.ctrlKey || e.metaKey) return;

      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        updateCents(cents * 10 + parseInt(e.key, 10));
      } else if (e.key === "Backspace") {
        e.preventDefault();
        updateCents(Math.floor(cents / 10));
      } else if (e.key === "Delete") {
        e.preventDefault();
        updateCents(0);
      } else if (
        e.key === "Tab" ||
        e.key === "Enter" ||
        e.key === "Escape" ||
        e.key.startsWith("Arrow") ||
        e.key.startsWith("F")
      ) {
        // Navigation / function keys — allow through
      } else {
        // Block everything else (letters, punctuation, etc.)
        e.preventDefault();
      }
    };

    // ── Mobile fallback: handle onChange for soft-keyboards ──
    // On desktop with onKeyDown+preventDefault this fires only for Ctrl+V paste;
    // on Android soft keyboards onKeyDown may not fire, so this handles those cases.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "");
      if (!digits) {
        updateCents(0);
        return;
      }
      updateCents(Math.min(parseInt(digits, 10), MAX_CENTS));
    };

    // ── Paste: parse whatever is in the clipboard ──
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      updateCents(parseToCents(e.clipboardData.getData("text")));
    };

    // ── Focus: move cursor to end so digits append naturally ──
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      const len = e.target.value.length;
      requestAnimationFrame(() => {
        e.target.setSelectionRange(len, len);
      });
      props.onFocus?.(e);
    };

    return (
      <Input
        ref={ref}
        value={centsToDisplay(cents)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={handleFocus}
        placeholder={placeholder}
        inputMode="numeric"
        autoComplete="off"
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

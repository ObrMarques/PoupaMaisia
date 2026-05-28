/**
 * Format a numeric amount as a localized currency string.
 * Used for display only — never for input fields.
 */
export function formatCurrency(amount: number, currency: string = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Parse a decimal string returned by CurrencyInput ("1250.05" | "") to a JS number.
 * Returns 0 for empty/invalid values.
 */
export function parseCurrencyInput(value: string): number {
  if (!value) return 0;
  const n = parseFloat(value);
  return isNaN(n) ? 0 : n;
}

/**
 * Convert a decimal string from CurrencyInput to integer cents.
 * Useful when the API or DB stores amounts as cents.
 */
export function parseCurrencyToCents(value: string): number {
  return Math.round(parseCurrencyInput(value) * 100);
}

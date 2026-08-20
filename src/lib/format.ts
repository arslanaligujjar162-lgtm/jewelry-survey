export function formatPKR(amount: number): string {
  // Deliberately avoids Intl's `style: "currency"` — the PKR currency
  // symbol/spacing that ICU renders differs across Node/runtime builds
  // (e.g. "Rs", "PKR", or "₨" depending on the environment's ICU data), so
  // relying on it and string-replacing risks a different label per
  // deployment. Formatting the number and prefixing a fixed label keeps it
  // deterministic everywhere.
  const formatted = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(Math.round(amount));
  return `Rs. ${formatted}`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

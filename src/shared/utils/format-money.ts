export function formatMoney(value: string | number, currency = "VND"): string {
  const raw = typeof value === "number" ? String(value) : value;
  // Keep string representation to avoid float rounding for display;
  // Intl.NumberFormat still needs a number, but we ensure 2-decimal strings
  // like "199999.99" are formatted without losing cents when currency needs it.
  // VND is zero-decimal, so we parse and format; for other currencies keep decimals.
  const amount = Number(raw);
  if (currency === "VND") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

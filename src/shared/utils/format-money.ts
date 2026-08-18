export function formatMoney(value: string | number, currency = "VND"): string {
  const amount = typeof value === "number" ? value : Number(value);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

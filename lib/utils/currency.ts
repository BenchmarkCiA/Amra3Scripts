export type Currency = "USD" | "ILS" | "GBP"

const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  ILS: 3.7,
  GBP: 0.79,
}

export function convertPrice(priceUSD: number, currency: Currency): number {
  return priceUSD * EXCHANGE_RATES[currency]
}

export function formatPrice(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<Currency, string> = { USD: "$", ILS: "₪", GBP: "£" }
  return symbols[currency]
}

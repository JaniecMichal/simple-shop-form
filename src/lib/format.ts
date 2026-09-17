export function formatGrossPrice(value: number, currency: string) {
  const amount = value.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${amount} ${currency}`
}

export const MANUFACTURERS = [
  { id: "apple", label: "Apple" },
  { id: "samsung", label: "Samsung" },
  { id: "sony", label: "Sony" },
  { id: "bosch", label: "Bosch" },
  { id: "xiaomi", label: "Xiaomi" },
  { id: "dell", label: "Dell" },
  { id: "lg", label: "LG" },
] as const

export const CATEGORIES = [
  { id: "komputery", label: "Komputery" },
  { id: "telefony", label: "Telefony" },
  { id: "rtv", label: "RTV" },
  { id: "agd", label: "AGD" },
  { id: "akcesoria", label: "Akcesoria" },
] as const

export const FEATURES = [
  { id: "bluetooth", label: "Bluetooth" },
  { id: "wifi", label: "WiFi" },
  { id: "usb-c", label: "USB-C" },
  { id: "wodoodporny", label: "Wodoodporny" },
  { id: "bezprzewodowy", label: "Bezprzewodowy" },
  { id: "ekologiczny", label: "Ekologiczny" },
  { id: "premium", label: "Premium" },
] as const

export const VAT_RATES = [0, 5, 8, 23] as const

export const CURRENCIES = ["PLN", "EUR", "USD"] as const

export function findLabel(
  options: ReadonlyArray<{ id: string; label: string }>,
  id: string,
) {
  return options.find((option) => option.id === id)?.label ?? id
}

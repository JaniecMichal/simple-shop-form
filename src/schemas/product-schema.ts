import { z } from "zod"
import { CURRENCIES, VAT_RATES } from "@/data/product-options"

export const basicInfoObject = z.object({
  name: z.string().trim().min(3, "Nazwa produktu musi mieć min. 3 znaki"),
  sku: z
    .string()
    .trim()
    .min(1, "SKU jest wymagane")
    .max(24, "SKU może mieć maks. 24 znaki")
    .regex(/^[A-Za-z0-9]+$/, "SKU może zawierać tylko litery i cyfry"),
  description: z.string().trim(),
  manufacturerId: z.string().min(1, "Wybierz producenta"),
  categoryId: z.string().min(1, "Wybierz kategorię"),
  features: z.array(z.string()).min(1, "Wybierz co najmniej jedną cechę"),
})

export const pricingObject = z.object({
  netPrice: z.number("Podaj cenę netto").positive("Cena netto musi być większa od 0"),
  grossPrice: z
    .number("Podaj cenę brutto")
    .positive("Cena brutto musi być większa od 0"),
  vatRate: z.number().refine((value) => (VAT_RATES as readonly number[]).includes(value), {
    message: "Wybierz stawkę VAT",
  }),
  currency: z.string().refine((value) => (CURRENCIES as readonly string[]).includes(value), {
    message: "Wybierz walutę",
  }),
})

export const availabilityObject = z.object({
  isAvailable: z.boolean(),
  isLimited: z.boolean(),
  stockQuantity: z.number().int().nonnegative().nullable(),
  minCartQuantity: z
    .number("Podaj minimalną ilość")
    .int("Minimalna ilość musi być liczbą całkowitą")
    .min(1, "Minimalna ilość musi być większa od 0"),
  maxCartQuantity: z
    .number("Podaj maksymalną ilość")
    .int("Maksymalna ilość musi być liczbą całkowitą")
    .min(1, "Maksymalna ilość musi być większa od 0"),
})

export type BasicInfoValues = z.infer<typeof basicInfoObject>
export type PricingValues = z.infer<typeof pricingObject>
export type AvailabilityValues = z.infer<typeof availabilityObject>

// Shared by the step schema's superRefine and the fields' onChangeListenTo validators.
export function pricingIssues(
  values: PricingValues,
): Partial<Record<keyof PricingValues, string>> {
  const issues: Partial<Record<keyof PricingValues, string>> = {}
  const expectedGross = values.netPrice * (1 + values.vatRate / 100)
  if (Math.abs(expectedGross - values.grossPrice) > 0.02) {
    issues.grossPrice = "Cena brutto nie zgadza się z ceną netto i stawką VAT"
  }
  return issues
}

export function availabilityIssues(
  values: AvailabilityValues,
): Partial<Record<keyof AvailabilityValues, string>> {
  const issues: Partial<Record<keyof AvailabilityValues, string>> = {}
  if (values.isLimited && values.stockQuantity === null) {
    issues.stockQuantity = "Podaj ilość na magazynie"
  }
  if (values.minCartQuantity > values.maxCartQuantity) {
    issues.minCartQuantity = "Minimalna ilość nie może być większa niż maksymalna"
    issues.maxCartQuantity = "Maksymalna ilość nie może być mniejsza niż minimalna"
  }
  return issues
}

export const basicInfoSchema = basicInfoObject
export const pricingSchema = pricingObject.superRefine((values, ctx) => {
  for (const [path, message] of Object.entries(pricingIssues(values))) {
    ctx.addIssue({ code: "custom", path: [path], message })
  }
})
export const availabilitySchema = availabilityObject.superRefine((values, ctx) => {
  for (const [path, message] of Object.entries(availabilityIssues(values))) {
    ctx.addIssue({ code: "custom", path: [path], message })
  }
})

export const productFormSchema = basicInfoObject
  .extend(pricingObject.shape)
  .extend(availabilityObject.shape)
  .superRefine((values, ctx) => {
    for (const [path, message] of Object.entries(pricingIssues(values))) {
      ctx.addIssue({ code: "custom", path: [path], message })
    }
    for (const [path, message] of Object.entries(availabilityIssues(values))) {
      ctx.addIssue({ code: "custom", path: [path], message })
    }
  })

export type ProductFormValues = z.infer<typeof productFormSchema>

export const BASIC_INFO_FIELDS = Object.keys(basicInfoObject.shape) as Array<
  keyof BasicInfoValues
>
export const PRICING_FIELDS = Object.keys(pricingObject.shape) as Array<keyof PricingValues>
export const AVAILABILITY_FIELDS = Object.keys(availabilityObject.shape) as Array<
  keyof AvailabilityValues
>

export const defaultProductFormValues: ProductFormValues = {
  name: "",
  sku: "",
  description: "",
  manufacturerId: "",
  categoryId: "",
  features: [],
  netPrice: 0,
  grossPrice: 0,
  vatRate: 23,
  currency: "PLN",
  isAvailable: true,
  isLimited: false,
  stockQuantity: null,
  minCartQuantity: 1,
  maxCartQuantity: 10,
}

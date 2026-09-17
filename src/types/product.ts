import type { ProductFormValues } from "@/schemas/product-schema"

export interface Product extends ProductFormValues {
  id: string
}

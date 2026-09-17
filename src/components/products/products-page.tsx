import type { Product } from "@/types/product"
import { AddProductDialog } from "@/components/products/add-product-dialog"
import { ProductTable } from "@/components/products/product-table"

export function ProductsPage({
  products,
  onAddProduct,
}: {
  products: Product[]
  onAddProduct: (product: Product) => void
}) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">Produkty</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} produktów w katalogu
          </p>
        </div>
        <AddProductDialog onAddProduct={onAddProduct} />
      </div>

      <ProductTable products={products} />
    </div>
  )
}

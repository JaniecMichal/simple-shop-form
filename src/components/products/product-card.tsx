import type { Product } from "@/types/product"
import { CATEGORIES, findLabel } from "@/data/product-options"
import { formatGrossPrice } from "@/lib/format"
import { StatusBadge } from "@/components/products/status-badge"

// Figma's mobile frame swaps the table for a card per product (name/SKU/status
// up top, category/price/stock in a muted mini-grid below) rather than just
// squeezing the table's columns into a narrower viewport.
export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-foreground">{product.name}</p>
          <p className="text-xs text-muted-foreground">{product.sku}</p>
        </div>
        <StatusBadge isAvailable={product.isAvailable} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3">
        <div>
          <p className="text-xs text-muted-foreground">Kategoria</p>
          <p className="text-sm text-foreground">
            {findLabel(CATEGORIES, product.categoryId)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Cena brutto</p>
          <p className="text-sm font-medium text-foreground">
            {formatGrossPrice(product.grossPrice, product.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Magazyn</p>
          <p className="text-sm text-foreground">
            {product.isLimited ? product.stockQuantity : "—"}
          </p>
        </div>
      </div>
    </div>
  )
}

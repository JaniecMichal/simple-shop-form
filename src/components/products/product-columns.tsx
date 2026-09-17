import { createColumnHelper } from "@tanstack/react-table"
import type { Product } from "@/types/product"
import { CATEGORIES, findLabel } from "@/data/product-options"
import { formatGrossPrice } from "@/lib/format"
import { StatusBadge } from "@/components/products/status-badge"
import { productTableFeatures } from "@/components/products/product-table-features"

const columnHelper = createColumnHelper<typeof productTableFeatures, Product>()

export const productColumns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "Nazwa",
    cell: (info) => (
      <span className="font-medium text-foreground">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("sku", {
    header: "SKU",
    cell: (info) => (
      <span className="text-xs text-muted-foreground">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("categoryId", {
    header: "Kategoria",
    cell: (info) => (
      <span className="text-muted-foreground">
        {findLabel(CATEGORIES, info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("grossPrice", {
    header: "Cena Brutto",
    cell: (info) => (
      <span className="font-medium text-foreground">
        {formatGrossPrice(info.getValue(), info.row.original.currency)}
      </span>
    ),
  }),
  columnHelper.accessor("isAvailable", {
    header: "Status",
    cell: (info) => <StatusBadge isAvailable={info.getValue()} />,
  }),
  columnHelper.accessor("stockQuantity", {
    header: "Magazyn",
    cell: (info) => {
      const { isLimited, stockQuantity } = info.row.original
      return <span>{isLimited ? stockQuantity : "—"}</span>
    },
  }),
])

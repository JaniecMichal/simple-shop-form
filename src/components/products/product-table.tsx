import { parseAsInteger, useQueryState } from "nuqs"
import { flexRender, useTable } from "@tanstack/react-table"
import type { Product } from "@/types/product"
import { productColumns } from "@/components/products/product-columns"
import { productTableFeatures } from "@/components/products/product-table-features"
import { ProductCard } from "@/components/products/product-card"
import { TablePagination } from "@/components/products/table-pagination"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Small on purpose: with the 5 seed products this already produces 2 pages, so
// pagination is visible and testable without needing extra mock data.
const PAGE_SIZE = 3

export function ProductTable({ products }: { products: Product[] }) {
  // `page` is 1-based and lives in the URL (?page=), per the spec ("odświeżenie
  // strony zachowuje widok"); TanStack Table's pageIndex is 0-based, so it's
  // converted at the boundary instead of leaking one convention into the other.
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  )

  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE))
  // Clamped so a stale/out-of-range ?page= (e.g. after products shrink) can't
  // point past the last page instead of erroring.
  const pageIndex = Math.min(Math.max(page - 1, 0), pageCount - 1)

  const table = useTable({
    features: productTableFeatures,
    data: products,
    columns: productColumns,
    state: {
      pagination: { pageIndex, pageSize: PAGE_SIZE },
    },
    onPaginationChange: (updater) => {
      const current = { pageIndex, pageSize: PAGE_SIZE }
      const next = typeof updater === "function" ? updater(current) : updater
      void setPage(next.pageIndex + 1)
    },
    pageCount,
    manualPagination: false,
  })

  const rows = table.getPaginatedRowModel().rows
  const isMobile = useIsMobile()

  // Figma swaps the table for a card list below `sm` — rendered as one or the
  // other (not both, hidden via CSS) so pagination only ever exists once.
  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        {rows.length ? (
          rows.map((row) => <ProductCard key={row.id} product={row.original} />)
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Brak produktów w katalogu.
          </p>
        )}
        <TablePagination
          pageIndex={pageIndex}
          pageCount={pageCount}
          totalCount={products.length}
          onPageChange={setPage}
          className="pt-2"
        />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-xs">
      <Table>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="h-10 text-muted-foreground">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id} className="h-12">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={productColumns.length}
                className="h-24 text-center text-muted-foreground"
              >
                Brak produktów w katalogu.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination
        pageIndex={pageIndex}
        pageCount={pageCount}
        totalCount={products.length}
        onPageChange={setPage}
        className="border-t bg-muted/50 px-4 py-4"
      />
    </div>
  )
}

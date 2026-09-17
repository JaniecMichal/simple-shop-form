import { useMemo } from "react"
import { parseAsInteger, useQueryState } from "nuqs"
import { flexRender, useTable } from "@tanstack/react-table"
import type { Product } from "@/types/product"
import { productColumns } from "@/components/products/product-columns"
import { productTableFeatures } from "@/components/products/product-table-features"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
  const pageNumbers = useMemo(
    () => Array.from({ length: pageCount }, (_, index) => index + 1),
    [pageCount],
  )

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-xs">
      <Table>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="h-10 text-muted-foreground"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
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

      <div className="flex flex-col items-center justify-between gap-3 border-t bg-muted/50 px-4 py-4 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          Strona {pageIndex + 1} z {pageCount} · {products.length} produktów
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={pageIndex === 0}
            onClick={() => void setPage(pageIndex)}
          >
            <ChevronLeft />
            Wstecz
          </Button>
          {pageNumbers.map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === pageIndex + 1 ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => void setPage(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            disabled={pageIndex >= pageCount - 1}
            onClick={() => void setPage(pageIndex + 2)}
          >
            Dalej
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}

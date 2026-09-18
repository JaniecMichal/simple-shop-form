import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function getPageNumbers(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b)

  const result: Array<number | "ellipsis"> = []
  let previous = 0
  for (const page of sorted) {
    if (page - previous > 1) result.push("ellipsis")
    result.push(page)
    previous = page
  }
  return result
}

export function TablePagination({
  pageIndex,
  pageCount,
  totalCount,
  onPageChange,
  className,
}: {
  pageIndex: number
  pageCount: number
  totalCount: number
  onPageChange: (page: number) => void
  className?: string
}) {
  const pageNumbers = getPageNumbers(pageIndex + 1, pageCount)

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-3 sm:flex-row",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">
        Strona {pageIndex + 1} z {pageCount} · {totalCount} produktów
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={pageIndex === 0}
          onClick={() => onPageChange(pageIndex)}
        >
          <ChevronLeft />
          Wstecz
        </Button>
        {pageNumbers.map((pageNumber, index) =>
          pageNumber === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex size-8 items-center justify-center text-muted-foreground"
            >
              <MoreHorizontal className="size-4" />
            </span>
          ) : (
            <Button
              key={pageNumber}
              variant={pageNumber === pageIndex + 1 ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          ),
        )}
        <Button
          variant="ghost"
          size="sm"
          disabled={pageIndex >= pageCount - 1}
          onClick={() => onPageChange(pageIndex + 2)}
        >
          Dalej
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}

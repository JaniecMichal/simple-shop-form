import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1)

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
        {pageNumbers.map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={pageNumber === pageIndex + 1 ? "default" : "ghost"}
            size="icon-sm"
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
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

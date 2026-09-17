import { cn } from "@/lib/utils"

export function StatusBadge({ isAvailable }: { isAvailable: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        isAvailable
          ? "bg-green-600/10 text-green-600"
          : "bg-destructive/10 text-destructive",
      )}
    >
      {isAvailable ? "Dostępny" : "Niedostępny"}
    </span>
  )
}

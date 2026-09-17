import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"

export function FieldWrapper({
  htmlFor,
  label,
  error,
  className,
  children,
}: {
  htmlFor: string
  label: string
  error?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={htmlFor}>{label}</Label>
        {children}
      </div>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

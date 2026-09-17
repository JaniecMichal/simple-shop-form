import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StepMeta {
  id: number
  title: string
  subtitle: string
}

export function StepIndicator({
  steps,
  currentStep,
}: {
  steps: readonly StepMeta[]
  currentStep: number
}) {
  return (
    // Mobile: circle-over-text, 3 columns, no line. Desktop: circle-beside-text with a connector.
    <div className="grid grid-cols-3 gap-3 border-b px-4 py-3 sm:flex sm:items-center sm:gap-4">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isActive = isCompleted || isCurrent

        return (
          <div key={step.id} className="flex items-center gap-4 sm:flex-1 last:sm:flex-none">
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-muted text-muted-foreground",
                )}
              >
                {isCompleted ? <Check className="size-4" /> : step.id}
              </span>
              <span className="flex flex-col leading-tight">
                <span
                  className={cn(
                    "text-sm font-medium",
                    !isActive && "text-muted-foreground",
                  )}
                >
                  {step.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {step.subtitle}
                </span>
              </span>
            </div>
            {index < steps.length - 1 && (
              <span
                className={cn(
                  "hidden h-px flex-1 sm:block",
                  isCompleted ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

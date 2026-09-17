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
    <div className="flex items-center gap-4 border-b px-4 py-3">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isActive = isCompleted || isCurrent

        return (
          <div key={step.id} className="flex flex-1 items-center gap-4 last:flex-none">
            <div className="flex items-center gap-2">
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
              <span className="hidden flex-col leading-tight sm:flex">
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
                  "h-px flex-1",
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

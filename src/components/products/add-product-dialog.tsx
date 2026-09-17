import { useState } from "react"
import { Plus, ArrowLeft, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StepIndicator, type StepMeta } from "@/components/products/step-indicator"
import { StepBasicInfo } from "@/components/products/steps/step-basic-info"
import { StepPricing } from "@/components/products/steps/step-pricing"
import { StepAvailability } from "@/components/products/steps/step-availability"
import { useAppForm } from "@/hooks/form"
import {
  basicInfoSchema,
  pricingSchema,
  availabilitySchema,
  defaultProductFormValues,
  BASIC_INFO_FIELDS,
  PRICING_FIELDS,
  AVAILABILITY_FIELDS,
  type ProductFormValues,
} from "@/schemas/product-schema"
import type { Product } from "@/types/product"

interface StepConfig extends StepMeta {
  fields: readonly (keyof ProductFormValues)[]
  schema: { safeParse: (value: unknown) => { success: boolean } }
}

const STEPS: StepConfig[] = [
  {
    id: 1,
    title: "Informacje",
    subtitle: "Dane podstawowe",
    fields: BASIC_INFO_FIELDS,
    schema: basicInfoSchema,
  },
  {
    id: 2,
    title: "Cena",
    subtitle: "Dane cenowe",
    fields: PRICING_FIELDS,
    schema: pricingSchema,
  },
  {
    id: 3,
    title: "Dostępność",
    subtitle: "Stany magazynowe",
    fields: AVAILABILITY_FIELDS,
    schema: availabilitySchema,
  },
]

export function AddProductDialog({
  onAddProduct,
}: {
  onAddProduct: (product: Product) => void
}) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  const form = useAppForm({
    defaultValues: defaultProductFormValues,
  })

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setStep(0)
      form.reset()
    }
  }

  // Gates "Dalej"/"Zapisz produkt": re-runs each field's own validator (so errors
  // become visible even for fields the user never touched) and then re-checks the
  // *whole* step against its Zod schema, which also catches cross-field rules that
  // aren't tied to a single field's onChange (e.g. price/VAT consistency). Only one
  // `useAppForm` backs all 3 steps, so going back to a previous step never drops
  // already-entered values — only the currently rendered step fields are affected.
  async function handlePrimaryAction() {
    const current = STEPS[step]
    await Promise.all(current.fields.map((name) => form.validateField(name, "change")))

    const values = form.state.values
    const stepValues = Object.fromEntries(
      current.fields.map((name) => [name, values[name]]),
    )
    const result = current.schema.safeParse(stepValues)

    if (!result.success) {
      const hasVisibleError = current.fields.some(
        (name) => (form.getFieldMeta(name)?.errors?.length ?? 0) > 0,
      )
      if (!hasVisibleError) {
        toast.error("Sprawdź poprawność danych w tym kroku")
      }
      return
    }

    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
      return
    }

    const product: Product = { id: crypto.randomUUID(), ...values }
    onAddProduct(product)
    toast.success("Produkt został dodany")
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <Plus />
          Dodaj produkt
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-0 p-0 sm:max-w-[720px]">
        <div className="border-b px-4 py-6">
          <DialogTitle>Dodaj nowy produkt</DialogTitle>
          <DialogDescription className="sr-only">
            Formularz dodawania nowego produktu w trzech krokach: informacje
            podstawowe, cena oraz dostępność i stany magazynowe.
          </DialogDescription>
        </div>

        <StepIndicator steps={STEPS} currentStep={step} />

        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void handlePrimaryAction()
          }}
        >
          <div className="px-4 py-5">
            {step === 0 && <StepBasicInfo form={form} />}
            {step === 1 && <StepPricing form={form} />}
            {step === 2 && <StepAvailability form={form} />}
          </div>

          <div className="flex items-center justify-between gap-2 border-t bg-muted/30 px-4 py-4">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                <ArrowLeft />
                Wstecz
              </Button>
            ) : (
              <span />
            )}

            {step < STEPS.length - 1 ? (
              <Button type="submit" className="rounded-full">
                Dalej
                <ArrowRight />
              </Button>
            ) : (
              <Button type="submit" className="rounded-full">
                Zapisz produkt
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

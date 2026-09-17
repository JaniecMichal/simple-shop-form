import { withForm } from "@/hooks/form"
import { defaultProductFormValues, pricingObject } from "@/schemas/product-schema"
import { getFieldError } from "@/lib/form-field-error"
import { FieldWrapper } from "@/components/products/field-wrapper"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CURRENCIES, VAT_RATES } from "@/data/product-options"

function round2(value: number) {
  return Math.round(value * 100) / 100
}

// Net/gross/VAT stay in sync via onChange recalculation, not a validator.
export const StepPricing = withForm({
  defaultValues: defaultProductFormValues,
  render: function Render({ form }) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="netPrice" validators={{ onChange: pricingObject.shape.netPrice }}>
            {(field) => (
              <FieldWrapper
                htmlFor={field.name}
                label="Cena netto"
                error={getFieldError(field.state.meta.errors)}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={0}
                  step="0.01"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const net = e.target.valueAsNumber
                    field.handleChange(Number.isNaN(net) ? 0 : net)
                    const vat = form.getFieldValue("vatRate")
                    form.setFieldValue(
                      "grossPrice",
                      round2((Number.isNaN(net) ? 0 : net) * (1 + vat / 100)),
                    )
                  }}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
              </FieldWrapper>
            )}
          </form.Field>

          <form.Field name="grossPrice" validators={{ onChange: pricingObject.shape.grossPrice }}>
            {(field) => (
              <FieldWrapper
                htmlFor={field.name}
                label="Cena brutto"
                error={getFieldError(field.state.meta.errors)}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={0}
                  step="0.01"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const gross = e.target.valueAsNumber
                    field.handleChange(Number.isNaN(gross) ? 0 : gross)
                    const vat = form.getFieldValue("vatRate")
                    form.setFieldValue(
                      "netPrice",
                      round2((Number.isNaN(gross) ? 0 : gross) / (1 + vat / 100)),
                    )
                  }}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
              </FieldWrapper>
            )}
          </form.Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="vatRate" validators={{ onChange: pricingObject.shape.vatRate }}>
            {(field) => (
              <FieldWrapper
                htmlFor={field.name}
                label="Stawka VAT"
                error={getFieldError(field.state.meta.errors)}
              >
                <Select
                  value={String(field.state.value)}
                  onValueChange={(value) => {
                    const vat = Number(value)
                    field.handleChange(vat)
                    const net = form.getFieldValue("netPrice")
                    form.setFieldValue("grossPrice", round2(net * (1 + vat / 100)))
                  }}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue placeholder="Wybierz stawkę VAT" />
                  </SelectTrigger>
                  <SelectContent>
                    {VAT_RATES.map((rate) => (
                      <SelectItem key={rate} value={String(rate)}>
                        {rate}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWrapper>
            )}
          </form.Field>

          <form.Field name="currency" validators={{ onChange: pricingObject.shape.currency }}>
            {(field) => (
              <FieldWrapper
                htmlFor={field.name}
                label="Waluta"
                error={getFieldError(field.state.meta.errors)}
              >
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue placeholder="Wybierz walutę" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWrapper>
            )}
          </form.Field>
        </div>
      </div>
    )
  },
})

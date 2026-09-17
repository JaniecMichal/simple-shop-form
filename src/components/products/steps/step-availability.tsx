import { withForm } from "@/hooks/form"
import { defaultProductFormValues } from "@/schemas/product-schema"
import { getFieldError } from "@/lib/form-field-error"
import { FieldWrapper } from "@/components/products/field-wrapper"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

export const StepAvailability = withForm({
  defaultValues: defaultProductFormValues,
  render: function Render({ form }) {
    return (
      <div className="flex flex-col gap-4">
        <form.Field name="isAvailable">
          {(field) => (
            <label className="flex items-center gap-3" htmlFor={field.name}>
              <Switch
                id={field.name}
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked)}
              />
              <span className="text-sm font-medium">Produkt jest dostępny</span>
            </label>
          )}
        </form.Field>

        <Separator />

        <form.Field name="isLimited">
          {(field) => (
            <label className="flex items-center gap-3" htmlFor={field.name}>
              <Checkbox
                id={field.name}
                checked={field.state.value}
                onCheckedChange={(checked) => {
                  const isLimited = checked === true
                  field.handleChange(isLimited)
                  if (!isLimited) {
                    form.setFieldValue("stockQuantity", null)
                  } else if (form.getFieldValue("stockQuantity") === null) {
                    form.setFieldValue("stockQuantity", 0)
                  }
                }}
              />
              <span className="text-sm font-medium">Produkt limitowany</span>
            </label>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.values.isLimited}>
          {(isLimited) =>
            isLimited && (
              <form.Field
                name="stockQuantity"
                validators={{
                  onChangeListenTo: ["isLimited"],
                  onChange: ({ value, fieldApi }) => {
                    if (
                      fieldApi.form.getFieldValue("isLimited") &&
                      (value === null || value < 0)
                    ) {
                      return "Podaj nieujemną ilość na magazynie"
                    }
                    return undefined
                  },
                }}
              >
                {(field) => (
                  <FieldWrapper
                    htmlFor={field.name}
                    label="Ilość na magazynie"
                    error={getFieldError(field.state.meta.errors)}
                  >
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min={0}
                      step="1"
                      value={field.state.value ?? 0}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const value = e.target.valueAsNumber
                        field.handleChange(Number.isNaN(value) ? 0 : Math.trunc(value))
                      }}
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                  </FieldWrapper>
                )}
              </form.Field>
            )
          }
        </form.Subscribe>

        <Separator />

        <p className="text-sm font-medium">Limity koszyka</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field
            name="minCartQuantity"
            validators={{
              onChangeListenTo: ["maxCartQuantity"],
              onChange: ({ value, fieldApi }) => {
                const max = fieldApi.form.getFieldValue("maxCartQuantity")
                if (value > max) {
                  return "Minimalna ilość nie może być większa niż maksymalna"
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <FieldWrapper
                htmlFor={field.name}
                label="Minimalna ilość"
                error={getFieldError(field.state.meta.errors)}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={1}
                  step="1"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const value = e.target.valueAsNumber
                    field.handleChange(Number.isNaN(value) ? 1 : Math.trunc(value))
                  }}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
              </FieldWrapper>
            )}
          </form.Field>

          <form.Field
            name="maxCartQuantity"
            validators={{
              onChangeListenTo: ["minCartQuantity"],
              onChange: ({ value, fieldApi }) => {
                const min = fieldApi.form.getFieldValue("minCartQuantity")
                if (value < min) {
                  return "Maksymalna ilość nie może być mniejsza niż minimalna"
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <FieldWrapper
                htmlFor={field.name}
                label="Maksymalna ilość"
                error={getFieldError(field.state.meta.errors)}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={1}
                  step="1"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const value = e.target.valueAsNumber
                    field.handleChange(Number.isNaN(value) ? 1 : Math.trunc(value))
                  }}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
              </FieldWrapper>
            )}
          </form.Field>
        </div>
      </div>
    )
  },
})

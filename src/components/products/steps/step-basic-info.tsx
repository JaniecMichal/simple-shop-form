import { withForm } from "@/hooks/form"
import { defaultProductFormValues, basicInfoObject } from "@/schemas/product-schema"
import { getFieldError } from "@/lib/form-field-error"
import { FieldWrapper } from "@/components/products/field-wrapper"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { badgeVariants } from "@/components/ui/badge"
import { MANUFACTURERS, CATEGORIES, FEATURES } from "@/data/product-options"
import { cn } from "@/lib/utils"

export const StepBasicInfo = withForm({
  defaultValues: defaultProductFormValues,
  render: function Render({ form }) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field
            name="name"
            validators={{ onChange: basicInfoObject.shape.name }}
          >
            {(field) => (
              <FieldWrapper
                htmlFor={field.name}
                label="Nazwa produktu"
                error={getFieldError(field.state.meta.errors)}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder='np. MacBook Pro 14"'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
              </FieldWrapper>
            )}
          </form.Field>

          <form.Field
            name="sku"
            validators={{ onChange: basicInfoObject.shape.sku }}
          >
            {(field) => (
              <FieldWrapper
                htmlFor={field.name}
                label="SKU produktu"
                error={getFieldError(field.state.meta.errors)}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="np. MBP14M3PRO"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
              </FieldWrapper>
            )}
          </form.Field>
        </div>

        <form.Field name="description">
          {(field) => (
            <FieldWrapper htmlFor={field.name} label="Opis">
              <Textarea
                id={field.name}
                name={field.name}
                placeholder="Krótki opis produktu"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </FieldWrapper>
          )}
        </form.Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field
            name="manufacturerId"
            validators={{ onChange: basicInfoObject.shape.manufacturerId }}
          >
            {(field) => (
              <FieldWrapper
                htmlFor={field.name}
                label="Producent"
                error={getFieldError(field.state.meta.errors)}
              >
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue placeholder="Wybierz producenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {MANUFACTURERS.map((manufacturer) => (
                      <SelectItem key={manufacturer.id} value={manufacturer.id}>
                        {manufacturer.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWrapper>
            )}
          </form.Field>

          <form.Field
            name="categoryId"
            validators={{ onChange: basicInfoObject.shape.categoryId }}
          >
            {(field) => (
              <FieldWrapper
                htmlFor={field.name}
                label="Kategoria"
                error={getFieldError(field.state.meta.errors)}
              >
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue placeholder="Wybierz kategorię" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWrapper>
            )}
          </form.Field>
        </div>

        <form.Field
          name="features"
          validators={{ onChange: basicInfoObject.shape.features }}
        >
          {(field) => (
            <FieldWrapper
              htmlFor={field.name}
              label="Cechy produktu"
              error={getFieldError(field.state.meta.errors)}
            >
              <div className="flex flex-wrap gap-2" id={field.name}>
                {FEATURES.map((feature) => {
                  const isSelected = field.state.value.includes(feature.id)
                  return (
                    <button
                      key={feature.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() =>
                        field.handleChange(
                          isSelected
                            ? field.state.value.filter((id) => id !== feature.id)
                            : [...field.state.value, feature.id],
                        )
                      }
                      className={cn(
                        badgeVariants({
                          variant: isSelected ? "default" : "outline",
                        }),
                        "h-auto cursor-pointer px-3 py-1 text-sm",
                      )}
                    >
                      {feature.label}
                    </button>
                  )
                })}
              </div>
            </FieldWrapper>
          )}
        </form.Field>
      </div>
    )
  },
})

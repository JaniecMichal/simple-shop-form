export function getFieldError(errors: unknown[]): string | undefined {
  const [first] = errors
  if (!first) return undefined
  if (typeof first === "string") return first
  if (typeof first === "object" && first !== null && "message" in first) {
    return String((first as { message: unknown }).message)
  }
  return String(first)
}

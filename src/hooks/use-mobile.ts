import { useEffect, useState } from "react"

// Matches Tailwind's default `sm` breakpoint, so this agrees with the `sm:`
// classes used for the same table/dialog. Rendering the mobile vs. desktop
// layout as one or the other (not both, toggled by CSS) keeps things like
// pagination out of the DOM twice.
const MOBILE_BREAKPOINT = 640

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < MOBILE_BREAKPOINT,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    mediaQuery.addEventListener("change", onChange)
    return () => mediaQuery.removeEventListener("change", onChange)
  }, [])

  return isMobile
}

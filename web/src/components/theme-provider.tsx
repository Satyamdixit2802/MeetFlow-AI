"use client"

import * as React from 'react'
import {ThemeProvider as NextThemesProvider} from 'next-themes'

// next-themes injects a small inline script during SSR to apply the saved theme
// before the page paints. React 19 reports this as a client-rendered script in
// development, although it has already executed on the server-rendered page.
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  const originalConsoleError = console.error

  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return
    }

    originalConsoleError.apply(console, args)
  }
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

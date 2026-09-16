"use client"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppearanceProvider, useAppearance } from "@/components/theme/appearance-provider"

function ThemedToaster() {
  const { appearance } = useAppearance()
  return <Toaster theme={appearance.mode} position="bottom-center" />
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppearanceProvider>
      <TooltipProvider delay={250}>
        {children}
        <ThemedToaster />
      </TooltipProvider>
    </AppearanceProvider>
  )
}

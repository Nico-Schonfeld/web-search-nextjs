"use client"

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react"

import { applyAppearance } from "@/lib/theme/apply"
import { appearanceFromPreset, DEFAULT_APPEARANCE } from "@/lib/theme/presets"
import { loadAppearance, saveAppearance } from "@/lib/theme/storage"
import type { Appearance, ThemeId } from "@/lib/theme/types"

type AppearanceContextValue = {
  appearance: Appearance
  setAppearance: (next: Appearance | ((current: Appearance) => Appearance)) => void
  selectPreset: (id: ThemeId) => void
  resetPreset: () => void
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null)

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearanceState] = useState<Appearance>(DEFAULT_APPEARANCE)

  useLayoutEffect(() => {
    const loaded = loadAppearance()
    setAppearanceState(loaded)
    applyAppearance(loaded)
  }, [])

  const setAppearance = useCallback(
    (next: Appearance | ((current: Appearance) => Appearance)) => {
      setAppearanceState((current) => {
        const resolved = typeof next === "function" ? next(current) : next
        applyAppearance(resolved)
        saveAppearance(resolved)
        return resolved
      })
    },
    []
  )

  const selectPreset = useCallback((id: ThemeId) => {
    setAppearance((current) =>
      appearanceFromPreset(id, {
        showGmail: current.showGmail,
        showImages: current.showImages,
        showClock: current.showClock,
        showWeather: current.showWeather,
        showToday: current.showToday,
        showWorkApps: current.showWorkApps,
        showAi: current.showAi,
      })
    )
  }, [setAppearance])

  const resetPreset = useCallback(() => {
    setAppearance((current) =>
      appearanceFromPreset(current.preset, {
        showGmail: current.showGmail,
        showImages: current.showImages,
        showClock: current.showClock,
        showWeather: current.showWeather,
        showToday: current.showToday,
        showWorkApps: current.showWorkApps,
        showAi: current.showAi,
      })
    )
  }, [setAppearance])

  const value = useMemo(
    () => ({ appearance, setAppearance, selectPreset, resetPreset }),
    [appearance, resetPreset, selectPreset, setAppearance]
  )

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  )
}

export function useAppearance() {
  const context = useContext(AppearanceContext)
  if (!context) {
    throw new Error("useAppearance debe usarse dentro de AppearanceProvider")
  }
  return context
}

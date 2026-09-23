import { DEFAULT_APPEARANCE } from "./presets"
import type { Appearance, ThemeId, WordmarkStyle } from "./types"
import { APPEARANCE_KEY } from "./types"

const THEME_IDS: ThemeId[] = [
  "nexo",
  "notion",
  "facebook",
  "whatsapp",
  "instagram",
  "x",
  "vercel",
  "minimal",
  "colorful",
]

function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && THEME_IDS.includes(value as ThemeId)
}

function isWordmark(value: unknown): value is WordmarkStyle {
  return value === "google" || value === "mono" || value === "gradient"
}

export function loadAppearance(): Appearance {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE
  try {
    const raw = localStorage.getItem(APPEARANCE_KEY)
    if (!raw) return DEFAULT_APPEARANCE
    const parsed = JSON.parse(raw) as Partial<Appearance>
    return {
      ...DEFAULT_APPEARANCE,
      ...parsed,
      preset: isThemeId(parsed.preset) ? parsed.preset : DEFAULT_APPEARANCE.preset,
      mode: parsed.mode === "light" ? "light" : parsed.mode === "dark" ? "dark" : DEFAULT_APPEARANCE.mode,
      wordmark: isWordmark(parsed.wordmark)
        ? parsed.wordmark
        : DEFAULT_APPEARANCE.wordmark,
      radius:
        typeof parsed.radius === "number" && parsed.radius > 0
          ? parsed.radius
          : DEFAULT_APPEARANCE.radius,
      showGmail: parsed.showGmail ?? true,
      showImages: parsed.showImages ?? true,
      showClock: parsed.showClock ?? true,
      showWeather: parsed.showWeather ?? true,
      showNext: parsed.showNext ?? false,
      showAgenda: parsed.showAgenda ?? false,
      showNotes: parsed.showNotes ?? false,
      showWorkApps: parsed.showWorkApps ?? true,
      showAi: parsed.showAi ?? true,
    }
  } catch {
    return DEFAULT_APPEARANCE
  }
}

export function saveAppearance(appearance: Appearance) {
  localStorage.setItem(APPEARANCE_KEY, JSON.stringify(appearance))
}

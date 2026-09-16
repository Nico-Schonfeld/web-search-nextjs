import type { Appearance } from "./types"

function clamp(value: number) {
  return Math.min(255, Math.max(0, Math.round(value)))
}

export function normalizeHex(value: string) {
  const raw = value.trim()
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase()
  if (/^#[0-9a-f]{3}$/i.test(raw)) {
    const [, r, g, b] = raw
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return "#808080"
}

function hexToRgb(hex: string) {
  const value = normalizeHex(hex).slice(1)
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ] as const
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) => clamp(channel).toString(16).padStart(2, "0"))
    .join("")}`
}

function mix(a: string, b: string, amount: number) {
  const left = hexToRgb(a)
  const right = hexToRgb(b)
  return rgbToHex(
    left[0] + (right[0] - left[0]) * amount,
    left[1] + (right[1] - left[1]) * amount,
    left[2] + (right[2] - left[2]) * amount
  )
}

function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const value = channel / 255
    return value <= 0.03928
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function onColor(background: string) {
  return luminance(background) > 0.42 ? "#121212" : "#f8fafc"
}

const WORDMARK_GOOGLE = ["#8ab4f8", "#f28b82", "#fdd663", "#81c995"] as const
const WORDMARK_INSTAGRAM = ["#f9ce34", "#ee2a7b", "#6228d7", "#f77737"] as const

export function appearanceTokens(appearance: Appearance) {
  const bg = normalizeHex(appearance.background)
  const fg = normalizeHex(appearance.foreground)
  const card = normalizeHex(appearance.card)
  const primary = normalizeHex(appearance.primary)
  const searchBg = normalizeHex(appearance.searchBg)
  const searchFg = normalizeHex(appearance.searchFg)
  const muted = mix(bg, fg, appearance.mode === "dark" ? 0.12 : 0.06)
  const letters =
    appearance.wordmark === "gradient"
      ? WORDMARK_INSTAGRAM
      : appearance.wordmark === "mono"
        ? [fg, fg, fg, fg]
        : WORDMARK_GOOGLE

  return {
    "--background": bg,
    "--foreground": fg,
    "--card": card,
    "--card-foreground": fg,
    "--popover": mix(card, bg, 0.25),
    "--popover-foreground": fg,
    "--primary": primary,
    "--primary-foreground": onColor(primary),
    "--secondary": muted,
    "--secondary-foreground": fg,
    "--muted": muted,
    "--muted-foreground": mix(fg, bg, 0.38),
    "--accent": mix(primary, bg, 0.78),
    "--accent-foreground": fg,
    "--border": mix(fg, bg, appearance.mode === "dark" ? 0.16 : 0.12),
    "--input": mix(fg, bg, appearance.mode === "dark" ? 0.18 : 0.14),
    "--ring": primary,
    "--sidebar": card,
    "--sidebar-foreground": fg,
    "--sidebar-primary": primary,
    "--sidebar-primary-foreground": onColor(primary),
    "--sidebar-accent": muted,
    "--sidebar-accent-foreground": fg,
    "--sidebar-border": mix(fg, bg, 0.14),
    "--sidebar-ring": primary,
    "--radius": `${appearance.radius}rem`,
    "--search-bg": searchBg,
    "--search-fg": searchFg,
    "--search-muted": mix(searchFg, searchBg, 0.42),
    "--wordmark-1": letters[0],
    "--wordmark-2": letters[1],
    "--wordmark-3": letters[2],
    "--wordmark-4": letters[3],
  } as const
}

export function applyAppearance(appearance: Appearance, root = document.documentElement) {
  root.classList.toggle("dark", appearance.mode === "dark")
  root.dataset.theme = appearance.preset
  const tokens = appearanceTokens(appearance)
  for (const [name, value] of Object.entries(tokens)) {
    root.style.setProperty(name, value)
  }
}

import type { Appearance, ThemeId, ThemePreset } from "./types"

export const THEME_PRESETS: ThemePreset[] = [
  {
    preset: "nexo",
    name: "nexo",
    description: "Oscuro, tipo Google",
    mode: "dark",
    background: "#3c4149",
    foreground: "#e8eaed",
    card: "#4b515a",
    primary: "#8ab4f8",
    searchBg: "#ffffff",
    searchFg: "#202124",
    radius: 0.7,
    wordmark: "google",
    swatches: ["#3c4149", "#8ab4f8", "#ffffff"],
  },
  {
    preset: "notion",
    name: "Notion",
    description: "Claro, cálido y de lectura",
    mode: "light",
    background: "#ffffff",
    foreground: "#37352f",
    card: "#f7f6f3",
    primary: "#2383e2",
    searchBg: "#f7f6f3",
    searchFg: "#37352f",
    radius: 0.5,
    wordmark: "mono",
    swatches: ["#ffffff", "#2383e2", "#37352f"],
  },
  {
    preset: "facebook",
    name: "Facebook",
    description: "Azul, limpio y familiar",
    mode: "light",
    background: "#f0f2f5",
    foreground: "#050505",
    card: "#ffffff",
    primary: "#0866ff",
    searchBg: "#ffffff",
    searchFg: "#050505",
    radius: 0.8,
    wordmark: "mono",
    swatches: ["#f0f2f5", "#0866ff", "#ffffff"],
  },
  {
    preset: "whatsapp",
    name: "WhatsApp",
    description: "Verde noche, tipo chat",
    mode: "dark",
    background: "#111b21",
    foreground: "#e9edef",
    card: "#202c33",
    primary: "#00a884",
    searchBg: "#202c33",
    searchFg: "#e9edef",
    radius: 0.7,
    wordmark: "mono",
    swatches: ["#111b21", "#00a884", "#202c33"],
  },
  {
    preset: "instagram",
    name: "Instagram",
    description: "Oscuro con acento rosa",
    mode: "dark",
    background: "#000000",
    foreground: "#f5f5f5",
    card: "#121212",
    primary: "#e1306c",
    searchBg: "#1a1a1a",
    searchFg: "#f5f5f5",
    radius: 0.9,
    wordmark: "gradient",
    swatches: ["#000000", "#e1306c", "#f77737"],
  },
  {
    preset: "x",
    name: "X",
    description: "Negro, directo y mínimo",
    mode: "dark",
    background: "#000000",
    foreground: "#e7e9ea",
    card: "#16181c",
    primary: "#1d9bf0",
    searchBg: "#16181c",
    searchFg: "#e7e9ea",
    radius: 1.15,
    wordmark: "mono",
    swatches: ["#000000", "#1d9bf0", "#16181c"],
  },
  {
    preset: "vercel",
    name: "Vercel",
    description: "Negro, preciso, bordes secos",
    mode: "dark",
    background: "#000000",
    foreground: "#ededed",
    card: "#0a0a0a",
    primary: "#ffffff",
    searchBg: "#111111",
    searchFg: "#ededed",
    radius: 0.4,
    wordmark: "mono",
    swatches: ["#000000", "#ffffff", "#111111"],
  },
  {
    preset: "minimal",
    name: "Minimal",
    description: "Papel, silencio visual",
    mode: "light",
    background: "#f4f3ef",
    foreground: "#171717",
    card: "#ffffff",
    primary: "#171717",
    searchBg: "#ffffff",
    searchFg: "#171717",
    radius: 0.35,
    wordmark: "mono",
    swatches: ["#f4f3ef", "#171717", "#ffffff"],
  },
  {
    preset: "colorful",
    name: "Colorido",
    description: "Violeta, para quien quiere más",
    mode: "dark",
    background: "#1a1038",
    foreground: "#f6f1ff",
    card: "#2b1c58",
    primary: "#ff7ac6",
    searchBg: "#ffffff",
    searchFg: "#1a1038",
    radius: 1.15,
    wordmark: "google",
    swatches: ["#1a1038", "#ff7ac6", "#7ae0ff"],
  },
]

export const DEFAULT_APPEARANCE: Appearance = appearanceFromPreset("nexo")

export function getPreset(id: ThemeId) {
  return THEME_PRESETS.find((preset) => preset.preset === id) ?? THEME_PRESETS[0]
}

export function appearanceFromPreset(
  id: ThemeId,
  keep?: Pick<
    Appearance,
    | "showGmail"
    | "showImages"
    | "showClock"
    | "showWeather"
    | "showNext"
    | "showAgenda"
    | "showNotes"
    | "showWorkApps"
    | "showAi"
  >
): Appearance {
  const preset = getPreset(id)
  return {
    preset: preset.preset,
    mode: preset.mode,
    background: preset.background,
    foreground: preset.foreground,
    card: preset.card,
    primary: preset.primary,
    searchBg: preset.searchBg,
    searchFg: preset.searchFg,
    radius: preset.radius,
    wordmark: preset.wordmark,
    showGmail: keep?.showGmail ?? true,
    showImages: keep?.showImages ?? true,
    showClock: keep?.showClock ?? true,
    showWeather: keep?.showWeather ?? true,
    showNext: keep?.showNext ?? false,
    showAgenda: keep?.showAgenda ?? false,
    showNotes: keep?.showNotes ?? false,
    showWorkApps: keep?.showWorkApps ?? true,
    showAi: keep?.showAi ?? true,
  }
}

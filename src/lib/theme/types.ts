export const APPEARANCE_KEY = "nexo.appearance.v1"

export type ThemeId =
  | "nexo"
  | "notion"
  | "facebook"
  | "whatsapp"
  | "instagram"
  | "x"
  | "vercel"
  | "minimal"
  | "colorful"

export type WordmarkStyle = "google" | "mono" | "gradient"

export type Appearance = {
  preset: ThemeId
  mode: "light" | "dark"
  background: string
  foreground: string
  card: string
  primary: string
  searchBg: string
  searchFg: string
  radius: number
  wordmark: WordmarkStyle
  showGmail: boolean
  showImages: boolean
  showClock: boolean
  showWeather: boolean
  showNext: boolean
  showAgenda: boolean
  showNotes: boolean
  showWorkApps: boolean
  showAi: boolean
}

export type ThemePreset = Omit<
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
> & {
  name: string
  description: string
  swatches: [string, string, string]
}

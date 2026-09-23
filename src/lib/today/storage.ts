export type DayEvent = {
  id: string
  title: string
  start: string
  url?: string
}

export type DayData = {
  notes: string
  events: DayEvent[]
}

export const DAY_STORAGE_KEY = "nexo.day.v1"

export function loadDayData(): DayData {
  if (typeof window === "undefined") return { notes: "", events: [] }
  try {
    const raw = localStorage.getItem(DAY_STORAGE_KEY)
    if (!raw) return { notes: "", events: [] }
    const parsed = JSON.parse(raw) as Partial<DayData>
    return {
      notes: typeof parsed.notes === "string" ? parsed.notes : "",
      events: Array.isArray(parsed.events)
        ? parsed.events.filter(
            (event): event is DayEvent =>
              Boolean(event) &&
              typeof event.id === "string" &&
              typeof event.title === "string" &&
              typeof event.start === "string"
          )
        : [],
    }
  } catch {
    return { notes: "", events: [] }
  }
}

export function saveDayData(data: DayData) {
  localStorage.setItem(DAY_STORAGE_KEY, JSON.stringify(data))
}

export function upcomingEvents(events: DayEvent[], from = new Date()) {
  return [...events]
    .filter((event) => !Number.isNaN(new Date(event.start).getTime()))
    .sort((a, b) => +new Date(a.start) - +new Date(b.start))
    .filter((event) => +new Date(event.start) >= from.getTime() - 30 * 60 * 1000)
}

export function relativeWhen(iso: string, now = new Date()) {
  const start = new Date(iso)
  const diffMin = Math.round((+start - +now) / 60000)
  if (Number.isNaN(diffMin)) return ""
  if (diffMin <= 2 && diffMin >= -5) return "ahora"
  if (diffMin > 2 && diffMin < 60) return `en ${diffMin} min`
  if (diffMin >= 60 && diffMin < 60 * 24) {
    const hours = Math.round(diffMin / 60)
    return hours === 1 ? "en 1 h" : `en ${hours} h`
  }
  if (diffMin < -5 && diffMin > -60) return `hace ${Math.abs(diffMin)} min`
  return start.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

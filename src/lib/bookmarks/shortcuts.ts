export type HomeShortcut = {
  id: string
  title: string
  url: string
  sourceLinkId?: string
}

export const SHORTCUTS_STORAGE_KEY = "nexo.shortcuts.v1"
export const MAX_HOME_SHORTCUTS = 10

export function normalizePageUrl(input: string) {
  const trimmed = input.trim()
  if (!trimmed) throw new Error("Escribí una URL.")

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  let parsed: URL
  try {
    parsed = new URL(withProtocol)
  } catch {
    throw new Error("Esa URL no es válida.")
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Solo se pueden agregar sitios http o https.")
  }

  return parsed.href
}

export function samePageUrl(left: string, right: string) {
  try {
    const a = new URL(left)
    const b = new URL(right)
    const strip = (url: URL) =>
      `${url.protocol}//${url.host}${url.pathname.replace(/\/$/, "")}${url.search}`
    return strip(a) === strip(b)
  } catch {
    return left === right
  }
}

export function loadShortcuts(): HomeShortcut[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(SHORTCUTS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HomeShortcut[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is HomeShortcut =>
        Boolean(item) &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.url === "string"
    )
  } catch {
    return []
  }
}

export function saveShortcuts(shortcuts: HomeShortcut[]) {
  localStorage.setItem(SHORTCUTS_STORAGE_KEY, JSON.stringify(shortcuts))
}

export function createShortcut(input: {
  title: string
  url: string
  sourceLinkId?: string
}): HomeShortcut {
  const url = normalizePageUrl(input.url)
  const title = input.title.trim() || hostnameFromUrl(url)
  return {
    id: crypto.randomUUID(),
    title,
    url,
    sourceLinkId: input.sourceLinkId,
  }
}

export function hostnameFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export function findShortcutIndex(
  shortcuts: HomeShortcut[],
  {
    id,
    url,
    sourceLinkId,
  }: { id?: string; url?: string; sourceLinkId?: string }
) {
  return shortcuts.findIndex((shortcut) => {
    if (id && shortcut.id === id) return true
    if (sourceLinkId && shortcut.sourceLinkId === sourceLinkId) return true
    if (url && samePageUrl(shortcut.url, url)) return true
    return false
  })
}

export function addShortcut(
  shortcuts: HomeShortcut[],
  next: HomeShortcut
): HomeShortcut[] {
  if (findShortcutIndex(shortcuts, { url: next.url, sourceLinkId: next.sourceLinkId }) >= 0) {
    throw new Error("Ese sitio ya está en tus atajos.")
  }
  if (shortcuts.length >= MAX_HOME_SHORTCUTS) {
    throw new Error(`Podés tener hasta ${MAX_HOME_SHORTCUTS} atajos.`)
  }
  return [...shortcuts, next]
}

export function removeShortcut(shortcuts: HomeShortcut[], id: string) {
  return shortcuts.filter((shortcut) => shortcut.id !== id)
}

export function toggleLinkShortcut(
  shortcuts: HomeShortcut[],
  link: { id: string; title: string; url: string }
): { shortcuts: HomeShortcut[]; added: boolean } {
  const index = findShortcutIndex(shortcuts, {
    sourceLinkId: link.id,
    url: link.url,
  })
  if (index >= 0) {
    return {
      shortcuts: shortcuts.filter((_, itemIndex) => itemIndex !== index),
      added: false,
    }
  }
  return {
    shortcuts: addShortcut(
      shortcuts,
      createShortcut({
        title: link.title,
        url: link.url,
        sourceLinkId: link.id,
      })
    ),
    added: true,
  }
}

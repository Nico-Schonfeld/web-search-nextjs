import type { BookmarkData } from "./types"

const STORAGE_KEY = "nexo.bookmarks.v1"

export function loadBookmarks(): BookmarkData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as BookmarkData
    if (parsed?.version !== 1 || !parsed.nodes) return null
    return parsed
  } catch {
    return null
  }
}

export function saveBookmarks(data: BookmarkData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function clearBookmarks() {
  localStorage.removeItem(STORAGE_KEY)
}

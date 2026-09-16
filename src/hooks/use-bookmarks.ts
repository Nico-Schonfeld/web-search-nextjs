"use client"

import { useCallback, useEffect, useState } from "react"

import { parseNetscapeBookmarks } from "@/lib/bookmarks/parse-netscape"
import {
  clearBookmarks,
  loadBookmarks,
  saveBookmarks,
} from "@/lib/bookmarks/storage"
import type { BookmarkData } from "@/lib/bookmarks/types"

export function useBookmarks() {
  const [data, setData] = useState<BookmarkData | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setData(loadBookmarks())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    if (data) saveBookmarks(data)
  }, [data, ready])

  const importHtml = useCallback(async (file: File) => {
    const html = await file.text()
    const next = parseNetscapeBookmarks(html)
    setData(next)
    return next
  }, [])

  const importHtmlText = useCallback((html: string) => {
    const next = parseNetscapeBookmarks(html)
    setData(next)
    return next
  }, [])

  const reset = useCallback(() => {
    clearBookmarks()
    setData(null)
  }, [])

  const update = useCallback((updater: (current: BookmarkData) => BookmarkData) => {
    setData((current) => (current ? updater(current) : current))
  }, [])

  return { data, ready, importHtml, importHtmlText, reset, update, setData }
}

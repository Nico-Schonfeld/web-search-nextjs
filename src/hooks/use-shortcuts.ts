"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  addShortcut,
  createShortcut,
  loadShortcuts,
  removeShortcut,
  saveShortcuts,
  toggleLinkShortcut,
  type HomeShortcut,
} from "@/lib/bookmarks/shortcuts"

export function useShortcuts() {
  const [shortcuts, setShortcuts] = useState<HomeShortcut[]>([])
  const [ready, setReady] = useState(false)
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    setShortcuts(loadShortcuts())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    saveShortcuts(shortcuts)
  }, [ready, shortcuts])

  const addFromUrl = useCallback((title: string, url: string) => {
    const next = createShortcut({ title, url })
    const updated = addShortcut(shortcutsRef.current, next)
    setShortcuts(updated)
    return next
  }, [])

  const toggleLink = useCallback(
    (link: { id: string; title: string; url: string }) => {
      setShortcuts(toggleLinkShortcut(shortcutsRef.current, link).shortcuts)
    },
    []
  )

  const remove = useCallback((id: string) => {
    setShortcuts(removeShortcut(shortcutsRef.current, id))
  }, [])

  return {
    shortcuts,
    ready,
    addFromUrl,
    toggleLink,
    remove,
  }
}

"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import {
  loadDayData,
  saveDayData,
  upcomingEvents,
  type DayEvent,
} from "@/lib/today/storage"

export function useToday() {
  const [notes, setNotesState] = useState("")
  const [events, setEvents] = useState<DayEvent[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const loaded = loadDayData()
    setNotesState(loaded.notes)
    setEvents(loaded.events)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    saveDayData({ notes, events })
  }, [notes, events, ready])

  const setNotes = useCallback((value: string) => {
    setNotesState(value)
  }, [])

  const addEvent = useCallback((title: string, start: string, url?: string) => {
    const nextTitle = title.trim()
    if (!nextTitle || !start) return
    setEvents((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        title: nextTitle,
        start,
        url: url?.trim() || undefined,
      },
    ])
  }, [])

  const removeEvent = useCallback((id: string) => {
    setEvents((current) => current.filter((event) => event.id !== id))
  }, [])

  const upcoming = useMemo(() => upcomingEvents(events), [events])
  const nextEvent = upcoming[0]

  return {
    notes,
    setNotes,
    events,
    upcoming,
    nextEvent,
    addEvent,
    removeEvent,
  }
}

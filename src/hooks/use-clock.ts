"use client"

import { useEffect, useState } from "react"

export function useClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  if (!now) {
    return { now: null, time: "", date: "", ready: false as const }
  }

  return {
    now,
    time: now.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    date: now.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "short",
    }),
    ready: true as const,
  }
}

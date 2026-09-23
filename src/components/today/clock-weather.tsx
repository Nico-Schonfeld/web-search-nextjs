"use client"

import { CloudSunIcon } from "lucide-react"

import { useClock } from "@/hooks/use-clock"
import { useWeather } from "@/hooks/use-weather"

export function ClockWeather({
  showClock,
  showWeather,
}: {
  showClock: boolean
  showWeather: boolean
}) {
  const { time, date, ready } = useClock()
  const weather = useWeather(showWeather)

  if (!showClock && !showWeather) return null

  return (
    <div className="min-w-0 px-1">
      {showClock ? (
        <p className="text-xl leading-none font-medium tracking-tight sm:text-2xl">
          {ready ? time : "\u00a0"}
        </p>
      ) : null}
      <p className="mt-1 truncate text-xs text-muted-foreground capitalize">
        {showClock ? date : null}
        {showClock && showWeather && weather.label ? " · " : null}
        {showWeather && !weather.loading && weather.label ? (
          <span className="inline-flex items-center gap-1 normal-case">
            <CloudSunIcon className="size-3" />
            {weather.temp}° {weather.label}
          </span>
        ) : null}
      </p>
    </div>
  )
}

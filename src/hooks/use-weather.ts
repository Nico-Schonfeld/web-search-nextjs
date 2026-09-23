"use client"

import { useEffect, useState } from "react"

const FALLBACK = { lat: -34.6037, lon: -58.3816 }

const WEATHER_LABEL: Record<number, string> = {
  0: "Despejado",
  1: "Mayormente claro",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla",
  51: "Llovizna",
  61: "Lluvia",
  63: "Lluvia",
  65: "Lluvia intensa",
  71: "Nieve",
  80: "Chaparrones",
  95: "Tormenta",
}

export type WeatherState = {
  temp: number
  label: string
  loading: boolean
}

function describe(code: number) {
  return WEATHER_LABEL[code] ?? "Cielo variable"
}

export function useWeather(enabled: boolean) {
  const [weather, setWeather] = useState<WeatherState>({
    temp: 0,
    label: "",
    loading: true,
  })

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    const load = async (lat: number, lon: number) => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
      const response = await fetch(url)
      if (!response.ok) throw new Error("clima")
      const json = (await response.json()) as {
        current?: { temperature_2m?: number; weather_code?: number }
      }
      if (cancelled) return
      const temp = Math.round(json.current?.temperature_2m ?? 0)
      setWeather({
        temp,
        label: describe(json.current?.weather_code ?? 2),
        loading: false,
      })
    }

    const start = () => {
      if (!navigator.geolocation) {
        void load(FALLBACK.lat, FALLBACK.lon).catch(() => {
          if (!cancelled) setWeather({ temp: 0, label: "", loading: false })
        })
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          void load(position.coords.latitude, position.coords.longitude).catch(
            () => {
              if (!cancelled) setWeather({ temp: 0, label: "", loading: false })
            }
          )
        },
        () => {
          void load(FALLBACK.lat, FALLBACK.lon).catch(() => {
            if (!cancelled) setWeather({ temp: 0, label: "", loading: false })
          })
        },
        { maximumAge: 30 * 60 * 1000, timeout: 4000 }
      )
    }

    start()
    return () => {
      cancelled = true
    }
  }, [enabled])

  return weather
}

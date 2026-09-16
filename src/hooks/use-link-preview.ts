"use client"

import { useEffect, useState } from "react"

import type { LinkPreview } from "@/lib/preview/open-graph"

const memory = new Map<string, LinkPreview>()

function storageKey(url: string) {
  return `nexo.og.v1:${url}`
}

function readCache(url: string) {
  const hit = memory.get(url)
  if (hit) return hit
  try {
    const raw = sessionStorage.getItem(storageKey(url))
    if (!raw) return null
    const parsed = JSON.parse(raw) as LinkPreview
    memory.set(url, parsed)
    return parsed
  } catch {
    return null
  }
}

function writeCache(url: string, preview: LinkPreview) {
  memory.set(url, preview)
  try {
    sessionStorage.setItem(storageKey(url), JSON.stringify(preview))
  } catch {
    // quota
  }
}

export function useLinkPreview(url: string, enabled: boolean) {
  const [preview, setPreview] = useState<LinkPreview | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const cached = readCache(url)
    if (cached) {
      setPreview(cached)
      return
    }

    let cancelled = false
    setLoading(true)
    fetch(`/api/preview?url=${encodeURIComponent(url)}`)
      .then((response) => response.json() as Promise<LinkPreview>)
      .then((data) => {
        if (cancelled) return
        writeCache(url, data)
        setPreview(data)
      })
      .catch(() => {
        if (cancelled) return
        setPreview(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [url, enabled])

  return { preview, loading }
}

export function proxiedImage(imageUrl?: string) {
  if (!imageUrl) return undefined
  return `/api/preview/image?url=${encodeURIComponent(imageUrl)}`
}

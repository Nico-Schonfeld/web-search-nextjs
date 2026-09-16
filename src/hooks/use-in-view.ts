"use client"

import { useEffect, useState } from "react"

export function useInView(once = true) {
  const [node, setNode] = useState<HTMLElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!node || (once && inView)) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setInView(true)
        if (once) observer.disconnect()
      },
      { rootMargin: "240px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [node, inView, once])

  return { setRef: setNode, inView }
}

"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowRightIcon, SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { faviconUrl, hostnameOf } from "@/lib/bookmarks/favicon"
import { searchLinks } from "@/lib/bookmarks/tree"
import type { BookmarkData, BookmarkLink } from "@/lib/bookmarks/types"
import { cn } from "@/lib/utils"

function googleSearchUrl(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`
}

export function SearchHero({
  data,
  query,
  onQueryChange,
}: {
  data: BookmarkData | null
  query: string
  onQueryChange: (value: string) => void
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const matches = useMemo(
    () => (data && query.trim() ? searchLinks(data, query).slice(0, 7) : []),
    [data, query]
  )

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return
      }
      const target = event.target as HTMLElement | null
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return
      event.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const goToGoogle = (value: string) => {
    const next = value.trim()
    if (!next) return
    window.location.assign(googleSearchUrl(next))
  }

  const goToLink = (link: BookmarkLink) => {
    window.location.assign(link.url)
  }

  const submitSearch = () => {
    const selected = matches[activeIndex]
    if (selected && query.trim()) {
      goToLink(selected)
      return
    }
    goToGoogle(query)
  }

  return (
    <form
      className="relative w-full max-w-xl"
      onSubmit={(event) => {
        event.preventDefault()
        submitSearch()
      }}
    >
      <InputGroup className="h-14 rounded-full border-transparent bg-[var(--search-bg)] text-[var(--search-fg)] shadow-[0_1px_6px_rgba(32,33,36,0.18)] ring-1 ring-foreground/8 has-[[data-slot=input-group-control]:focus-visible]:ring-primary/40 dark:bg-[var(--search-bg)]">
        <InputGroupAddon className="pl-4 text-[var(--search-muted)]">
          <SearchIcon className="size-5" />
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          autoComplete="off"
          spellCheck={false}
          name="q"
          value={query}
          placeholder="Buscar en Google o en tus favoritos"
          className="h-14 text-[16px] text-[var(--search-fg)] placeholder:text-[var(--search-muted)] md:text-[16px]"
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault()
              setActiveIndex((index) =>
                matches.length ? (index + 1) % matches.length : 0
              )
            }
            if (event.key === "ArrowUp") {
              event.preventDefault()
              setActiveIndex((index) =>
                matches.length
                  ? (index - 1 + matches.length) % matches.length
                  : 0
              )
            }
            if (event.key === "Escape") {
              onQueryChange("")
            }
          }}
        />
        <InputGroupAddon align="inline-end" className="pr-2">
          <InputGroupButton
            type="button"
            variant="ghost"
            className="h-10 rounded-full px-3 text-sm text-primary hover:bg-primary/10 hover:text-primary"
            onClick={submitSearch}
          >
            Google
            <ArrowRightIcon className="size-4" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {matches.length > 0 ? (
        <div className="absolute top-[calc(100%+8px)] z-20 w-full overflow-hidden rounded-2xl bg-[var(--search-bg)] text-[var(--search-fg)] shadow-[0_4px_24px_rgba(32,33,36,0.18)] ring-1 ring-foreground/10">
          <p className="px-4 pt-3 pb-1 text-xs font-medium tracking-wide text-[var(--search-muted)] uppercase">
            En tus favoritos
          </p>
          <ul className="p-1.5">
            {matches.map((link, index) => (
              <li key={link.id}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                    index === activeIndex ? "bg-foreground/8" : "hover:bg-foreground/5"
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => goToLink(link)}
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-foreground/8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={faviconUrl(link.url, 32)}
                      alt=""
                      width={16}
                      height={16}
                      className="size-4"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {link.title}
                    </span>
                    <span className="block truncate text-xs text-[var(--search-muted)]">
                      {hostnameOf(link.url)}
                    </span>
                  </span>
                  <Badge variant="secondary" className="hidden sm:inline-flex">
                    Favorito
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="submit"
            className="flex w-full items-center gap-2 border-t border-foreground/10 px-4 py-3 text-left text-sm text-[var(--search-muted)] hover:bg-foreground/5"
          >
            <SearchIcon className="size-4 text-primary" />
            Buscar “{query}” en Google
          </button>
        </div>
      ) : null}
    </form>
  )
}

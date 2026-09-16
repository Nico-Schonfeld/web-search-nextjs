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
      <InputGroup className="h-14 rounded-full border-transparent bg-white text-zinc-900 shadow-[0_1px_6px_rgba(32,33,36,0.28)] dark:bg-white dark:has-[[data-slot=input-group-control]:focus-visible]:border-transparent dark:has-[[data-slot=input-group-control]:focus-visible]:ring-[#8ab4f8]/40">
        <InputGroupAddon className="pl-4 text-zinc-500">
          <SearchIcon className="size-5" />
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          autoComplete="off"
          spellCheck={false}
          name="q"
          value={query}
          placeholder="Buscar en Google o en tus favoritos"
          className="h-14 text-[16px] text-zinc-900 placeholder:text-zinc-500 md:text-[16px]"
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
            className="h-10 rounded-full px-3 text-sm text-[#1a73e8] hover:bg-blue-50 hover:text-[#174ea6]"
            onClick={submitSearch}
          >
            Google
            <ArrowRightIcon className="size-4" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {matches.length > 0 ? (
        <div className="absolute top-[calc(100%+8px)] z-20 w-full overflow-hidden rounded-2xl bg-white text-zinc-900 shadow-[0_4px_24px_rgba(32,33,36,0.18)] ring-1 ring-zinc-200">
          <p className="px-4 pt-3 pb-1 text-xs font-medium tracking-wide text-zinc-500 uppercase">
            En tus favoritos
          </p>
          <ul className="p-1.5">
            {matches.map((link, index) => (
              <li key={link.id}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                    index === activeIndex ? "bg-zinc-100" : "hover:bg-zinc-50"
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => goToLink(link)}
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-zinc-100">
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
                    <span className="block truncate text-xs text-zinc-500">
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
            className="flex w-full items-center gap-2 border-t border-zinc-200 px-4 py-3 text-left text-sm text-zinc-600 hover:bg-zinc-50"
          >
            <SearchIcon className="size-4 text-[#1a73e8]" />
            Buscar “{query}” en Google
          </button>
        </div>
      ) : null}
    </form>
  )
}

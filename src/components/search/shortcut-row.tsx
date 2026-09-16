"use client"

import { useState } from "react"
import { PlusIcon, XIcon } from "lucide-react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { faviconUrl } from "@/lib/bookmarks/favicon"
import { MAX_HOME_SHORTCUTS, type HomeShortcut } from "@/lib/bookmarks/shortcuts"

function ShortcutFavicon({ url, title }: { url: string; title: string }) {
  const [failed, setFailed] = useState(false)
  const src = faviconUrl(url, 64)

  if (failed || !src) {
    return (
      <span className="text-sm font-medium text-white/80">
        {title.slice(0, 1).toUpperCase()}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={24}
      height={24}
      className="size-6"
      onError={() => setFailed(true)}
    />
  )
}

function ShortcutItem({
  shortcut,
  onRemove,
}: {
  shortcut: HomeShortcut
  onRemove: () => void
}) {
  const className =
    "group relative flex w-[84px] flex-col items-center gap-2 rounded-xl p-2 text-center transition-colors hover:bg-white/5"

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={<div className="group relative w-[84px]" />}
      >
        <a href={shortcut.url} className={className}>
          <span className="relative flex size-12 items-center justify-center rounded-full bg-white/8 ring-1 ring-white/10">
            <ShortcutFavicon url={shortcut.url} title={shortcut.title} />
          </span>
          <span className="line-clamp-2 w-full text-xs text-white/80">
            {shortcut.title}
          </span>
        </a>
        <button
          type="button"
          className="absolute top-1 right-1 hidden size-5 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-foreground/10 group-hover:flex hover:bg-destructive/15 hover:text-destructive"
          aria-label={`Quitar ${shortcut.title}`}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onRemove()
          }}
        >
          <XIcon className="size-3" />
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem variant="destructive" onClick={onRemove}>
          Quitar de atajos
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export function ShortcutRow({
  shortcuts,
  onAdd,
  onRemove,
}: {
  shortcuts: HomeShortcut[]
  onAdd: () => void
  onRemove: (id: string) => void
}) {
  const canAdd = shortcuts.length < MAX_HOME_SHORTCUTS

  return (
    <div className="mt-8 flex max-w-3xl flex-wrap items-start justify-center gap-1 sm:flex-nowrap">
      {shortcuts.map((shortcut) => (
        <ShortcutItem
          key={shortcut.id}
          shortcut={shortcut}
          onRemove={() => onRemove(shortcut.id)}
        />
      ))}
      {canAdd ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                className="flex w-[84px] flex-col items-center gap-2 rounded-xl p-2 text-center transition-colors hover:bg-white/5"
                onClick={onAdd}
              />
            }
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-white/8 ring-1 ring-white/10">
              <PlusIcon className="size-5 text-white/70" />
            </span>
            <span className="line-clamp-2 w-full text-xs text-white/80">
              Agregar
            </span>
          </TooltipTrigger>
          <TooltipContent>Agregar atajo</TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}

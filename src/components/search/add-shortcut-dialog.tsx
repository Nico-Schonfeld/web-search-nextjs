"use client"

import { useEffect, useMemo, useState } from "react"
import { BookmarkPlusIcon, CheckIcon, GlobeIcon, LinkIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { faviconUrl, hostnameOf } from "@/lib/bookmarks/favicon"
import {
  MAX_HOME_SHORTCUTS,
  findShortcutIndex,
  type HomeShortcut,
} from "@/lib/bookmarks/shortcuts"
import { folderLinks, folderPath } from "@/lib/bookmarks/tree"
import type { BookmarkData, BookmarkLink } from "@/lib/bookmarks/types"
import { cn } from "@/lib/utils"

type AddMode = "bookmarks" | "url"

export function AddShortcutDialog({
  open,
  onOpenChange,
  data,
  shortcuts,
  onAddUrl,
  onToggleLink,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: BookmarkData | null
  shortcuts: HomeShortcut[]
  onAddUrl: (title: string, url: string) => void
  onToggleLink: (link: BookmarkLink) => void
}) {
  const [mode, setMode] = useState<AddMode>("bookmarks")
  const [filter, setFilter] = useState("")
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")

  useEffect(() => {
    if (!open) return
    setMode(data ? "bookmarks" : "url")
  }, [open, data])

  const groups = useMemo(() => {
    if (!data) return []
    const needle = filter.trim().toLowerCase()
    return data.folderOrder
      .map((folderId) => {
        const folder = data.nodes[folderId]
        if (!folder || folder.type !== "folder") return null
        const links = folderLinks(data, folderId).filter((link) => {
          if (!needle) return true
          return (
            link.title.toLowerCase().includes(needle) ||
            link.url.toLowerCase().includes(needle)
          )
        })
        if (links.length === 0) return null
        const path = folderPath(data, folderId)
        return {
          id: folder.id,
          title: folder.title,
          path,
          links,
        }
      })
      .filter((group): group is NonNullable<typeof group> => Boolean(group))
  }, [data, filter])

  const reset = () => {
    setFilter("")
    setTitle("")
    setUrl("")
    setMode("bookmarks")
  }

  const submitUrl = () => {
    try {
      onAddUrl(title, url)
      toast.success("Atajo agregado")
      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo agregar el atajo."
      )
    }
  }

  const atLimit = shortcuts.length >= MAX_HOME_SHORTCUTS

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) reset()
      }}
    >
      <DialogContent className="gap-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar atajo</DialogTitle>
          <DialogDescription>
            Estos iconos van debajo del buscador. Elegí un favorito o pegá una
            URL.
          </DialogDescription>
        </DialogHeader>

        <ToggleGroup
          variant="outline"
          size="sm"
          spacing={0}
          value={[mode]}
          onValueChange={(groupValue) => {
            const next = groupValue[0]
            if (next === "bookmarks" || next === "url") setMode(next)
          }}
        >
          <ToggleGroupItem value="bookmarks" aria-label="Desde favoritos">
            <BookmarkPlusIcon />
            Desde favoritos
          </ToggleGroupItem>
          <ToggleGroupItem value="url" aria-label="Pegar URL">
            <LinkIcon />
            Pegar URL
          </ToggleGroupItem>
        </ToggleGroup>

        {mode === "url" ? (
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              submitUrl()
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="shortcut-title">Nombre</Label>
              <Input
                id="shortcut-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Gmail"
                autoFocus
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="shortcut-url">URL</Label>
              <Input
                id="shortcut-url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://mail.google.com"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!url.trim() || atLimit}>
                Agregar
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="grid gap-3">
            <Input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Buscar en tus carpetas"
              autoFocus
            />
            <div className="max-h-80 overflow-y-auto rounded-xl border bg-muted/20">
              {!data ? (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Importá tus favoritos para elegir sitios de tus carpetas, o
                  pegá una URL.
                </p>
              ) : groups.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No hay sitios que coincidan.
                </p>
              ) : (
                groups.map((group) => (
                  <div key={group.id} className="border-b last:border-b-0">
                    <p className="sticky top-0 bg-muted/80 px-3 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase backdrop-blur">
                      {group.path.length > 0
                        ? `${group.path.join(" / ")} / ${group.title}`
                        : group.title}
                    </p>
                    <ul>
                      {group.links.map((link) => {
                        const selected =
                          findShortcutIndex(shortcuts, {
                            sourceLinkId: link.id,
                            url: link.url,
                          }) >= 0
                        return (
                          <li key={link.id}>
                            <button
                              type="button"
                              className={cn(
                                "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-foreground/5",
                                selected && "bg-foreground/4"
                              )}
                              onClick={() => {
                                if (
                                  !selected &&
                                  shortcuts.length >= MAX_HOME_SHORTCUTS
                                ) {
                                  toast.error(
                                    `Podés tener hasta ${MAX_HOME_SHORTCUTS} atajos.`
                                  )
                                  return
                                }
                                onToggleLink(link)
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={faviconUrl(link.url, 32)}
                                alt=""
                                width={16}
                                height={16}
                                className="size-4 shrink-0"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm">
                                  {link.title}
                                </span>
                                <span className="block truncate text-xs text-muted-foreground">
                                  {hostnameOf(link.url)}
                                </span>
                              </span>
                              {selected ? (
                                <CheckIcon className="size-4 shrink-0 text-primary" />
                              ) : (
                                <GlobeIcon className="size-4 shrink-0 text-muted-foreground/50" />
                              )}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {shortcuts.length}/{MAX_HOME_SHORTCUTS} atajos. Tocá de nuevo para
              quitarlo.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

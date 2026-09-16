"use client"

import { useMemo, useState } from "react"
import {
  ArrowDownAZIcon,
  LayoutGridIcon,
  ListIcon,
  PanelsTopLeftIcon,
} from "lucide-react"

import {
  BookmarkTile,
  type BookmarkView,
} from "@/components/bookmarks/bookmark-tile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { folderLinks, folderPath } from "@/lib/bookmarks/tree"
import {
  FOLDER_COLOR_CLASS,
  type BookmarkData,
} from "@/lib/bookmarks/types"
import { cn } from "@/lib/utils"

export function FolderModal({
  data,
  folderId,
  open,
  onOpenChange,
  onRemoveLink,
  onSortLinks,
}: {
  data: BookmarkData
  folderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onRemoveLink: (linkId: string) => void
  onSortLinks: () => void
}) {
  const folder = data.nodes[folderId]
  const [view, setView] = useState<BookmarkView>("cards")
  const [filter, setFilter] = useState("")

  const links = folder?.type === "folder" ? folderLinks(data, folderId) : []
  const path = folderPath(data, folderId)
  const needle = filter.trim().toLowerCase()
  const visibleLinks = useMemo(
    () =>
      needle
        ? links.filter(
            (link) =>
              link.title.toLowerCase().includes(needle) ||
              link.url.toLowerCase().includes(needle)
          )
        : links,
    [links, needle]
  )

  if (!folder || folder.type !== "folder") return null

  const colors = FOLDER_COLOR_CLASS[folder.color]

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setFilter("")
      }}
    >
      <DialogContent
        className="flex h-[90vh] max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl"
        showCloseButton
      >
        <DialogHeader className="border-b px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn("size-2.5 rounded-full", colors.bar)} />
                <DialogTitle className="truncate">{folder.title}</DialogTitle>
                <Badge variant="secondary">{visibleLinks.length}</Badge>
              </div>
              <DialogDescription className="mt-1">
                {path.length > 0 ? path.join(" / ") : "Todos los sitios de esta carpeta"}
              </DialogDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                placeholder="Filtrar en esta carpeta"
                className="h-8 w-44"
              />
              <ToggleGroup
                variant="outline"
                size="sm"
                spacing={0}
                value={[view]}
                onValueChange={(groupValue) => {
                  const next = groupValue[0]
                  if (next === "cards" || next === "compact" || next === "list") {
                    setView(next)
                  }
                }}
              >
                <ToggleGroupItem value="cards" aria-label="Tarjetas">
                  <PanelsTopLeftIcon />
                  Tarjetas
                </ToggleGroupItem>
                <ToggleGroupItem value="compact" aria-label="Íconos">
                  <LayoutGridIcon />
                  Íconos
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="Lista">
                  <ListIcon />
                  Lista
                </ToggleGroupItem>
              </ToggleGroup>
              <Button variant="outline" size="sm" onClick={onSortLinks}>
                <ArrowDownAZIcon />
                A-Z
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div
            className={cn(
              "p-4",
              view === "cards" &&
                "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3",
              view === "compact" && "flex flex-wrap gap-2",
              view === "list" && "flex flex-col gap-1"
            )}
          >
            {visibleLinks.map((link) => (
              <BookmarkTile
                key={link.id}
                link={link}
                folderId={folderId}
                view={view}
                sortable={false}
                onRemove={() => onRemoveLink(link.id)}
              />
            ))}
            {visibleLinks.length === 0 ? (
              <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
                No hay sitios que coincidan.
              </p>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

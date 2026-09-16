"use client"

import { useMemo, useState } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable"

import { BookmarkOverlay, type BookmarkView } from "@/components/bookmarks/bookmark-tile"
import { FolderCard } from "@/components/bookmarks/folder-card"
import { FolderModal } from "@/components/bookmarks/folder-modal"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { folderLinks, getLink } from "@/lib/bookmarks/tree"
import type { BookmarkData, BookmarkLink, FolderColorId } from "@/lib/bookmarks/types"
import { BookmarkIcon } from "lucide-react"

function resolveOverFolder(
  data: BookmarkData,
  overId: string,
  overType?: string,
  overFolderId?: string
) {
  if (overType === "folder-drop" || overType === "folder") {
    return overFolderId ?? overId.replace(/^drop-/, "")
  }
  if (overType === "link" && overFolderId) return overFolderId
  if (data.nodes[overId]?.type === "folder") return overId
  return undefined
}

function resolveOverIndex(
  data: BookmarkData,
  folderId: string,
  overId: string,
  overType?: string
) {
  const links = folderLinks(data, folderId)
  if (overType === "link") {
    const index = links.findIndex((link) => link.id === overId)
    return index >= 0 ? index : links.length
  }
  return links.length
}

export function FolderBoard({
  data,
  query,
  view,
  focusedFolderId,
  onReorderFolders,
  onMoveLink,
  onRename,
  onColor,
  onRemoveFolder,
  onRemoveLink,
  onSortFolderLinks,
}: {
  data: BookmarkData
  query: string
  view: BookmarkView
  focusedFolderId?: string
  onReorderFolders: (activeId: string, overId: string) => void
  onMoveLink: (linkId: string, folderId: string, index: number) => void
  onRename: (folderId: string, title: string) => void
  onColor: (folderId: string, color: FolderColorId) => void
  onRemoveFolder: (folderId: string) => void
  onRemoveLink: (linkId: string) => void
  onSortFolderLinks: (folderId: string) => void
}) {
  const [activeLink, setActiveLink] = useState<BookmarkLink | null>(null)
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const folderIds = useMemo(
    () => data.folderOrder.filter((id) => data.nodes[id]?.type === "folder"),
    [data]
  )

  if (folderIds.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookmarkIcon />
          </EmptyMedia>
          <EmptyTitle>Todavía no hay carpetas</EmptyTitle>
          <EmptyDescription>
            Importá el HTML de Chrome o creá una carpeta nueva.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const visibleCount = folderIds.filter((folderId) => {
    if (!query.trim()) return true
    const needle = query.trim().toLowerCase()
    return folderLinks(data, folderId).some(
      (link) =>
        link.title.toLowerCase().includes(needle) ||
        link.url.toLowerCase().includes(needle)
    )
  }).length

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "link") {
      setActiveLink(getLink(data, String(event.active.id)) ?? null)
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveLink(null)
    const { active, over } = event
    if (!over) return

    const activeType = active.data.current?.type as string | undefined
    const overType = over.data.current?.type as string | undefined
    const overFolderId = over.data.current?.folderId as string | undefined

    if (activeType === "folder") {
      const overFolder = resolveOverFolder(
        data,
        String(over.id),
        overType,
        overFolderId
      )
      if (overFolder && overFolder !== active.id) {
        onReorderFolders(String(active.id), overFolder)
      }
      return
    }

    if (activeType === "link") {
      const folderId = resolveOverFolder(
        data,
        String(over.id),
        overType,
        overFolderId
      )
      if (!folderId) return
      const index = resolveOverIndex(data, folderId, String(over.id), overType)
      onMoveLink(String(active.id), folderId, index)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveLink(null)}
    >
      <SortableContext items={folderIds} strategy={rectSortingStrategy}>
        {query.trim() && visibleCount === 0 ? (
          <Empty className="mb-4 border border-border bg-card/40">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookmarkIcon />
              </EmptyMedia>
              <EmptyTitle>Nada en tus favoritos</EmptyTitle>
              <EmptyDescription>
                Enter o Google busca “{query.trim()}” en Google.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}
        <div className="grid gap-4 lg:grid-cols-2">
          {folderIds.map((folderId) => (
            <FolderCard
              key={folderId}
              data={data}
              folderId={folderId}
              query={query}
              view={view}
              focusedFolderId={focusedFolderId}
              onRename={(title) => onRename(folderId, title)}
              onColor={(color) => onColor(folderId, color)}
              onRemoveFolder={() => onRemoveFolder(folderId)}
              onRemoveLink={onRemoveLink}
              onExpand={() => setExpandedFolderId(folderId)}
              onSortLinks={() => onSortFolderLinks(folderId)}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeLink ? <BookmarkOverlay link={activeLink} /> : null}
      </DragOverlay>
      {expandedFolderId ? (
        <FolderModal
          data={data}
          folderId={expandedFolderId}
          open
          onOpenChange={(open) => {
            if (!open) setExpandedFolderId(null)
          }}
          onRemoveLink={onRemoveLink}
          onSortLinks={() => onSortFolderLinks(expandedFolderId)}
        />
      ) : null}
    </DndContext>
  )
}

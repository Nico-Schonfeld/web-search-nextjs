"use client"

import { useEffect, useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ArrowDownAZIcon,
  ChevronDownIcon,
  ExpandIcon,
  FolderIcon,
  GripVerticalIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react"

import { BookmarkTile, type BookmarkView } from "@/components/bookmarks/bookmark-tile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { folderLinks, folderPath } from "@/lib/bookmarks/tree"
import {
  FOLDER_COLOR_CLASS,
  FOLDER_COLOR_IDS,
  type BookmarkData,
  type FolderColorId,
} from "@/lib/bookmarks/types"
import { cn } from "@/lib/utils"

export function FolderCard({
  data,
  folderId,
  query,
  view,
  focusedFolderId,
  onRename,
  onColor,
  onRemoveFolder,
  onRemoveLink,
  onExpand,
  onSortLinks,
}: {
  data: BookmarkData
  folderId: string
  query: string
  view: BookmarkView
  focusedFolderId?: string
  onRename: (title: string) => void
  onColor: (color: FolderColorId) => void
  onRemoveFolder: () => void
  onRemoveLink: (linkId: string) => void
  onExpand: () => void
  onSortLinks: () => void
}) {
  const folder = data.nodes[folderId]
  const path = folderPath(data, folderId)
  const links = folder?.type === "folder" ? folderLinks(data, folderId) : []
  const needle = query.trim().toLowerCase()
  const visibleLinks = needle
    ? links.filter(
        (link) =>
          link.title.toLowerCase().includes(needle) ||
          link.url.toLowerCase().includes(needle)
      )
    : links

  const [open, setOpen] = useState(() => Boolean(needle))

  useEffect(() => {
    if (needle) setOpen(true)
  }, [needle])

  useEffect(() => {
    if (focusedFolderId !== folderId) return
    setOpen(true)
    requestAnimationFrame(() => {
      document
        .getElementById(`folder-${folderId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    })
  }, [focusedFolderId, folderId])

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${folderId}`,
    data: { type: "folder-drop", folderId },
  })

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: folderId,
    data: { type: "folder", folderId },
    disabled: Boolean(needle),
  })

  if (!folder || folder.type !== "folder") return null
  if (needle && visibleLinks.length === 0) return null

  const colors = FOLDER_COLOR_CLASS[folder.color]

  return (
    <div
      id={`folder-${folderId}`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "opacity-50")}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <Card
          size="sm"
          className={cn(
            "h-full bg-card/80 backdrop-blur-sm",
            isOver && "ring-2 ring-primary/50"
          )}
          ref={setDropRef}
        >
          <CardHeader className="border-b">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Mover carpeta"
                {...attributes}
                {...listeners}
              >
                <GripVerticalIcon className="size-4" />
              </button>
              <span className={cn("size-2.5 shrink-0 rounded-full", colors.bar)} />
              <CardTitle className="min-w-0 flex-1">
                <Input
                  value={folder.title}
                  onChange={(event) => onRename(event.target.value)}
                  className="h-7 border-transparent bg-transparent px-1 text-sm font-medium shadow-none md:text-sm dark:bg-transparent"
                />
              </CardTitle>
            </div>
            {path.length > 0 ? (
              <CardDescription className="pl-8">{path.join(" / ")}</CardDescription>
            ) : null}
            <CardAction>
              <div className="flex items-center gap-1">
                <Badge variant="secondary">{visibleLinks.length}</Badge>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Expandir carpeta"
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          onExpand()
                        }}
                      />
                    }
                  >
                    <ExpandIcon />
                  </TooltipTrigger>
                  <TooltipContent>Ver carpeta en grande</TooltipContent>
                </Tooltip>
                <CollapsibleTrigger
                  render={
                    <Button variant="ghost" size="icon-sm" aria-label="Abrir carpeta" />
                  }
                >
                  <ChevronDownIcon
                    className={cn(
                      "size-4 transition-transform",
                      open && "rotate-180"
                    )}
                  />
                </CollapsibleTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-sm" />}
                  >
                    <MoreHorizontalIcon />
                    <span className="sr-only">Opciones de carpeta</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Color</DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        value={folder.color}
                        onValueChange={(value) => {
                          if (value) onColor(value as FolderColorId)
                        }}
                      >
                        {FOLDER_COLOR_IDS.map((color) => (
                          <DropdownMenuRadioItem key={color} value={color}>
                            <span
                              className={cn(
                                "size-2.5 rounded-full",
                                FOLDER_COLOR_CLASS[color].bar
                              )}
                            />
                            {FOLDER_COLOR_CLASS[color].label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onSortLinks}>
                      <ArrowDownAZIcon />
                      Ordenar sitios A-Z
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onExpand}>
                      <ExpandIcon />
                      Ver en grande
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={onRemoveFolder}>
                      <Trash2Icon />
                      Eliminar carpeta
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardAction>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-3">
              <div
                className={cn(
                  "rounded-xl p-1",
                  colors.wash,
                  isOver && "outline-2 outline-dashed outline-primary/40"
                )}
              >
                {visibleLinks.length === 0 ? (
                  <div className="flex h-24 flex-col items-center justify-center gap-1 text-muted-foreground">
                    <FolderIcon className="size-5" />
                    <p className="text-xs">Soltá sitios acá</p>
                  </div>
                ) : (
                  <SortableContext
                    items={visibleLinks.map((link) => link.id)}
                    strategy={rectSortingStrategy}
                  >
                    <ScrollArea className={visibleLinks.length > 6 ? "h-[28rem]" : "h-auto"}>
                      <div
                        className={cn(
                          view === "cards"
                            ? "grid grid-cols-1 gap-3 p-1 sm:grid-cols-2"
                            : view === "list"
                              ? "flex flex-col gap-1 p-1"
                              : "flex flex-wrap gap-1 p-1"
                        )}
                      >
                        {visibleLinks.map((link) => (
                          <BookmarkTile
                            key={link.id}
                            link={link}
                            folderId={folderId}
                            view={view}
                            onRemove={() => onRemoveLink(link.id)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </SortableContext>
                )}
              </div>
              {visibleLinks.length > 8 ? (
                <>
                  <Separator className="mt-3" />
                  <p className="pt-2 text-center text-[11px] text-muted-foreground">
                    {visibleLinks.length} sitios · desplazá para ver más
                  </p>
                </>
              ) : null}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  )
}

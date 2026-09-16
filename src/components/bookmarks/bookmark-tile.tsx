"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { BookmarkIcon, GripVerticalIcon, Trash2Icon } from "lucide-react"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useInView } from "@/hooks/use-in-view"
import { proxiedImage, useLinkPreview } from "@/hooks/use-link-preview"
import { faviconUrl, hostnameOf } from "@/lib/bookmarks/favicon"
import type { BookmarkLink } from "@/lib/bookmarks/types"
import { cn } from "@/lib/utils"

export type BookmarkView = "cards" | "compact" | "list"

function Favicon({
  url,
  title,
  className,
}: {
  url: string
  title: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const src = faviconUrl(url, 64)

  if (failed || !src) {
    return (
      <span className={cn("grid place-items-center text-[10px] font-medium", className)}>
        {title.slice(0, 1).toUpperCase()}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={16}
      height={16}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}

function PreviewMedia({
  image,
  title,
  className,
}: {
  image?: string
  title: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const src = proxiedImage(image)

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
      >
        <BookmarkIcon className="size-8 opacity-50" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      className={cn("size-full object-cover", className)}
      onError={() => setFailed(true)}
    />
  )
}

function XPreviewCard({
  href,
  title,
  description,
  image,
  domain,
  loading,
}: {
  href: string
  title: string
  description?: string
  image?: string
  domain: string
  loading?: boolean
}) {
  return (
    <a
      href={href}
      className="block overflow-hidden rounded-2xl bg-background text-left ring-1 ring-foreground/10 transition-colors hover:bg-muted/40"
    >
      <AspectRatio ratio={1.91} className="bg-muted">
        {loading ? (
          <Skeleton className="size-full rounded-none" />
        ) : (
          <PreviewMedia image={image} title={title} />
        )}
      </AspectRatio>
      <div className="space-y-1 p-3">
        <p className="line-clamp-2 text-sm font-medium leading-snug">{title}</p>
        {loading ? (
          <Skeleton className="h-8 w-full" />
        ) : description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        <p className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
          <Favicon url={href} title={title} className="size-3.5" />
          {domain}
        </p>
      </div>
    </a>
  )
}

export function BookmarkTile({
  link,
  folderId,
  view,
  sortable = true,
  onRemove,
}: {
  link: BookmarkLink
  folderId: string
  view: BookmarkView
  sortable?: boolean
  onRemove?: () => void
}) {
  const { setRef: setInViewRef, inView } = useInView()
  const { listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: link.id,
      data: { type: "link", folderId },
      disabled: !sortable,
    })
  const { preview, loading } = useLinkPreview(link.url, inView)
  const title =
    preview?.title && !/^https?:\/\//i.test(preview.title)
      ? preview.title
      : link.title
  const domain = hostnameOf(link.url)
  const description = preview?.description

  const setRefs = (node: HTMLElement | null) => {
    setNodeRef(node)
    setInViewRef(node)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const removeButton = onRemove ? (
    <button
      type="button"
      className="flex size-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm ring-1 ring-foreground/10 backdrop-blur transition-colors hover:bg-destructive/15 hover:text-destructive"
      aria-label={`Eliminar ${link.title}`}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onRemove()
      }}
    >
      <Trash2Icon className="size-3.5" />
    </button>
  ) : null

  if (view === "list") {
    return (
      <div
        ref={setRefs}
        style={style}
        className={cn(
          "group flex items-center gap-2 rounded-xl pr-1 transition-colors hover:bg-foreground/5",
          isDragging && "opacity-40"
        )}
      >
        {sortable ? (
          <button
            type="button"
            className="shrink-0 px-1 text-muted-foreground hover:text-foreground"
            aria-label="Mover sitio"
            {...listeners}
          >
            <GripVerticalIcon className="size-4" />
          </button>
        ) : null}
        <a
          href={link.url}
          className="flex min-w-0 flex-1 items-center gap-3 px-2 py-2"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background ring-1 ring-foreground/10">
            <Favicon url={link.url} title={link.title} className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{title}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {domain}
            </span>
          </span>
        </a>
        <span
          className={cn(
            "transition-opacity",
            sortable ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          )}
        >
          {removeButton}
        </span>
      </div>
    )
  }

  if (view === "cards") {
    return (
      <div
        ref={setRefs}
        style={style}
        className={cn("group relative", isDragging && "opacity-40")}
      >
        {sortable ? (
          <button
            type="button"
            className="absolute top-2 left-2 z-10 flex size-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 shadow-sm ring-1 ring-foreground/10 backdrop-blur transition-opacity group-hover:opacity-100 hover:text-foreground focus:opacity-100"
            aria-label="Mover sitio"
            {...listeners}
          >
            <GripVerticalIcon className="size-3.5" />
          </button>
        ) : null}
        {removeButton ? (
          <span
            className={cn(
              "absolute top-2 right-2 z-10 transition-opacity",
              sortable ? "opacity-0 group-hover:opacity-100" : "opacity-100"
            )}
          >
            {removeButton}
          </span>
        ) : null}
        <XPreviewCard
          href={link.url}
          title={title}
          description={description}
          image={preview?.image}
          domain={domain}
          loading={loading && !preview}
        />
      </div>
    )
  }

  return (
    <div
      ref={setRefs}
      style={style}
      className={cn("group relative", isDragging && "opacity-40")}
    >
      {removeButton ? (
        <span
          className={cn(
            "absolute -top-1 -right-1 z-10 transition-opacity",
            sortable ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          )}
        >
          {removeButton}
        </span>
      ) : null}
      <HoverCard>
        <HoverCardTrigger
          delay={280}
          render={
            <a
              href={link.url}
              className="flex w-[76px] flex-col items-center gap-1.5 rounded-xl p-2 text-center transition-colors hover:bg-foreground/5"
              {...(sortable ? listeners : {})}
            />
          }
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-foreground/10">
            <Favicon url={link.url} title={link.title} className="size-6" />
          </span>
          <span className="line-clamp-2 w-full text-[11px] leading-tight text-foreground/90">
            {link.title}
          </span>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-0" side="top">
          <XPreviewCard
            href={link.url}
            title={title}
            description={description}
            image={preview?.image}
            domain={domain}
            loading={loading && !preview}
          />
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}

export function BookmarkOverlay({ link }: { link: BookmarkLink }) {
  return (
    <div className="w-64 overflow-hidden rounded-2xl bg-card shadow-lg ring-1 ring-foreground/10">
      <div className="flex items-center gap-3 p-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <BookmarkIcon className="size-4" />
        </span>
        <span className="line-clamp-2 text-sm font-medium">{link.title}</span>
      </div>
    </div>
  )
}

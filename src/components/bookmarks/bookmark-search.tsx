"use client"

import { useEffect, useState } from "react"
import { FolderIcon, GlobeIcon } from "lucide-react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { faviconUrl, hostnameOf } from "@/lib/bookmarks/favicon"
import { allLinks, folderPath, searchableFolders } from "@/lib/bookmarks/tree"
import type { BookmarkData } from "@/lib/bookmarks/types"

export function BookmarkSearch({
  data,
  open,
  onOpenChange,
  onSelectFolder,
}: {
  data: BookmarkData
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectFolder: (folderId: string) => void
}) {
  const [term, setTerm] = useState("")
  const folders = searchableFolders(data)
  const links = allLinks(data)

  useEffect(() => {
    if (!open) setTerm("")
  }, [open])

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Buscar en favoritos"
      description="Encontrá una carpeta o un sitio guardado"
      className="sm:max-w-lg"
    >
      <Command>
        <CommandInput
          placeholder="Buscar carpetas o sitios…"
          value={term}
          onValueChange={setTerm}
        />
        <CommandList>
          <CommandEmpty>No hay coincidencias en tus favoritos.</CommandEmpty>
          <CommandGroup heading="Carpetas">
            {folders.map((folder) => {
              const path = folderPath(data, folder.id)
              return (
                <CommandItem
                  key={folder.id}
                  value={`${folder.title} ${path.join(" ")} carpeta`}
                  onMouseDown={(event) => event.preventDefault()}
                  onSelect={() => {
                    onOpenChange(false)
                    onSelectFolder(folder.id)
                  }}
                >
                  <FolderIcon className="text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{folder.title}</span>
                  {path.length > 0 ? (
                    <span className="max-w-[40%] truncate text-xs text-muted-foreground">
                      {path.join(" / ")}
                    </span>
                  ) : null}
                </CommandItem>
              )
            })}
          </CommandGroup>
          <CommandGroup heading="Sitios">
            {links.map((link) => (
              <CommandItem
                key={link.id}
                value={`${link.title} ${link.url} sitio web`}
                onMouseDown={(event) => event.preventDefault()}
                onSelect={() => {
                  onOpenChange(false)
                  window.location.assign(link.url)
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={faviconUrl(link.url, 32)}
                  alt=""
                  width={16}
                  height={16}
                  className="size-4"
                />
                <span className="min-w-0 flex-1 truncate">{link.title}</span>
                <span className="max-w-[40%] truncate text-xs text-muted-foreground">
                  {hostnameOf(link.url)}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          {folders.length === 0 && links.length === 0 ? (
            <CommandItem disabled value="vacío">
              <GlobeIcon />
              Todavía no hay favoritos importados
            </CommandItem>
          ) : null}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

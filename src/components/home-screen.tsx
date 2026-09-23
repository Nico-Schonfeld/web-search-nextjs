"use client"

import { useEffect, useState } from "react"
import {
  ArrowDownAZIcon,
  BookmarkPlusIcon,
  FolderPlusIcon,
  ImageIcon,
  LayoutGridIcon,
  ListIcon,
  MailIcon,
  MoreHorizontalIcon,
  PaletteIcon,
  PanelsTopLeftIcon,
  RotateCcwIcon,
  SearchIcon,
  SparklesIcon,
  UploadIcon,
} from "lucide-react"
import { toast } from "sonner"

import { BookmarkSearch } from "@/components/bookmarks/bookmark-search"
import { FolderBoard } from "@/components/bookmarks/folder-board"
import { ImportDialog } from "@/components/bookmarks/import-dialog"
import type { BookmarkView } from "@/components/bookmarks/bookmark-tile"
import { AddShortcutDialog } from "@/components/search/add-shortcut-dialog"
import { SearchHero } from "@/components/search/search-hero"
import { ShortcutRow } from "@/components/search/shortcut-row"
import { Wordmark } from "@/components/search/wordmark"
import { CustomizePanel } from "@/components/theme/customize-panel"
import { useAppearance } from "@/components/theme/appearance-provider"
import { AiPanel } from "@/components/today/ai-panel"
import { ClockWeather } from "@/components/today/clock-weather"
import { TodayBoard } from "@/components/today/today-board"
import { WorkApps } from "@/components/today/work-apps"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Kbd } from "@/components/ui/kbd"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useShortcuts } from "@/hooks/use-shortcuts"
import {
  addFolder,
  moveLink,
  removeFolder,
  removeLink,
  renameFolder,
  reorderFolders,
  setFolderColor,
  sortAllLinksAlphabetically,
  sortFoldersAlphabetically,
  sortLinksInFolder,
} from "@/lib/bookmarks/tree"

const VIEW_KEY = "nexo.view"

export function HomeScreen() {
  const { data, ready, importHtml, importHtmlText, reset, update } = useBookmarks()
  const {
    shortcuts,
    addFromUrl,
    toggleLink,
    remove: removeShortcut,
  } = useShortcuts()
  const { appearance } = useAppearance()
  const [query, setQuery] = useState("")
  const [importOpen, setImportOpen] = useState(false)
  const [shortcutOpen, setShortcutOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [focusedFolderId, setFocusedFolderId] = useState<string>()
  const [view, setView] = useState<BookmarkView>("cards")

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_KEY)
    if (saved === "cards" || saved === "compact" || saved === "list") setView(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view)
  }, [view])

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
        <ClockWeather
          showClock={appearance.showClock}
          showWeather={appearance.showWeather}
        />
        <div className="ml-auto flex items-center gap-1">
        {appearance.showGmail ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <a
                  href="https://mail.google.com"
                  aria-label="Gmail"
                  className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                />
              }
            >
              <MailIcon className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Gmail</TooltipContent>
          </Tooltip>
        ) : null}
        {appearance.showImages ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <a
                  href="https://www.google.com/imghp"
                  aria-label="Imágenes de Google"
                  className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                />
              }
            >
              <ImageIcon className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Imágenes</TooltipContent>
          </Tooltip>
        ) : null}
        {appearance.showWorkApps ? <WorkApps /> : null}
        {appearance.showAi ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Chat de nexo"
                  onClick={() => setAiOpen(true)}
                />
              }
            >
              <SparklesIcon />
            </TooltipTrigger>
            <TooltipContent>Chat IA</TooltipContent>
          </Tooltip>
        ) : null}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Personalizar apariencia"
                onClick={() => setCustomizeOpen(true)}
              />
            }
          >
            <PaletteIcon />
          </TooltipTrigger>
          <TooltipContent>Personalizar</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
            <MoreHorizontalIcon />
            <span className="sr-only">Menú</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={() => setCustomizeOpen(true)}>
              <PaletteIcon />
              Personalizar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setImportOpen(true)}>
              <UploadIcon />
              Importar favoritos
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!data}
              onClick={() => {
                update(addFolder)
                toast.success("Carpeta creada")
              }}
            >
              <FolderPlusIcon />
              Nueva carpeta
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!data}
              onClick={() => {
                update(sortFoldersAlphabetically)
                toast.success("Carpetas ordenadas A-Z")
              }}
            >
              <ArrowDownAZIcon />
              Ordenar carpetas A-Z
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!data}
              onClick={() => {
                update(sortAllLinksAlphabetically)
                toast.success("Sitios ordenados A-Z")
              }}
            >
              <ArrowDownAZIcon />
              Ordenar sitios A-Z
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={!data}
              onClick={() => {
                reset()
                setQuery("")
                toast.success("Se restableció este inicio")
              }}
            >
              <RotateCcwIcon />
              Borrar mis favoritos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </header>

      <section className="flex flex-col items-center px-4 pt-[5vh] pb-6 sm:pt-[8vh]">
        <Wordmark variant={appearance.wordmark} />
        <div className="mt-8 w-full max-w-xl">
          <SearchHero data={data} query={query} onQueryChange={setQuery} />
        </div>
        {ready && !query.trim() ? (
          <ShortcutRow
            shortcuts={shortcuts}
            onAdd={() => setShortcutOpen(true)}
            onRemove={(id) => {
              removeShortcut(id)
              toast.success("Atajo quitado")
            }}
          />
        ) : null}
      </section>

      {ready && !query.trim() ? (
        <TodayBoard
          showNext={appearance.showNext}
          showAgenda={appearance.showAgenda}
          showNotes={appearance.showNotes}
        />
      ) : null}

      <section className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20">
        {!ready ? null : data ? (
          <>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                  Tus sitios
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Buscar en favoritos"
                        onClick={() => setSearchOpen(true)}
                      />
                    }
                  >
                    <SearchIcon />
                  </TooltipTrigger>
                  <TooltipContent>
                    Buscar carpetas o sitios
                    <Kbd className="ml-1">Ctrl K</Kbd>
                  </TooltipContent>
                </Tooltip>
                <ToggleGroup
                  variant="outline"
                  size="sm"
                  spacing={0}
                  value={[view]}
                  onValueChange={(groupValue) => {
                    const next = groupValue[0]
                    if (next === "cards" || next === "compact" || next === "list") setView(next)
                  }}
                >
                  <ToggleGroupItem value="cards" aria-label="Vista de tarjetas">
                    <PanelsTopLeftIcon />
                    Tarjetas
                  </ToggleGroupItem>
                  <ToggleGroupItem value="compact" aria-label="Vista compacta">
                    <LayoutGridIcon />
                    Íconos
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="Vista de lista">
                    <ListIcon />
                    Lista
                  </ToggleGroupItem>
                </ToggleGroup>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    update(addFolder)
                    toast.success("Carpeta creada. Arrastrá sitios adentro.")
                  }}
                >
                  <FolderPlusIcon />
                  Nueva carpeta
                </Button>
              </div>
            </div>
            <FolderBoard
              data={data}
              query={query}
              view={view}
              focusedFolderId={focusedFolderId}
              onReorderFolders={(activeId, overId) =>
                update((current) => reorderFolders(current, activeId, overId))
              }
              onMoveLink={(linkId, folderId, index) =>
                update((current) => moveLink(current, linkId, folderId, index))
              }
              onRename={(folderId, title) =>
                update((current) => renameFolder(current, folderId, title))
              }
              onColor={(folderId, color) =>
                update((current) => setFolderColor(current, folderId, color))
              }
              onRemoveFolder={(folderId) =>
                update((current) => removeFolder(current, folderId))
              }
              onRemoveLink={(linkId) => {
                update((current) => removeLink(current, linkId))
                toast.success("Sitio eliminado")
              }}
              onSortFolderLinks={(folderId) => {
                update((current) => sortLinksInFolder(current, folderId))
                toast.success("Sitios ordenados A-Z")
              }}
            />
          </>
        ) : (
          <Empty className="border border-border bg-card/40">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookmarkPlusIcon />
              </EmptyMedia>
              <EmptyTitle>Tu Google, con tus favoritos a la vista</EmptyTitle>
              <EmptyDescription>
                Buscá como siempre. Abajo, las carpetas que exportes de Chrome
                se pueden reordenar y los sitios se mueven arrastrándolos.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setImportOpen(true)}>
                <UploadIcon />
                Importar HTML de Chrome
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  const response = await fetch("/sample-bookmarks.html")
                  const html = await response.text()
                  importHtmlText(html)
                  toast.success("Cargamos un ejemplo para que pruebes el tablero.")
                }}
              >
                Probar con un ejemplo
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </section>

      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={importHtml}
      />
      <AddShortcutDialog
        open={shortcutOpen}
        onOpenChange={setShortcutOpen}
        data={data}
        shortcuts={shortcuts}
        onAddUrl={addFromUrl}
        onToggleLink={toggleLink}
      />
      {data ? (
        <BookmarkSearch
          data={data}
          open={searchOpen}
          onOpenChange={setSearchOpen}
          onSelectFolder={(folderId) => {
            setFocusedFolderId(undefined)
            requestAnimationFrame(() => setFocusedFolderId(folderId))
          }}
        />
      ) : null}
      <CustomizePanel
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
      />
      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  )
}

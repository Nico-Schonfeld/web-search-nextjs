export const ROOT_FOLDER_ID = "root"
export const UNFILED_FOLDER_ID = "unfiled"

export const FOLDER_COLOR_IDS = [
  "sky",
  "violet",
  "emerald",
  "amber",
  "rose",
  "cyan",
  "orange",
  "indigo",
] as const

export type FolderColorId = (typeof FOLDER_COLOR_IDS)[number]

export type BookmarkLink = {
  id: string
  type: "link"
  title: string
  url: string
}

export type BookmarkFolder = {
  id: string
  type: "folder"
  title: string
  color: FolderColorId
  children: string[]
}

export type BookmarkNode = BookmarkLink | BookmarkFolder

export type BookmarkData = {
  version: 1
  rootId: typeof ROOT_FOLDER_ID
  folderOrder: string[]
  toolbarFolderId?: string
  nodes: Record<string, BookmarkNode>
}

export function isFolder(
  node: BookmarkNode | undefined
): node is BookmarkFolder {
  return node?.type === "folder"
}

export function isLink(node: BookmarkNode | undefined): node is BookmarkLink {
  return node?.type === "link"
}

export const FOLDER_COLOR_CLASS: Record<
  FolderColorId,
  { bar: string; wash: string; label: string }
> = {
  sky: { bar: "bg-sky-400", wash: "bg-sky-400/10", label: "Cielo" },
  violet: { bar: "bg-violet-400", wash: "bg-violet-400/10", label: "Violeta" },
  emerald: { bar: "bg-emerald-400", wash: "bg-emerald-400/10", label: "Esmeralda" },
  amber: { bar: "bg-amber-400", wash: "bg-amber-400/10", label: "Ámbar" },
  rose: { bar: "bg-rose-400", wash: "bg-rose-400/10", label: "Rosa" },
  cyan: { bar: "bg-cyan-400", wash: "bg-cyan-400/10", label: "Cian" },
  orange: { bar: "bg-orange-400", wash: "bg-orange-400/10", label: "Naranja" },
  indigo: { bar: "bg-indigo-400", wash: "bg-indigo-400/10", label: "Índigo" },
}

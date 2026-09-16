import {
  FOLDER_COLOR_IDS,
  ROOT_FOLDER_ID,
  isFolder,
  isLink,
  type BookmarkData,
  type BookmarkFolder,
  type BookmarkLink,
  type FolderColorId,
} from "./types"

export function arrayMove<T>(items: T[], from: number, to: number) {
  const next = items.slice()
  const [item] = next.splice(from, 1)
  if (item === undefined) return items
  next.splice(to, 0, item)
  return next
}

export function getFolder(data: BookmarkData, id: string) {
  const node = data.nodes[id]
  return isFolder(node) ? node : undefined
}

export function getLink(data: BookmarkData, id: string) {
  const node = data.nodes[id]
  return isLink(node) ? node : undefined
}

export function folderLinks(data: BookmarkData, folderId: string) {
  const folder = getFolder(data, folderId)
  if (!folder) return []
  return folder.children
    .map((id) => getLink(data, id))
    .filter((link): link is BookmarkLink => Boolean(link))
}

export function findParentId(data: BookmarkData, nodeId: string) {
  for (const node of Object.values(data.nodes)) {
    if (isFolder(node) && node.children.includes(nodeId)) return node.id
  }
  return undefined
}

export function folderPath(data: BookmarkData, folderId: string) {
  const titles: string[] = []
  let current = findParentId(data, folderId)
  while (current && current !== ROOT_FOLDER_ID) {
    const folder = getFolder(data, current)
    if (!folder) break
    titles.unshift(folder.title)
    current = findParentId(data, current)
  }
  return titles
}

export function allLinks(data: BookmarkData) {
  return Object.values(data.nodes).filter(isLink)
}

export function searchLinks(data: BookmarkData, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return []
  return allLinks(data).filter((link) => {
    return (
      link.title.toLowerCase().includes(needle) ||
      link.url.toLowerCase().includes(needle)
    )
  })
}

export function searchableFolders(data: BookmarkData) {
  return data.folderOrder
    .map((id) => getFolder(data, id))
    .filter((folder): folder is BookmarkFolder => Boolean(folder))
}


export function reorderFolders(
  data: BookmarkData,
  activeId: string,
  overId: string
): BookmarkData {
  const from = data.folderOrder.indexOf(activeId)
  const to = data.folderOrder.indexOf(overId)
  if (from < 0 || to < 0 || from === to) return data
  return { ...data, folderOrder: arrayMove(data.folderOrder, from, to) }
}

export function moveLink(
  data: BookmarkData,
  linkId: string,
  toFolderId: string,
  toIndex: number
): BookmarkData {
  const fromFolderId = findParentId(data, linkId)
  const fromFolder = fromFolderId ? getFolder(data, fromFolderId) : undefined
  const toFolder = getFolder(data, toFolderId)
  const link = getLink(data, linkId)
  if (!fromFolder || !toFolder || !link) return data

  const fromIndex = fromFolder.children.indexOf(linkId)
  if (fromIndex < 0) return data

  const nodes = { ...data.nodes }
  const nextFrom: BookmarkFolder = {
    ...fromFolder,
    children: fromFolder.children.slice(),
  }

  if (fromFolderId === toFolderId) {
    nextFrom.children = arrayMove(nextFrom.children, fromIndex, toIndex)
    nodes[fromFolder.id] = nextFrom
    return { ...data, nodes }
  }

  const nextTo: BookmarkFolder = {
    ...toFolder,
    children: toFolder.children.slice(),
  }
  nextFrom.children.splice(fromIndex, 1)
  const bounded = Math.max(0, Math.min(toIndex, nextTo.children.length))
  nextTo.children.splice(bounded, 0, linkId)
  nodes[nextFrom.id] = nextFrom
  nodes[nextTo.id] = nextTo
  return { ...data, nodes }
}

export function renameFolder(
  data: BookmarkData,
  folderId: string,
  title: string
): BookmarkData {
  const folder = getFolder(data, folderId)
  const nextTitle = title.trim()
  if (!folder || !nextTitle) return data
  return {
    ...data,
    nodes: { ...data.nodes, [folderId]: { ...folder, title: nextTitle } },
  }
}

export function setFolderColor(
  data: BookmarkData,
  folderId: string,
  color: FolderColorId
): BookmarkData {
  const folder = getFolder(data, folderId)
  if (!folder) return data
  return {
    ...data,
    nodes: { ...data.nodes, [folderId]: { ...folder, color } },
  }
}

export function addFolder(data: BookmarkData, title = "Nueva carpeta") {
  const root = getFolder(data, ROOT_FOLDER_ID)
  if (!root) return data
  const id = crypto.randomUUID()
  const color = FOLDER_COLOR_IDS[data.folderOrder.length % FOLDER_COLOR_IDS.length]
  const folder: BookmarkFolder = {
    id,
    type: "folder",
    title,
    color,
    children: [],
  }
  return {
    ...data,
    folderOrder: [id, ...data.folderOrder],
    nodes: {
      ...data.nodes,
      [id]: folder,
      [ROOT_FOLDER_ID]: { ...root, children: [id, ...root.children] },
    },
  }
}

export function removeFolder(data: BookmarkData, folderId: string): BookmarkData {
  if (folderId === ROOT_FOLDER_ID) return data
  const folder = getFolder(data, folderId)
  if (!folder) return data

  const nodes = { ...data.nodes }
  for (const childId of folder.children) {
    if (isLink(nodes[childId])) delete nodes[childId]
  }
  delete nodes[folderId]

  const parentId = findParentId(data, folderId)
  if (parentId) {
    const parent = getFolder({ ...data, nodes }, parentId)
    if (parent) {
      nodes[parentId] = {
        ...parent,
        children: parent.children.filter((id) => id !== folderId),
      }
    }
  }

  return {
    ...data,
    folderOrder: data.folderOrder.filter((id) => id !== folderId),
    nodes,
  }
}

export function removeLink(data: BookmarkData, linkId: string): BookmarkData {
  const parentId = findParentId(data, linkId)
  const parent = parentId ? getFolder(data, parentId) : undefined
  if (!parent) return data
  const nodes = { ...data.nodes }
  delete nodes[linkId]
  nodes[parent.id] = {
    ...parent,
    children: parent.children.filter((id) => id !== linkId),
  }
  return { ...data, nodes }
}

export function sortFoldersAlphabetically(data: BookmarkData): BookmarkData {
  const sorted = data.folderOrder
    .map((id) => getFolder(data, id))
    .filter((folder): folder is BookmarkFolder => Boolean(folder))
    .sort((a, b) =>
      a.title.localeCompare(b.title, "es", { sensitivity: "base" })
    )
    .map((folder) => folder.id)

  return { ...data, folderOrder: sorted }
}

export function sortLinksInFolder(
  data: BookmarkData,
  folderId: string
): BookmarkData {
  const folder = getFolder(data, folderId)
  if (!folder) return data

  const linkIds = folder.children.filter((id) => isLink(data.nodes[id]))
  const nestedIds = folder.children.filter((id) => isFolder(data.nodes[id]))
  const sortedLinks = [...linkIds].sort((a, b) => {
    const left = getLink(data, a)?.title ?? ""
    const right = getLink(data, b)?.title ?? ""
    return left.localeCompare(right, "es", { sensitivity: "base" })
  })

  return {
    ...data,
    nodes: {
      ...data.nodes,
      [folderId]: { ...folder, children: [...sortedLinks, ...nestedIds] },
    },
  }
}

export function sortAllLinksAlphabetically(data: BookmarkData): BookmarkData {
  return data.folderOrder.reduce(
    (next, folderId) => sortLinksInFolder(next, folderId),
    data
  )
}

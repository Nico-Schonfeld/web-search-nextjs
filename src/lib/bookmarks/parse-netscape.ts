import {
  FOLDER_COLOR_IDS,
  ROOT_FOLDER_ID,
  UNFILED_FOLDER_ID,
  type BookmarkData,
  type BookmarkFolder,
  type BookmarkLink,
  type FolderColorId,
} from "./types"

function decodeEntities(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, num: string) =>
      String.fromCharCode(Number(num))
    )
    .trim()
}

function readAttr(attrs: string, name: string) {
  const match = attrs.match(
    new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i")
  )
  return match ? decodeEntities(match[2] ?? match[3] ?? "") : ""
}

function createFolder(
  id: string,
  title: string,
  color: FolderColorId
): BookmarkFolder {
  return { id, type: "folder", title, color, children: [] }
}

function nextColor(index: number): FolderColorId {
  return FOLDER_COLOR_IDS[index % FOLDER_COLOR_IDS.length]
}

function isSafeUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

export function parseNetscapeBookmarks(html: string): BookmarkData {
  const cleaned = html.replace(/\sICON="[^"]*"/gi, "")
  const tokenRe =
    /<DL\b[^>]*>|<\/DL\s*>|<DT\s*>\s*<H3\b([^>]*)>([\s\S]*?)<\/H3\s*>|<DT\s*>\s*<A\b([^>]*)>([\s\S]*?)<\/A\s*>/gi

  const root = createFolder(ROOT_FOLDER_ID, "Favoritos", "sky")
  const data: BookmarkData = {
    version: 1,
    rootId: ROOT_FOLDER_ID,
    folderOrder: [],
    nodes: { [ROOT_FOLDER_ID]: root },
  }

  const stack: string[] = [ROOT_FOLDER_ID]
  let colorIndex = 0
  let created = 0

  const currentFolder = () => {
    const id = stack[stack.length - 1] ?? ROOT_FOLDER_ID
    return data.nodes[id] as BookmarkFolder
  }

  for (const match of cleaned.matchAll(tokenRe)) {
    const token = match[0]

    if (/^<DL/i.test(token)) continue

    if (/^<\/DL/i.test(token)) {
      if (stack.length > 1) stack.pop()
      continue
    }

    if (/<H3/i.test(token)) {
      const title = decodeEntities(match[2] ?? "") || "Carpeta"
      const isToolbar = /PERSONAL_TOOLBAR_FOLDER\s*=\s*"true"/i.test(
        match[1] ?? ""
      )
      const id = crypto.randomUUID()
      const folder = createFolder(id, title, nextColor(colorIndex++))
      data.nodes[id] = folder
      currentFolder().children.push(id)
      data.folderOrder.push(id)
      stack.push(id)
      if (isToolbar && !data.toolbarFolderId) data.toolbarFolderId = id
      created += 1
      continue
    }

    const url = readAttr(match[3] ?? "", "HREF")
    if (!url || !isSafeUrl(url)) continue

    const link: BookmarkLink = {
      id: crypto.randomUUID(),
      type: "link",
      title: decodeEntities(match[4] ?? "") || url,
      url,
    }
    data.nodes[link.id] = link
    currentFolder().children.push(link.id)
    created += 1
  }

  const unfiledLinks = root.children.filter((id) => data.nodes[id]?.type === "link")
  if (unfiledLinks.length > 0) {
    const unfiled = createFolder(UNFILED_FOLDER_ID, "Sin carpeta", "indigo")
    unfiled.children = unfiledLinks
    data.nodes[UNFILED_FOLDER_ID] = unfiled
    root.children = [
      UNFILED_FOLDER_ID,
      ...root.children.filter((id) => data.nodes[id]?.type === "folder"),
    ]
    data.folderOrder = [
      UNFILED_FOLDER_ID,
      ...data.folderOrder.filter((id) => id !== UNFILED_FOLDER_ID),
    ]
  }

  if (created === 0) {
    throw new Error("No encontramos favoritos en ese archivo.")
  }

  if (!data.toolbarFolderId) {
    data.toolbarFolderId = data.folderOrder[0]
  }

  return data
}

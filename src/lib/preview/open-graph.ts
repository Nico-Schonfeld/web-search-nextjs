export type LinkPreview = {
  url: string
  title: string
  description?: string
  image?: string
  siteName?: string
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, num: string) => String.fromCharCode(Number(num)))
    .trim()
}

function readAttr(attrs: string, name: string) {
  const match = attrs.match(
    new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i")
  )
  return match ? decodeEntities(match[2] ?? match[3] ?? "") : ""
}

function isPrivateHostname(hostname: string) {
  const host = hostname.toLowerCase().replace(/\[|\]/g, "")
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host === "metadata.google.internal"
  ) {
    return true
  }

  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/
  if (!ipv4.test(host)) return false
  const [a, b] = host.split(".").map(Number)
  if (a === 10 || a === 127 || a === 0) return true
  if (a === 169 && b === 254) return true
  if (a === 192 && b === 168) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  return false
}

export function assertPublicHttpUrl(raw: string) {
  const url = new URL(raw)
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("URL no permitida")
  }
  if (isPrivateHostname(url.hostname)) {
    throw new Error("URL no permitida")
  }
  return url
}

function metaMap(html: string) {
  const map = new Map<string, string>()
  const re = /<meta\s+([^>]+)>/gi
  for (const match of html.matchAll(re)) {
    const attrs = match[1] ?? ""
    const content = readAttr(attrs, "content")
    const key =
      readAttr(attrs, "property") ||
      readAttr(attrs, "name") ||
      readAttr(attrs, "itemprop")
    if (key && content) map.set(key.toLowerCase(), content)
  }
  return map
}

function pageTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return match ? decodeEntities(match[1] ?? "") : ""
}

function resolveUrl(value: string | undefined, base: string) {
  if (!value) return undefined
  try {
    return new URL(value, base).href
  } catch {
    return undefined
  }
}

export function parseOpenGraph(html: string, pageUrl: string): LinkPreview {
  const meta = metaMap(html)
  const title =
    meta.get("og:title") ||
    meta.get("twitter:title") ||
    pageTitle(html) ||
    pageUrl
  const description =
    meta.get("og:description") ||
    meta.get("twitter:description") ||
    meta.get("description")
  const image = resolveUrl(
    meta.get("og:image") ||
      meta.get("og:image:url") ||
      meta.get("twitter:image") ||
      meta.get("twitter:image:src"),
    pageUrl
  )

  return {
    url: pageUrl,
    title: title.slice(0, 140),
    description: description?.slice(0, 220),
    image,
    siteName: meta.get("og:site_name") || meta.get("application-name"),
  }
}

const MAX_HTML_BYTES = 350_000

export async function fetchLinkPreview(rawUrl: string): Promise<LinkPreview> {
  const url = assertPublicHttpUrl(rawUrl)
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(5000),
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "es,en;q=0.8",
      "User-Agent":
        "Mozilla/5.0 (compatible; NexoPreview/1.0; +https://nexo.app)",
    },
  })

  if (!response.ok) {
    throw new Error("No se pudo leer el sitio")
  }

  const buffer = await response.arrayBuffer()
  const html = new TextDecoder("utf-8").decode(
    buffer.byteLength > MAX_HTML_BYTES ? buffer.slice(0, MAX_HTML_BYTES) : buffer
  )
  return parseOpenGraph(html, response.url || url.href)
}

export function faviconUrl(pageUrl: string, size = 64) {
  try {
    const { hostname } = new URL(pageUrl)
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=${size}`
  } catch {
    return undefined
  }
}

export function hostnameOf(pageUrl: string) {
  try {
    return new URL(pageUrl).hostname.replace(/^www\./, "")
  } catch {
    return pageUrl
  }
}

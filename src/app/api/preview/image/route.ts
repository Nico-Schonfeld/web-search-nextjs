import { NextResponse } from "next/server"

import { assertPublicHttpUrl } from "@/lib/preview/open-graph"

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("url")
  if (!raw) {
    return NextResponse.json({ error: "Falta la URL" }, { status: 400 })
  }

  try {
    const url = assertPublicHttpUrl(raw)
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NexoPreview/1.0; +https://nexo.app)",
      },
    })

    const contentType = response.headers.get("content-type") ?? ""
    if (!response.ok || !contentType.startsWith("image/")) {
      return new NextResponse(null, { status: 404 })
    }

    const bytes = await response.arrayBuffer()
    if (bytes.byteLength > 2_000_000) {
      return new NextResponse(null, { status: 413 })
    }

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    })
  } catch {
    return new NextResponse(null, { status: 404 })
  }
}

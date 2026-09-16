import { NextResponse } from "next/server"

import { fetchLinkPreview } from "@/lib/preview/open-graph"

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url")
  if (!url) {
    return NextResponse.json({ error: "Falta la URL" }, { status: 400 })
  }

  try {
    const preview = await fetchLinkPreview(url)
    return NextResponse.json(preview, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    })
  } catch {
    return NextResponse.json(
      { url, title: url, error: true },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300",
        },
      }
    )
  }
}

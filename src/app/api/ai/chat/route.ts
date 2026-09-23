import { NextResponse } from "next/server"

type ChatMessage = { role: "user" | "assistant" | "system"; content: string }

function endpointForKey(apiKey: string) {
  if (apiKey.startsWith("gsk_")) {
    return {
      url: "https://api.groq.com/openai/v1/chat/completions",
      model: "llama-3.1-8b-instant",
    }
  }
  return {
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
  }
}

export async function POST(request: Request) {
  let body: { messages?: ChatMessage[]; apiKey?: string }
  try {
    body = (await request.json()) as { messages?: ChatMessage[]; apiKey?: string }
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const apiKey = body.apiKey?.trim() ?? ""
  const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : []
  if (!apiKey) {
    return NextResponse.json(
      { error: "Falta la API key. Se guarda solo en tu navegador." },
      { status: 400 }
    )
  }
  if (messages.length === 0) {
    return NextResponse.json({ error: "Escribí un mensaje." }, { status: 400 })
  }

  const target = endpointForKey(apiKey)
  const response = await fetch(target.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: target.model,
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content:
            "Sos el asistente de nexo, un inicio de navegador en español. Respuestas cortas y útiles.",
        },
        ...messages,
      ],
    }),
  })

  if (!response.ok) {
    return NextResponse.json(
      { error: "El proveedor de IA rechazó la clave o el pedido." },
      { status: 502 }
    )
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = json.choices?.[0]?.message?.content?.trim()
  if (!content) {
    return NextResponse.json({ error: "La IA no devolvió texto." }, { status: 502 })
  }

  return NextResponse.json({ content })
}

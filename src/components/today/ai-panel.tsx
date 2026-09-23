"use client"

import { useEffect, useRef, useState } from "react"
import { SparklesIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const AI_KEY = "nexo.ai.key"

type ChatTurn = { role: "user" | "assistant"; content: string }

export function AiPanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [apiKey, setApiKey] = useState("")
  const [draft, setDraft] = useState("")
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState<ChatTurn[]>([])
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setApiKey(localStorage.getItem(AI_KEY) ?? "")
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
  }, [messages, open])

  const send = async () => {
    const text = draft.trim()
    if (!text || busy) return
    const history = [...messages, { role: "user" as const, content: text }]
    setMessages(history)
    setDraft("")
    setBusy(true)
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, apiKey }),
      })
      const json = (await response.json()) as { content?: string; error?: string }
      if (!response.ok || !json.content) {
        throw new Error(json.error || "No se pudo responder.")
      }
      setMessages([...history, { role: "assistant", content: json.content }])
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo hablar con la IA."
      )
      setMessages(messages)
      setDraft(text)
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Cerrar chat"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-popover text-popover-foreground shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-medium">
              <SparklesIcon className="size-4" />
              Chat de nexo
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Usá tu clave de OpenAI o Groq. No se guarda en un servidor.
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Cerrar">
            <XIcon />
          </Button>
        </header>
        <div className="border-b px-5 py-3">
          <Label htmlFor="ai-key">API key</Label>
          <Input
            id="ai-key"
            type="password"
            value={apiKey}
            placeholder="sk-... o gsk_..."
            className="mt-1.5"
            onChange={(event) => {
              const value = event.target.value
              setApiKey(value)
              localStorage.setItem(AI_KEY, value)
            }}
          />
        </div>
        <div ref={scroller} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Pedile un resumen, un mail, o ideas para el día.
            </p>
          ) : (
            messages.map((turn, index) => (
              <div
                key={`${turn.role}-${index}`}
                className={
                  turn.role === "user"
                    ? "ml-8 rounded-xl bg-primary/15 px-3 py-2 text-sm"
                    : "mr-8 rounded-xl bg-muted px-3 py-2 text-sm"
                }
              >
                {turn.content}
              </div>
            ))
          )}
        </div>
        <form
          className="border-t p-4"
          onSubmit={(event) => {
            event.preventDefault()
            void send()
          }}
        >
          <Textarea
            value={draft}
            placeholder="Escribí un mensaje…"
            className="mb-2 min-h-20 dark:bg-transparent"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                void send()
              }
            }}
          />
          <Button type="submit" className="w-full" disabled={busy || !draft.trim()}>
            {busy ? "Pensando…" : "Enviar"}
          </Button>
        </form>
      </aside>
    </div>
  )
}

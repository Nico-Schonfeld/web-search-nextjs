"use client"

import { useState } from "react"
import {
  CalendarPlusIcon,
  Clock3Icon,
  StickyNoteIcon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToday } from "@/hooks/use-today"
import { relativeWhen } from "@/lib/today/storage"

function defaultDateTime() {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 30, 0, 0)
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export function TodayBoard() {
  const { notes, setNotes, upcoming, nextEvent, addEvent, removeEvent } =
    useToday()
  const [title, setTitle] = useState("")
  const [start, setStart] = useState(defaultDateTime)

  return (
    <section className="mx-auto mb-6 grid w-full max-w-7xl gap-3 px-4 md:grid-cols-3">
      <Card size="sm" className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Clock3Icon className="size-4" />
            Próximo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nextEvent ? (
            <div>
              <p className="text-lg font-medium leading-snug">
                {nextEvent.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {relativeWhen(nextEvent.start)}
                {" · "}
                {new Date(nextEvent.start).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </p>
              {nextEvent.url ? (
                <a
                  href={nextEvent.url}
                  className="mt-3 inline-block text-sm text-primary hover:underline"
                >
                  Abrir enlace
                </a>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay reuniones cargadas. Agregá una en Agenda.
            </p>
          )}
        </CardContent>
      </Card>

      <Card size="sm" className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <CalendarPlusIcon className="size-4" />
            Agenda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form
            className="grid gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              addEvent(title, new Date(start).toISOString())
              setTitle("")
              setStart(defaultDateTime())
            }}
          >
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Standup, cliente, Meet…"
            />
            <div className="flex min-w-0 gap-2">
              <Input
                type="datetime-local"
                value={start}
                className="min-w-0 flex-1"
                onChange={(event) => setStart(event.target.value)}
              />
              <Button type="submit" size="sm" disabled={!title.trim()}>
                Sumar
              </Button>
            </div>
          </form>
          <ul className="max-h-36 space-y-1 overflow-y-auto">
            {upcoming.length === 0 ? (
              <li className="text-xs text-muted-foreground">
                Hoy está libre.
              </li>
            ) : (
              upcoming.slice(0, 6).map((event) => (
                <li
                  key={event.id}
                  className="flex items-center gap-2 rounded-lg px-1 py-1 text-sm"
                >
                  <span className="w-11 shrink-0 text-xs tabular-nums text-muted-foreground">
                    {new Date(event.start).toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{event.title}</span>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Quitar ${event.title}`}
                    onClick={() => removeEvent(event.id)}
                  >
                    <Trash2Icon className="size-3.5" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>

      <Card size="sm" className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <StickyNoteIcon className="size-4" />
            Notas del día
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Recordatorios, pendientes, ideas…"
            className="min-h-28 resize-none text-foreground dark:bg-transparent"
          />
        </CardContent>
      </Card>
    </section>
  )
}

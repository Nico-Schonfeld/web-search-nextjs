"use client"

import { useRef, useState } from "react"
import { BookmarkIcon, FileUpIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function ImportDialog({
  open,
  onOpenChange,
  onImport,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (file: File) => Promise<unknown>
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (nextFile = file) => {
    if (!nextFile) {
      toast.error("Elegí el HTML que exportó Chrome.")
      return
    }
    setBusy(true)
    try {
      await onImport(nextFile)
      toast.success("Favoritos importados. Ya podés ordenarlos a tu gusto.")
      setFile(null)
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos leer ese archivo."
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar favoritos de Chrome</DialogTitle>
          <DialogDescription>
            Chrome no deja leer la barra de marcadores desde una web. Exportalos
            una vez y Nexo arma las carpetas acá.
          </DialogDescription>
        </DialogHeader>
        <ol className="list-decimal space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li>
            Abrí{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 text-foreground">
              chrome://bookmarks
            </code>
          </li>
          <li>Menú ⋮ → Exportar marcadores</li>
          <li>Subí el archivo .html</li>
        </ol>
        <button
          type="button"
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-8 text-center transition-colors hover:bg-muted"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            const dropped = event.dataTransfer.files[0]
            if (dropped) setFile(dropped)
          }}
        >
          <span className="flex size-10 items-center justify-center rounded-lg bg-background ring-1 ring-foreground/10">
            {file ? (
              <BookmarkIcon className="size-4" />
            ) : (
              <FileUpIcon className="size-4" />
            )}
          </span>
          <span className="text-sm font-medium">
            {file ? file.name : "Arrastrá el HTML o hacé click"}
          </span>
          <span className="text-xs text-muted-foreground">
            Solo se guarda en este navegador
          </span>
        </button>
        <Input
          ref={inputRef}
          type="file"
          accept=".html,text/html"
          className="hidden"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancelar
          </Button>
          <Button onClick={() => submit()} disabled={busy}>
            {busy ? "Importando…" : "Crear mi inicio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

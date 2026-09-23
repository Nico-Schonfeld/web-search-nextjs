"use client"

import { useEffect } from "react"
import { RotateCcwIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useAppearance } from "@/components/theme/appearance-provider"
import { normalizeHex } from "@/lib/theme/apply"
import { THEME_PRESETS } from "@/lib/theme/presets"
import type { Appearance, WordmarkStyle } from "@/lib/theme/types"
import { cn } from "@/lib/utils"

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const hex = normalizeHex(value)
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          aria-label={label}
          className="size-8 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
          onChange={(event) => onChange(event.target.value)}
        />
        <Input
          value={hex}
          className="w-[5.8rem] font-mono text-xs uppercase"
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  )
}

export function CustomizePanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { appearance, setAppearance, selectPreset, resetPreset } = useAppearance()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const patch = (partial: Partial<Appearance>) => {
    setAppearance((current) => ({ ...current, ...partial }))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Cerrar personalización"
        onClick={onClose}
      />
      <aside
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-popover text-popover-foreground shadow-2xl"
        role="dialog"
        aria-labelledby="customize-title"
      >
        <header className="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 id="customize-title" className="text-base font-medium">
              Personalizar nexo
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Elegí un estilo y ajustá los colores. Se guarda en este navegador.
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Cerrar">
            <XIcon />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <section>
            <h3 className="mb-3 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Estilos
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {THEME_PRESETS.map((preset) => {
                const selected = appearance.preset === preset.preset
                return (
                  <button
                    key={preset.preset}
                    type="button"
                    onClick={() => selectPreset(preset.preset)}
                    className={cn(
                      "rounded-xl border p-2.5 text-left transition-colors",
                      selected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:bg-muted/60"
                    )}
                  >
                    <span className="mb-2 flex h-10 overflow-hidden rounded-lg">
                      {preset.swatches.map((color) => (
                        <span
                          key={color}
                          className="h-full flex-1"
                          style={{ background: color }}
                        />
                      ))}
                    </span>
                    <span className="block text-sm font-medium">{preset.name}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                      {preset.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                Colores
              </h3>
              <Button variant="ghost" size="xs" onClick={resetPreset}>
                <RotateCcwIcon />
                Reset
              </Button>
            </div>
            <ColorField
              label="Fondo"
              value={appearance.background}
              onChange={(background) => patch({ background })}
            />
            <ColorField
              label="Texto"
              value={appearance.foreground}
              onChange={(foreground) => patch({ foreground })}
            />
            <ColorField
              label="Tarjetas"
              value={appearance.card}
              onChange={(card) => patch({ card })}
            />
            <ColorField
              label="Acento"
              value={appearance.primary}
              onChange={(primary) => patch({ primary })}
            />
            <ColorField
              label="Buscador"
              value={appearance.searchBg}
              onChange={(searchBg) => patch({ searchBg })}
            />
            <ColorField
              label="Texto del buscador"
              value={appearance.searchFg}
              onChange={(searchFg) => patch({ searchFg })}
            />
          </section>

          <section className="mt-6 space-y-3">
            <h3 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Forma
            </h3>
            <div className="grid gap-1.5">
              <Label>Esquinas</Label>
              <ToggleGroup
                variant="outline"
                size="sm"
                spacing={0}
                value={[
                  appearance.radius <= 0.45
                    ? "0.35"
                    : appearance.radius >= 1
                      ? "1.15"
                      : "0.7",
                ]}
                onValueChange={(groupValue) => {
                  const next = Number(groupValue[0])
                  if (next) patch({ radius: next })
                }}
              >
                <ToggleGroupItem value="0.35">Rectas</ToggleGroupItem>
                <ToggleGroupItem value="0.7">Suaves</ToggleGroupItem>
                <ToggleGroupItem value="1.15">Redondas</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="grid gap-1.5">
              <Label>Logo</Label>
              <ToggleGroup
                variant="outline"
                size="sm"
                spacing={0}
                value={[appearance.wordmark]}
                onValueChange={(groupValue) => {
                  const next = groupValue[0]
                  if (next === "google" || next === "mono" || next === "gradient") {
                    patch({ wordmark: next as WordmarkStyle })
                  }
                }}
              >
                <ToggleGroupItem value="google">Colorido</ToggleGroupItem>
                <ToggleGroupItem value="mono">Sólido</ToggleGroupItem>
                <ToggleGroupItem value="gradient">Degradé</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </section>

          <section className="mt-6 space-y-3">
            <h3 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Accesos
            </h3>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Mostrar Gmail</span>
              <input
                type="checkbox"
                checked={appearance.showGmail}
                onChange={(event) => patch({ showGmail: event.target.checked })}
                className="size-4 accent-primary"
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Mostrar Imágenes</span>
              <input
                type="checkbox"
                checked={appearance.showImages}
                onChange={(event) => patch({ showImages: event.target.checked })}
                className="size-4 accent-primary"
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Reloj</span>
              <input
                type="checkbox"
                checked={appearance.showClock}
                onChange={(event) => patch({ showClock: event.target.checked })}
                className="size-4 accent-primary"
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Clima</span>
              <input
                type="checkbox"
                checked={appearance.showWeather}
                onChange={(event) => patch({ showWeather: event.target.checked })}
                className="size-4 accent-primary"
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Bloque Hoy</span>
              <input
                type="checkbox"
                checked={appearance.showToday}
                onChange={(event) => patch({ showToday: event.target.checked })}
                className="size-4 accent-primary"
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Apps de trabajo</span>
              <input
                type="checkbox"
                checked={appearance.showWorkApps}
                onChange={(event) => patch({ showWorkApps: event.target.checked })}
                className="size-4 accent-primary"
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Chat IA</span>
              <input
                type="checkbox"
                checked={appearance.showAi}
                onChange={(event) => patch({ showAi: event.target.checked })}
                className="size-4 accent-primary"
              />
            </label>
          </section>
        </div>
      </aside>
    </div>
  )
}

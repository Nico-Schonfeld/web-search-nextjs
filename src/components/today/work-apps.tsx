"use client"

import {
  CalendarDaysIcon,
  MessageCircleIcon,
  VideoIcon,
} from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const APPS = [
  {
    href: "https://web.whatsapp.com",
    label: "WhatsApp",
    icon: MessageCircleIcon,
  },
  {
    href: "https://calendar.google.com",
    label: "Calendar",
    icon: CalendarDaysIcon,
  },
  {
    href: "https://meet.google.com",
    label: "Meet",
    icon: VideoIcon,
  },
] as const

export function WorkApps() {
  return (
    <div className="flex items-center gap-0.5">
      {APPS.map((app) => (
        <Tooltip key={app.href}>
          <TooltipTrigger
            render={
              <a
                href={app.href}
                aria-label={app.label}
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              />
            }
          >
            <app.icon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>{app.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

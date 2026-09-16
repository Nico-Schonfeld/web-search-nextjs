import { cn } from "@/lib/utils"

const letters = [
  { char: "n", color: "text-[#8ab4f8]" },
  { char: "e", color: "text-[#f28b82]" },
  { char: "x", color: "text-[#fdd663]" },
  { char: "o", color: "text-[#81c995]" },
] as const

export function Wordmark({ className }: { className?: string }) {
  return (
    <h1
      className={cn(
        "select-none text-7xl font-normal tracking-tight sm:text-8xl",
        className
      )}
      aria-label="nexo"
    >
      {letters.map((letter) => (
        <span key={letter.char} className={letter.color}>
          {letter.char}
        </span>
      ))}
    </h1>
  )
}

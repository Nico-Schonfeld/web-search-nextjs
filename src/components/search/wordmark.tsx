import { cn } from "@/lib/utils"

const letters = [
  { char: "n", token: "--wordmark-1" },
  { char: "e", token: "--wordmark-2" },
  { char: "x", token: "--wordmark-3" },
  { char: "o", token: "--wordmark-4" },
] as const

export function Wordmark({
  className,
  variant = "google",
}: {
  className?: string
  variant?: "google" | "mono" | "gradient"
}) {
  return (
    <h1
      className={cn(
        "select-none text-7xl font-normal tracking-tight sm:text-8xl",
        variant === "mono" && "text-foreground",
        variant === "gradient" && "text-transparent",
        className
      )}
      style={
        variant === "gradient"
          ? {
              backgroundImage:
                "linear-gradient(90deg, var(--wordmark-1), var(--wordmark-2), var(--wordmark-3))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }
          : undefined
      }
      aria-label="nexo"
    >
      {variant === "google"
        ? letters.map((letter) => (
            <span key={letter.char} style={{ color: `var(${letter.token})` }}>
              {letter.char}
            </span>
          ))
        : "nexo"}
    </h1>
  )
}

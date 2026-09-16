import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"

import { Providers } from "@/components/providers"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "nexo — tu búsqueda, tus sitios",
  description:
    "Buscá en Google y tené tus favoritos de Chrome a un scroll, organizados como quieras.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Script
          id="nexo-appearance"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=JSON.parse(localStorage.getItem("nexo.appearance.v1")||"null");var dark=!t||t.mode!=="light";document.documentElement.classList.toggle("dark",dark);if(t){if(t.background)document.documentElement.style.setProperty("--background",t.background);if(t.foreground)document.documentElement.style.setProperty("--foreground",t.foreground);if(t.card)document.documentElement.style.setProperty("--card",t.card);if(t.primary)document.documentElement.style.setProperty("--primary",t.primary);if(t.searchBg)document.documentElement.style.setProperty("--search-bg",t.searchBg);if(t.searchFg)document.documentElement.style.setProperty("--search-fg",t.searchFg);if(t.radius)document.documentElement.style.setProperty("--radius",t.radius+"rem");}}catch(e){document.documentElement.classList.add("dark")}})();`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

import type { Metadata } from "next"
import { Navigation } from "@/components/academy/layout/Navigation"
import { Footer } from "@/components/academy/layout/Footer"
import "@/styles/globals.css"

export const metadata: Metadata = {
  title: {
    default: "Language Academy",
    template: "%s | Language Academy",
  },
  description:
    "A unified language academy for Spanish, Chinese, German, and Thai with shared lessons, vocabulary ladders, and reusable curriculum structure.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col relative z-[1]">
        <Navigation />
        <div className="h-[52px] sm:h-[72px]" />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

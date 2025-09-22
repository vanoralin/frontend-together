import type React from "react"
import type { Metadata } from "next"
import { Mali } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"

const mali = Mali({
  subsets: ["latin", "latin-ext", "thai"],
  variable: "--font-mali",
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={`font-sans ${mali.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}

<<<<<<< HEAD
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
=======
import type { Metadata } from "next";
import { Mitr } from "next/font/google";
import "./globals.css";

const mitr = Mitr({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});
>>>>>>> Wee

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
<<<<<<< HEAD
    <html lang="th">
      <body className={`font-sans ${mali.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
=======
    <html lang="en">
      <body
        className={`${mitr.className} text-[color:var(--color-theme-black)] h-screen w-screen bg-black flex items-center justify-center`}
      >
        {/* จอ mockup มือถือ */}
        <div className="relative aspect-[1170/2532] h-full w-[390px] bg-white rounded-xl shadow-lg">
          {/* phone bar */}
          <div className="absolute top-0 left-0 w-full z-50">
            <img
              src="/phone_bar.svg"
              alt="Phone bar"
              className="w-full h-auto"
            />
          </div>

          {/* เนื้อหาหลัก */}
          {children}
        </div>
>>>>>>> Wee
      </body>
    </html>
  )
}

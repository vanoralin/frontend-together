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
// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   return (
//     <html lang="th">
//       <body className={`font-sans ${mali.variable} text-[color:var(--color-theme-black)] h-screen w-screen bg-black flex`}>
//         <Suspense fallback={null}>
//           {/* จอ mockup มือถือ */}
//           <div className="relative aspect-[1170/2532] w-[390px] h-full bg-white overflow-hidden rounded-xl shadow-lg">
//             {/* phone bar */}
//             <div className="absolute top-0 left-0 w-full z-50">
//               <img src="/phone_bar.svg" alt="Phone Bar" className="w-full h-auto" />
//             </div>

//             {children}
//           </div>
//         </Suspense>
//       </body>
//     </html>
//   )
// }

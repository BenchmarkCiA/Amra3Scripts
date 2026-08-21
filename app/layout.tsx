import type { Metadata } from "next"
import { Inter, Heebo, Oswald } from "next/font/google"
import { headers } from "next/headers"
import "./globals.css"
import ChatWidget from "@/components/chat/ChatWidget"
import PopupWidget from "@/components/store/PopupWidget"
import { ConsentProvider } from "@/components/consent/ConsentProvider"
import ConsentBanner from "@/components/consent/ConsentBanner"
import ConsentScripts from "@/components/consent/ConsentScripts"
import type { ConsentMode } from "@/lib/consent/types"

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] })
const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin", "hebrew"],
  weight: ["300", "400", "500", "700", "800", "900"],
})
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
})

export const metadata: Metadata = {
  title: { default: "Store", template: "%s | Store" },
  description: "Premium products, delivered.",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers()
  const mode = (hdrs.get("x-consent-mode") ?? "notice") as ConsentMode
  const gpcFromHeader = hdrs.get("x-gpc") === "1"

  return (
    <html lang="he" className={`${inter.variable} ${heebo.variable} ${oswald.variable} h-full`}>
      <body className={`min-h-full flex flex-col antialiased ${heebo.variable} ${oswald.variable}`}>
        <ConsentProvider initialMode={mode} gpcFromHeader={gpcFromHeader}>
          {children}
          <ChatWidget />
          <PopupWidget />
          <ConsentBanner />
          <ConsentScripts />
        </ConsentProvider>
      </body>
    </html>
  )
}

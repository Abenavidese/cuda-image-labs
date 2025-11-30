import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navbar } from "@/components/navbar"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CUDA Image Lab - GPU-Accelerated Image Processing",
  description:
    "Professional GPU-powered image convolution with CUDA. Apply filters like blur, sobel, sharpen, and gaussian with real-time processing.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geist.className} antialiased min-h-screen bg-black text-foreground`}
      >
        {/* NAVBAR ÚNICO PARA TODA LA APP */}
        <Navbar />

        {/* Dejamos espacio para el navbar fijo (h-16) */}
        <div className="pt-16">
          {children}
        </div>

        <Analytics />
      </body>
    </html>
  )
}

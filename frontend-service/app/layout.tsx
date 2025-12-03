import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Financial Audit Intelligence Platform",
  description: "Advanced analytics, AI-powered insights, and comprehensive compliance monitoring for modern financial institutions",
  keywords: ["audit", "compliance", "data management", "visualization", "AI", "financial analytics"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${inter.className} h-full`}>
        {children}
      </body>
    </html>
  )
}

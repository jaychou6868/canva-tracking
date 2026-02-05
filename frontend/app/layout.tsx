import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Canva 追蹤系統 - MarketMax',
  description: '追蹤 Canva 簡報中的 CTA 點擊與二維碼掃描',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}

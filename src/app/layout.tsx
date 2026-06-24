import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'LaundryKu - Sistem Informasi Manajemen Laundry',
  description: 'Sistem manajemen laundry modern dengan fitur pemesanan, pelacakan pesanan real-time, dan QR code scanning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning className={`${outfit.variable}`}>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

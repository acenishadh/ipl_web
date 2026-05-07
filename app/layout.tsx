import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Rajdhani, Inter, Plus_Jakarta_Sans } from 'next/font/google'

const rajdhani = Rajdhani({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-rajdhani',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'IPL Arcade — Live auction & cricket rooms',
  description: 'Host or join real-time IPL-style auctions and pick-your-number cricket. Room codes, no sign-up, friends on any device.',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#070713' },
  ],
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}

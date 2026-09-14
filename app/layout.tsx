import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieConsent from '@/components/CookieConsent'
import './globals.css'
import './font-vars.css'
import './home-overrides.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const siteUrl = 'https://peakaxismu-github-io.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Peak Axis — Adventure without borders',
    template: '%s | Peak Axis Mauritius',
  },
  description: 'Peak Axis is a Mauritius adventure company running guided hikes, La Réunion volcano expeditions, team terrain days, and group activities.',
  applicationName: 'Peak Axis',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Peak Axis',
    title: 'Peak Axis — Adventure without borders',
    description: 'Guided hikes in Mauritius, volcano expeditions in La Réunion, and outdoor experiences built around real terrain.',
    url: siteUrl,
    locale: 'en_MU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peak Axis — Adventure without borders',
    description: 'Guided hikes in Mauritius, volcano expeditions in La Réunion, and outdoor experiences built around real terrain.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  )
}
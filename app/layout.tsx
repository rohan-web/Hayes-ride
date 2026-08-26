import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hayes & Ride — Private Hire & Airport Transfers',
  description: 'Premium private hire and airport transfers across London, with a booking experience designed around you.',
  applicationName: 'Hayes & Ride',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f4f1eb',
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-background"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}

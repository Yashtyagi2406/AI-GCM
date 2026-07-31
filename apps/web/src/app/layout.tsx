import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI-GCM | AI Governance & Cost Management',
  description: 'Enterprise AI governance, cost management, and compliance platform. Real-time visibility and control over all AI API spending.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 antialiased">{children}</body>
    </html>
  )
}

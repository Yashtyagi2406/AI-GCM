import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI-GCM — The Control Plane for Production AI',
  description:
    'AI-GCM gives organizations centralized control over AI costs, governance, security, and auditability through a proxy-native architecture with zero client-code changes.',
  keywords: [
    'AI governance',
    'AI proxy',
    'LLM cost management',
    'AI security',
    'DLP scanner',
    'OPA Rego policy',
    'audit trail',
    'ClickHouse analytics',
    'OpenAI proxy',
    'Anthropic Claude',
    'FinOps'
  ],
  authors: [{ name: 'AI-GCM Engineering' }],
  openGraph: {
    title: 'AI-GCM — The Control Plane for Production AI',
    description:
      'AI-GCM gives organizations centralized control over AI costs, governance, security, and auditability through a proxy-native architecture with zero client-code changes.',
    url: 'https://github.com/yashtyagi2406/AI-GCM',
    siteName: 'AI-GCM',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-GCM — The Control Plane for Production AI',
    description:
      'Govern AI usage, control costs, prevent data leaks, and maintain a complete audit trail — without changing your application code.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#030712] text-slate-100 antialiased selection:bg-violet-500/30 selection:text-white">
        {children}
      </body>
    </html>
  )
}

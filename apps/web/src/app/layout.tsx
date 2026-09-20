import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme/ThemeProvider'

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('ai-gcm-theme');
                var prefDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (saved === 'light' || (!saved && !prefDark)) {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-violet-500/30 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

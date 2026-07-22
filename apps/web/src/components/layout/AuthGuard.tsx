'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { Loader2 } from 'lucide-react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const token = useAppStore((s) => s.token)
  const user = useAppStore((s) => s.user)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && (!token || !user)) {
      router.push('/login')
    }
  }, [mounted, token, user, router])

  if (!mounted || (!token || !user)) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="text-violet-500 animate-spin" />
        <span className="text-sm font-medium text-slate-400">Loading AI-GCM...</span>
      </div>
    )
  }

  return <>{children}</>
}

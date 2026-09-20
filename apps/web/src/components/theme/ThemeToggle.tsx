'use client'

import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className={`w-8 h-8 rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 flex items-center justify-center ${className}`}
        disabled
      >
        <span className="w-4 h-4" />
      </button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`relative inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200 ${
        isDark
          ? 'border-white/10 bg-white/[0.04] text-amber-400 hover:bg-white/[0.08] hover:border-white/20'
          : 'border-slate-300/80 bg-slate-100/80 text-indigo-600 hover:bg-slate-200/80 hover:border-slate-400/80 shadow-sm'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun size={15} className="transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Moon size={15} className="transition-transform duration-300 -rotate-12 scale-100" />
        )}
      </div>
    </button>
  )
}

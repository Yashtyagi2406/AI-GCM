'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/components/theme/ThemeProvider'

export function AuraBackground() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setMousePos({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* 1. Precision Tech Grid */}
      <div className="absolute inset-0 bg-tech-mesh opacity-60 dark:opacity-40" />

      {/* 2. Interactive Mouse-following Soft Aura Glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-700 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          background: isDark
            ? 'radial-gradient(circle, rgba(139, 92, 246, 0.28) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139, 92, 246, 0.20) 0%, rgba(56, 189, 248, 0.12) 50%, transparent 70%)',
        }}
      />

      {/* 3. Luminous Laser Horizon Beam across the top */}
      <div className="absolute top-0 inset-x-0 flex justify-center">
        <div className="relative w-3/4 max-w-4xl h-[1px]">
          <div
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/60 to-transparent ${
              isDark ? 'via-violet-400/80' : 'via-violet-600/60'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent blur-[2px]" />
          <div className="absolute -top-1 inset-x-1/4 h-2 bg-violet-500/25 blur-md" />
        </div>
      </div>

      {/* 4. Smooth bottom fade to blend into subsequent sections */}
      <div
        className={`absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t ${
          isDark ? 'from-black/40' : 'from-slate-100/40'
        } to-transparent`}
      />
    </div>
  )
}

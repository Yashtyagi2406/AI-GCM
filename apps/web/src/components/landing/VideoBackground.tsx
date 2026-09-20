'use client'

import React from 'react'
import { useTheme } from '@/components/theme/ThemeProvider'

/**
 * VideoBackground — fixed full-viewport video wallpaper.
 * Sits behind every page section via `fixed inset-0 z-[-1]`.
 * Calibrated for high visibility and high contrast in both dark & light modes.
 */
export function VideoBackground() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none select-none overflow-hidden" aria-hidden="true">
      {/* Seamless looping background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/hero-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />

      {/* Adaptive contrast overlay: balances video visibility with text legibility */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, rgba(3, 7, 18, 0.70) 0%, rgba(3, 7, 18, 0.82) 100%)'
            : 'linear-gradient(180deg, rgba(248, 250, 252, 0.58) 0%, rgba(241, 245, 249, 0.70) 100%)',
        }}
      />
    </div>
  )
}

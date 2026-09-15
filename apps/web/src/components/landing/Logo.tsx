'use client'

import React from 'react'

export function Logo({ size = 28, showText = true, className = '' }: { size?: number; showText?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Minimal geometric infrastructure mark */}
      <div 
        className="relative flex items-center justify-center rounded-lg bg-slate-900 border border-white/15 p-1.5 shadow-md shadow-violet-500/10 group-hover:border-violet-500/40 transition-colors"
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-violet-400"
        >
          {/* Outer Gateway Shield */}
          <path 
            d="M12 2L3 6V12C3 17.5 7 21.5 12 22C17 21.5 21 17.5 21 12V6L12 2Z" 
            stroke="currentColor" 
            strokeWidth="1.75" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="opacity-70"
          />
          {/* Inner Central Routing Nexus Diamond */}
          <path 
            d="M12 7L16 11L12 15L8 11L12 7Z" 
            fill="currentColor"
            fillOpacity="0.25"
            stroke="#38bdf8" 
            strokeWidth="1.75" 
            strokeLinejoin="round" 
          />
          {/* Core Control Node */}
          <circle cx="12" cy="11" r="1.5" fill="#ffffff" />
          {/* Data Bus Pin */}
          <path 
            d="M12 15V18" 
            stroke="#a78bfa" 
            strokeWidth="1.75" 
            strokeLinecap="round" 
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-white font-mono text-base">
              AI<span className="text-violet-400">-</span>GCM
            </span>
            <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-slate-400 font-mono">
              v1.0
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium tracking-wide">
            Control Plane for Production AI
          </span>
        </div>
      )}
    </div>
  )
}

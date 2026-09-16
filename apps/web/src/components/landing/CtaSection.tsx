'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Github, Terminal } from 'lucide-react'
import { SpecularButton } from './SpecularButton'

export function CtaSection() {
  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-[#030712] via-slate-950 to-[#030712] relative overflow-hidden border-b border-white/[0.08]">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/25 bg-violet-500/10 text-violet-300 text-xs font-mono mb-6">
          <Terminal size={13} />
          <span>PRODUCTION-READY IN MINUTES</span>
        </div>

        {/* Headline */}
        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Put every AI request under control.
        </h2>

        {/* Supporting Copy */}
        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Govern usage. Control costs. Protect sensitive data. <br className="hidden sm:inline" />
          Audit every interaction without modifying your application codebase.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <SpecularButton
            href="/login"
            size="lg"
            radius={16}
            tint="#7c3aed"
            tintOpacity={0.9}
            blur={10}
            textColor="#ffffff"
            lineColor="#e9d5ff"
            baseColor="#581c87"
            intensity={1.3}
            shineSize={16}
            shineFade={45}
            thickness={1.5}
            speed={0.4}
            followMouse
            proximity={280}
            autoAnimate
            className="w-full sm:w-auto font-bold shadow-2xl shadow-violet-600/40"
          >
            <span>Get Started</span>
            <ArrowRight size={16} />
          </SpecularButton>

          <SpecularButton
            href="https://github.com/yashtyagi2406/AI-GCM"
            size="lg"
            radius={16}
            tint="#0f172a"
            tintOpacity={0.8}
            blur={10}
            textColor="#e2e8f0"
            lineColor="#94a3b8"
            baseColor="#1e293b"
            intensity={1.0}
            shineSize={14}
            shineFade={40}
            thickness={1.2}
            speed={0.35}
            followMouse
            proximity={250}
            className="w-full sm:w-auto font-semibold shadow-lg"
          >
            <Github size={16} />
            <span>View GitHub</span>
          </SpecularButton>
        </div>

        {/* Quick bash instruction */}
        <div className="mt-8 text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
          <span>Run locally:</span>
          <code className="px-2.5 py-1 rounded bg-black/60 border border-white/10 text-slate-300">
            docker compose -f infrastructure/docker/docker-compose.yml up
          </code>
        </div>

      </div>
    </section>
  )
}

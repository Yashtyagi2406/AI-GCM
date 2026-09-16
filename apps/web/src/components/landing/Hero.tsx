'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, ShieldCheck, Zap, Lock, Cpu, Database, 
  Activity, CheckCircle2, ChevronRight, Terminal, Copy, Check 
} from 'lucide-react'
import { Lightfall } from './Lightfall'
import { ScrollReveal } from './ScrollReveal'

export function Hero() {
  const [copied, setCopied] = useState(false)
  const curlCmd = 'curl https://ai-gcm.acme.corp/v1/chat/completions \\'

  const copyCmd = () => {
    navigator.clipboard.writeText('curl https://ai-gcm.yourcompany.com/v1/chat/completions -H "Authorization: Bearer aigcm_..."')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-grid-pattern">
      {/* Interactive Lightfall WebGL Canvas */}
      <div className="absolute top-0 left-0 right-0 h-[720px] pointer-events-auto overflow-hidden z-0">
        <Lightfall
          colors={['#38bdf8', '#818cf8', '#c084fc', '#60a5fa']}
          backgroundColor="#030712"
          speed={0.65}
          streakCount={4}
          streakWidth={1.1}
          streakLength={1.1}
          glow={0.85}
          density={0.55}
          twinkle={0.7}
          zoom={2.4}
          backgroundGlow={0.35}
          opacity={0.68}
          mouseInteraction={true}
          mouseStrength={0.8}
          mouseRadius={0.7}
        />
        {/* Top protection scrim for navbar clarity */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#030712] via-[#030712]/75 to-transparent pointer-events-none z-[1]" />
        {/* Center radial scrim so hero text has pristine contrast */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(3,7,18,0.78)_0%,_rgba(3,7,18,0.45)_55%,_transparent_100%)] pointer-events-none z-[1]" />
        {/* Soft bottom vignette to fade smoothly into the hero architecture diagram */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#030712] via-[#030712]/75 to-transparent pointer-events-none z-[1]" />
      </div>

      {/* Subtle radial ambient gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-violet-600/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[350px] bg-sky-500/10 blur-[110px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Eyebrow & Badges */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/35 bg-[#030712]/85 backdrop-blur-md mb-6 shadow-lg shadow-violet-950/40 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-[11px] font-mono font-semibold tracking-wider text-violet-300 uppercase">
              AI GOVERNANCE & COST CONTROL
            </span>
            <span className="text-slate-600 text-xs">|</span>
            <span className="text-[11px] font-mono text-slate-300">Proxy-Native &lt;3ms</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
            The control plane for <span className="gradient-accent">production AI.</span>
          </h1>

          {/* Supporting Copy */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-200 max-w-3xl leading-relaxed font-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            AI-GCM sits between your applications and AI providers to govern usage, control costs, prevent data leaks, and audit every AI request — <span className="text-white font-semibold">with zero client-code changes.</span>
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <Link
              href="/overview"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-xl shadow-violet-600/30 hover:shadow-violet-600/40 active:scale-95 transition-all"
            >
              <span>Start Building</span>
              <ArrowRight size={16} />
            </Link>

            <a
              href="#architecture"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 bg-slate-900/80 backdrop-blur-md hover:bg-slate-800/80 hover:border-white/25 text-slate-200 font-medium text-sm transition-all shadow-lg"
            >
              <span>Explore the Architecture</span>
              <ChevronRight size={16} className="text-slate-400" />
            </a>
          </div>

          {/* Credibility Line */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-300 font-mono bg-[#030712]/70 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm shadow-md">
            <span>Zero code changes</span>
            <span className="text-slate-600">·</span>
            <span>Multi-provider</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-semibold">Production-ready</span>
          </div>

          {/* Supported Providers List */}
          <div className="mt-4 text-[11px] text-slate-300 font-mono tracking-wide drop-shadow-sm">
            OpenAI · Anthropic · Gemini · Azure OpenAI · AWS Bedrock · Local LLMs
          </div>
        </div>

        {/* ── HERO VISUAL (Sophisticated Request-Path Architecture) ─────── */}
        <ScrollReveal delay={150} direction="up" className="mt-16 relative">
          
          {/* Outer Frame with Infrastructure Styling */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl p-5 sm:p-8 shadow-2xl shadow-black/80 relative overflow-hidden">
            
            {/* Header Micro Bar */}
            <div className="flex flex-wrap items-center justify-between pb-6 mb-6 border-b border-white/[0.08] gap-3">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                  <span className="text-slate-600">gateway://</span>
                  <span className="text-white font-medium">ai-gcm.internal.net:8080</span>
                </div>
              </div>

              {/* Real micro UI status badges */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  PROXY ONLINE
                </span>
                <span className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.04] border border-white/10 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  POLICY ACTIVE
                </span>
                <span className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.04] border border-white/10 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  DLP ACTIVE
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-violet-500/10 border border-violet-500/30 text-violet-300 font-bold">
                  &lt;3ms proxy overhead
                </span>
              </div>
            </div>

            {/* Architecture Flow Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* STAGE 1: Client Application (Cols 1-3) */}
              <div className="lg:col-span-3 flex flex-col gap-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
                  <span>Source Workload</span>
                  <span className="text-violet-400">In-Flight</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg relative group">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Terminal size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white font-mono">APP CLIENT</p>
                      <p className="text-[10px] text-slate-400">Production Services</p>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] font-mono text-slate-300 bg-black/40 p-2 rounded border border-white/5 space-y-1">
                    <div className="text-slate-500">{'// Standard OpenAI SDK'}</div>
                    <div className="text-emerald-400 font-medium">baseURL = &quot;ai-gcm/v1&quot;</div>
                    <div className="text-slate-400 text-[10px]">POST /chat/completions</div>
                  </div>

                  {/* Flow indicator */}
                  <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>HTTP/2 gRPC</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Encrypted TLS
                    </span>
                  </div>
                </div>

                {/* Animated Packet Pipeline (Desktop) */}
                <div className="hidden lg:flex items-center justify-center py-2 relative">
                  <div className="w-full h-0.5 bg-gradient-to-r from-blue-500/40 via-violet-500 to-violet-400 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-12 h-full bg-white shadow-[0_0_12px_#fff] animate-flow-horizontal" />
                  </div>
                  <span className="absolute text-[9px] font-mono text-violet-300 bg-slate-950 px-2 py-0.5 rounded border border-violet-500/30">
                    REQ #40921
                  </span>
                </div>
              </div>

              {/* STAGE 2: AI-GCM PROXY (Go Inline Core) (Cols 4-8) */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-violet-300 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                    AI-GCM PROXY (Go Hot Path)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 border border-violet-500/40 text-violet-300">
                    &lt;3ms latency budget
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-b from-violet-950/40 to-slate-900/90 border-2 border-violet-500/40 shadow-xl shadow-violet-500/10 relative">
                  
                  {/* Inline Steps Grid inside Proxy */}
                  <div className="grid grid-cols-2 gap-2.5">
                    
                    {/* 1. API Key Auth */}
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 hover:border-emerald-500/30 transition-colors">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>1. AUTH</span>
                        <CheckCircle2 size={11} className="text-emerald-400" />
                      </div>
                      <p className="text-xs font-semibold text-white">API Key Auth</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Redis cache lookup (0.3ms)</p>
                    </div>

                    {/* 2. DLP Scan */}
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 hover:border-violet-500/30 transition-colors">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>2. DLP SCAN</span>
                        <ShieldCheck size={11} className="text-violet-400" />
                      </div>
                      <p className="text-xs font-semibold text-white">In-Memory DLP</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Regex PII / Secrets check</p>
                    </div>

                    {/* 3. OPA Policy */}
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 hover:border-sky-500/30 transition-colors">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>3. GOVERNANCE</span>
                        <Cpu size={11} className="text-sky-400" />
                      </div>
                      <p className="text-xs font-semibold text-white">OPA Policy Engine</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Embedded Rego rules</p>
                    </div>

                    {/* 4. Budget Gate */}
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 hover:border-amber-500/30 transition-colors">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>4. BUDGET</span>
                        <Activity size={11} className="text-amber-400" />
                      </div>
                      <p className="text-xs font-semibold text-white">Budget Gate</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Team balance & limits</p>
                    </div>
                  </div>

                  {/* Forwarding Status Bar */}
                  <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Policy evaluation: <strong className="text-emerald-400">PASSED</strong>
                    </span>
                    <span className="text-violet-300">Total hot-path: 1.84ms</span>
                  </div>
                </div>

                {/* Secondary Async Pipeline Stream Indicator (Branching Out) */}
                <div className="mt-1 p-3 rounded-xl bg-slate-900/60 border border-dashed border-sky-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    <span className="text-[11px] font-mono font-medium text-sky-300">
                      Kafka Async Stream <span className="text-slate-500">(usage-events)</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded">
                    Zero latency impact on user
                  </span>
                </div>
              </div>

              {/* STAGE 3: AI Providers Downstream (Cols 9-12) */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
                  <span>Downstream Target</span>
                  <span className="text-emerald-400 font-mono">Direct Provider Route</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg space-y-2">
                  
                  {/* Provider Routing Rows */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-violet-500/30">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-violet-400" />
                      <span className="text-xs font-semibold text-white font-mono">Anthropic Claude</span>
                    </div>
                    <span className="text-[10px] font-mono text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded">
                      claude-3-5-sonnet
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 opacity-85">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-xs font-semibold text-slate-200 font-mono">OpenAI</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">gpt-4o / o1</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 opacity-85">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-semibold text-slate-200 font-mono">Google Gemini</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">gemini-2.0-flash</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-white/5">
                    <span>Azure · AWS Bedrock · LocalLLM</span>
                    <span className="text-emerald-400">Key Vault Active</span>
                  </div>
                </div>

                {/* Async Consumers List coming from Kafka */}
                <div className="p-3 rounded-xl bg-slate-950/90 border border-sky-500/20 text-[10px] font-mono space-y-1.5">
                  <div className="text-slate-400 flex items-center justify-between">
                    <span className="text-sky-400 font-bold">ASYNC TELEMETRY WORKERS</span>
                    <span className="text-slate-500">Go + Python</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/5">Cost Engine</span>
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/5">ClickHouse OLAP</span>
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/5">SHA-256 Audit</span>
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/5">Alerts</span>
                    <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">ML Anomaly</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Proof Quote Box */}
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Architecture Insight:</span>
                <span className="text-slate-200">The proxy never writes to analytics DBs on the hot path.</span>
              </div>
              <div className="flex items-center gap-2 text-violet-300">
                <span>Kafka decouples telemetry → 100% fast response time</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}

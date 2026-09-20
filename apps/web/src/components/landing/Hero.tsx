'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, ShieldCheck, Zap, Lock, Cpu, Database, 
  Activity, CheckCircle2, ChevronRight, Terminal, Copy, Check 
} from 'lucide-react'
import { AuraBackground } from './AuraBackground'
import { ScrollReveal } from './ScrollReveal'
import { SpecularButton } from './SpecularButton'
import { useTheme } from '@/components/theme/ThemeProvider'
import {
  OpenAILogo,
  AnthropicLogo,
  GoogleGeminiLogo,
  AzureOpenAILogo,
  AWSBedrockLogo,
} from './ProviderLogos'

export function Hero() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [copied, setCopied] = useState(false)
  const curlCmd = 'curl https://ai-gcm.acme.corp/v1/chat/completions \\'

  const copyCmd = () => {
    navigator.clipboard.writeText('curl https://ai-gcm.yourcompany.com/v1/chat/completions -H "Authorization: Bearer aigcm_..."')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Aesthetic Cosmic Aurora & Tech Grid Background Effect */}
      <AuraBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Eyebrow & Badges */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border dark:border-violet-500/40 border-violet-400/40 dark:bg-[#030712]/90 bg-white/95 backdrop-blur-md mb-6 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-violet-600 dark:bg-violet-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-violet-700 dark:text-violet-300 uppercase">
              AI GOVERNANCE & COST CONTROL
            </span>
            <span className="text-slate-400 dark:text-slate-600 text-xs">|</span>
            <span className="text-[11px] font-mono font-semibold text-slate-800 dark:text-slate-200">Proxy-Native &lt;3ms</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 dark:text-white max-w-4xl leading-[1.08] dark:drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] drop-shadow-sm">
            The control plane for <span className="gradient-accent">production AI.</span>
          </h1>

          {/* Supporting Copy */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-700 dark:text-slate-200 max-w-3xl leading-relaxed font-normal">
            AI-GCM sits between your applications and AI providers to govern usage, control costs, prevent data leaks, and audit every AI request — <span className="text-slate-950 dark:text-white font-bold">with zero client-code changes.</span>
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <SpecularButton
              href="/login"
              size="md"
              radius={14}
              tint="#7c3aed"
              tintOpacity={0.85}
              blur={8}
              textColor="#ffffff"
              lineColor="#c084fc"
              baseColor="#4c1d95"
              intensity={1.2}
              shineSize={14}
              shineFade={42}
              thickness={1.5}
              speed={0.35}
              followMouse
              proximity={260}
              autoAnimate
              className="w-full sm:w-auto font-semibold shadow-xl shadow-violet-600/30"
            >
              <span>Start Building</span>
              <ArrowRight size={16} />
            </SpecularButton>

            <SpecularButton
              href="#architecture"
              size="md"
              radius={14}
              tint={isDark ? '#0f172a' : '#f1f5f9'}
              tintOpacity={0.8}
              blur={8}
              textColor={isDark ? '#e2e8f0' : '#0f172a'}
              lineColor={isDark ? '#38bdf8' : '#6366f1'}
              baseColor={isDark ? '#1e293b' : '#e2e8f0'}
              intensity={1.0}
              shineSize={12}
              shineFade={40}
              thickness={1.2}
              speed={0.35}
              followMouse
              proximity={220}
              className="w-full sm:w-auto font-medium shadow-lg"
            >
              <span>Explore the Architecture</span>
              <ChevronRight size={16} className="text-slate-400" />
            </SpecularButton>
          </div>

          {/* Credibility Line */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-700 dark:text-slate-300 font-mono dark:bg-[#030712]/80 bg-white/95 px-4 py-1.5 rounded-full border dark:border-white/10 border-slate-300 backdrop-blur-sm shadow-md">
            <span className="font-semibold text-slate-900 dark:text-slate-200">Zero code changes</span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">Multi-provider</span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Production-ready
            </span>
          </div>

          {/* Supported Providers List with Logos */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-1.5"><OpenAILogo className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />OpenAI</span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span className="flex items-center gap-1.5"><AnthropicLogo className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />Anthropic</span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span className="flex items-center gap-1.5"><GoogleGeminiLogo className="w-3.5 h-3.5" />Gemini</span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span className="flex items-center gap-1.5"><AzureOpenAILogo className="w-3.5 h-3.5" />Azure OpenAI</span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span className="flex items-center gap-1.5"><AWSBedrockLogo className="w-3.5 h-3.5" />AWS Bedrock</span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span>Local LLMs</span>
          </div>
        </div>

        {/* ── HERO VISUAL (Sophisticated Request-Path Architecture) ─────── */}
        <ScrollReveal delay={150} direction="up" className="mt-16 relative">
          
          {/* Outer Frame with Infrastructure Styling */}
          <div className="rounded-2xl border dark:border-white/10 border-slate-300 dark:bg-slate-950/85 bg-white/95 backdrop-blur-xl p-5 sm:p-8 shadow-2xl dark:shadow-black/80 shadow-slate-400/20 relative overflow-hidden">
            
            {/* Header Micro Bar */}
            <div className="flex flex-wrap items-center justify-between pb-6 mb-6 border-b dark:border-white/[0.08] border-slate-200 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-xs font-mono flex items-center gap-2">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">gateway://</span>
                  <span className="text-slate-950 dark:text-white font-bold">ai-gcm.internal.net:8080</span>
                </div>
              </div>

              {/* High-visibility micro UI status badges */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] font-mono font-bold">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                  PROXY ONLINE
                </span>
                <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-100 dark:bg-sky-500/15 border border-sky-300 dark:border-sky-500/30 text-sky-800 dark:text-sky-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-sky-400" />
                  POLICY ACTIVE
                </span>
                <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-100 dark:bg-violet-500/15 border border-violet-300 dark:border-violet-500/30 text-violet-800 dark:text-violet-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400" />
                  DLP ACTIVE
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-500/40 text-purple-800 dark:text-purple-300 font-extrabold">
                  &lt;3ms proxy overhead
                </span>
              </div>
            </div>

            {/* Architecture Flow Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* STAGE 1: Client Application (Cols 1-3) */}
              <div className="lg:col-span-3 flex flex-col gap-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center justify-between">
                  <span>Source Workload</span>
                  <span className="text-violet-700 dark:text-violet-400 font-bold">In-Flight</span>
                </div>

                <div className="p-4 rounded-xl dark:bg-slate-900/90 bg-white border dark:border-white/10 border-slate-200 shadow-md relative group">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Terminal size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-950 dark:text-white font-mono">APP CLIENT</p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Production Services</p>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] font-mono text-slate-800 dark:text-slate-200 dark:bg-black/50 bg-slate-50 p-2.5 rounded border dark:border-white/5 border-slate-200 space-y-1">
                    <div className="text-slate-500">{'// Standard OpenAI SDK'}</div>
                    <div className="text-emerald-700 dark:text-emerald-400 font-bold">baseURL = &quot;ai-gcm/v1&quot;</div>
                    <div className="text-slate-600 dark:text-slate-400 text-[10px]">POST /chat/completions</div>
                  </div>

                  {/* Flow indicator */}
                  <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-600 dark:text-slate-400 font-medium">
                    <span>HTTP/2 gRPC</span>
                    <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Encrypted TLS
                    </span>
                  </div>
                </div>

                {/* Animated Packet Pipeline (Desktop) */}
                <div className="hidden lg:flex items-center justify-center py-2 relative">
                  <div className="w-full h-0.5 bg-gradient-to-r from-blue-500/40 via-violet-500 to-violet-400 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-12 h-full bg-white shadow-[0_0_12px_#fff] animate-flow-horizontal" />
                  </div>
                  <span className="absolute text-[9px] font-mono text-violet-700 dark:text-violet-300 dark:bg-slate-950 bg-white px-2 py-0.5 rounded border dark:border-violet-500/30 border-violet-300 shadow-sm font-bold">
                    REQ #40921
                  </span>
                </div>
              </div>

              {/* STAGE 2: AI-GCM PROXY (Go Inline Core) (Cols 4-8) */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-violet-800 dark:text-violet-300 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400 animate-ping" />
                    AI-GCM PROXY (Go Hot Path)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-500/20 border border-violet-300 dark:border-violet-500/40 text-violet-800 dark:text-violet-300 font-bold">
                    &lt;3ms latency budget
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-b dark:from-violet-950/40 dark:to-slate-900/90 from-violet-50/90 to-slate-50 border-2 dark:border-violet-500/40 border-violet-400/40 shadow-xl dark:shadow-violet-500/10 relative">
                  
                  {/* Inline Steps Grid inside Proxy */}
                  <div className="grid grid-cols-2 gap-2.5">
                    
                    {/* 1. API Key Auth */}
                    <div className="p-2.5 rounded-lg dark:bg-black/50 bg-white border dark:border-white/10 border-slate-200 shadow-sm hover:border-emerald-500/40 transition-colors">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">
                        <span>1. AUTH</span>
                        <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-xs font-bold text-slate-950 dark:text-white">API Key Auth</p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">Redis cache (0.3ms)</p>
                    </div>

                    {/* 2. DLP Scan */}
                    <div className="p-2.5 rounded-lg dark:bg-black/50 bg-white border dark:border-white/10 border-slate-200 shadow-sm hover:border-violet-500/40 transition-colors">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">
                        <span>2. DLP SCAN</span>
                        <ShieldCheck size={12} className="text-violet-600 dark:text-violet-400" />
                      </div>
                      <p className="text-xs font-bold text-slate-950 dark:text-white">In-Memory DLP</p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">PII / Secrets scan</p>
                    </div>

                    {/* 3. OPA Policy */}
                    <div className="p-2.5 rounded-lg dark:bg-black/50 bg-white border dark:border-white/10 border-slate-200 shadow-sm hover:border-sky-500/40 transition-colors">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">
                        <span>3. GOVERNANCE</span>
                        <Cpu size={12} className="text-sky-600 dark:text-sky-400" />
                      </div>
                      <p className="text-xs font-bold text-slate-950 dark:text-white">OPA Policy Engine</p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">Embedded Rego rules</p>
                    </div>

                    {/* 4. Budget Gate */}
                    <div className="p-2.5 rounded-lg dark:bg-black/50 bg-white border dark:border-white/10 border-slate-200 shadow-sm hover:border-amber-500/40 transition-colors">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">
                        <span>4. BUDGET</span>
                        <Activity size={12} className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <p className="text-xs font-bold text-slate-950 dark:text-white">Budget Gate</p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">Team balance & limits</p>
                    </div>
                  </div>

                  {/* Forwarding Status Bar */}
                  <div className="mt-3.5 pt-3 border-t dark:border-white/[0.08] border-slate-200 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Policy evaluation: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">PASSED</strong>
                    </span>
                    <span className="text-violet-700 dark:text-violet-300 font-bold">Total hot-path: 1.84ms</span>
                  </div>
                </div>

                {/* Secondary Async Pipeline Stream Indicator (Branching Out) */}
                <div className="mt-1 p-3 rounded-xl dark:bg-slate-900/80 bg-white border border-dashed dark:border-sky-500/30 border-sky-400/60 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                    <span className="text-[11px] font-mono font-bold text-sky-700 dark:text-sky-300">
                      Kafka Async Stream <span className="text-slate-500 dark:text-slate-400 font-normal">(usage-events)</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300 dark:bg-white/[0.05] bg-slate-100 px-2 py-0.5 rounded border dark:border-transparent border-slate-200 font-semibold">
                    Zero latency impact on user
                  </span>
                </div>
              </div>

              {/* STAGE 3: AI Providers Downstream (Cols 9-12) */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold flex items-center justify-between">
                  <span>Downstream Target</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">Direct Provider Route</span>
                </div>

                <div className="p-4 rounded-xl dark:bg-slate-900/90 bg-white border dark:border-white/10 border-slate-200 shadow-md space-y-2">
                  
                  {/* Provider Routing Rows with Logos */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg dark:bg-black/50 bg-slate-50 border dark:border-violet-500/30 border-violet-400/40 shadow-xs">
                    <div className="flex items-center gap-2">
                      <AnthropicLogo className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-bold text-slate-950 dark:text-white font-mono">Anthropic Claude</span>
                    </div>
                    <span className="text-[10px] font-mono text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-500/15 border border-violet-300 dark:border-violet-500/30 px-1.5 py-0.5 rounded font-bold">
                      claude-3-5-sonnet
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg dark:bg-black/40 bg-slate-50/80 border dark:border-white/5 border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2">
                      <OpenAILogo className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 font-mono">OpenAI</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 font-medium">gpt-4o / o1</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg dark:bg-black/40 bg-slate-50/80 border dark:border-white/5 border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2">
                      <GoogleGeminiLogo className="w-4 h-4" />
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 font-mono">Google Gemini</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 font-medium">gemini-2.0-flash</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-600 dark:text-slate-400 border-t dark:border-white/5 border-slate-200 font-medium">
                    <span>Azure · AWS Bedrock · LocalLLM</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Key Vault Active</span>
                  </div>
                </div>

                {/* Async Consumers List coming from Kafka */}
                <div className="p-3 rounded-xl dark:bg-slate-950/90 bg-white border dark:border-sky-500/20 border-slate-200 shadow-sm text-[10px] font-mono space-y-1.5">
                  <div className="text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span className="text-sky-700 dark:text-sky-400 font-bold">ASYNC TELEMETRY WORKERS</span>
                    <span className="text-slate-500 font-medium">Go + Python</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded dark:bg-white/[0.05] bg-slate-100 dark:text-slate-300 text-slate-800 border dark:border-white/5 border-slate-200 font-semibold">Cost Engine</span>
                    <span className="px-2 py-0.5 rounded dark:bg-white/[0.05] bg-slate-100 dark:text-slate-300 text-slate-800 border dark:border-white/5 border-slate-200 font-semibold">ClickHouse OLAP</span>
                    <span className="px-2 py-0.5 rounded dark:bg-white/[0.05] bg-slate-100 dark:text-slate-300 text-slate-800 border dark:border-white/5 border-slate-200 font-semibold">SHA-256 Audit</span>
                    <span className="px-2 py-0.5 rounded dark:bg-white/[0.05] bg-slate-100 dark:text-slate-300 text-slate-800 border dark:border-white/5 border-slate-200 font-semibold">Alerts</span>
                    <span className="px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-500/10 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-500/20 font-bold">ML Anomaly</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Proof Quote Box */}
            <div className="mt-6 pt-4 border-t dark:border-white/[0.06] border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300">Architecture Insight:</span>
                <span className="text-slate-900 dark:text-slate-200 font-medium">The proxy never writes to analytics DBs on the hot path.</span>
              </div>
              <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 font-bold">
                <span>Kafka decouples telemetry → 100% fast response time</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}

'use client'

import React, { useState } from 'react'
import { Check, ArrowRight, Layers, Sparkles, Terminal, Copy } from 'lucide-react'

export function DifferentiatorSection() {
  const [copied, setCopied] = useState(false)

  const afterCode = `import OpenAI from 'openai'

// Zero client-code changes: just point baseURL at AI-GCM
const client = new OpenAI({
  apiKey: process.env.AIGCM_API_KEY,
  baseURL: "https://ai-gcm.yourcompany.com/v1"
})

// Standard completion calls work seamlessly
const response = await client.chat.completions.create({
  model: "claude-3-5-sonnet", // Or gpt-4o, gemini-2.0-flash
  messages: [{ role: "user", content: "Analyze Q3 financial risks" }]
})`

  return (
    <section id="differentiator" className="py-24 sm:py-32 bg-slate-950/40 relative border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-violet-500/25 bg-violet-500/10 text-violet-400 text-xs font-mono mb-4">
            <Layers size={13} />
            <span>DROP-IN REVERSE PROXY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Zero code changes. <br className="hidden sm:block" />Full AI governance.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Same SDK. Same API semantics. New governance layer. <br className="hidden sm:inline" />
            No SDK migrations or application rewrites required.
          </p>
        </div>

        {/* Architecture Comparison Diagram */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* BEFORE CARD */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                  BEFORE AI-GCM
                </span>
                <span className="text-xs font-mono text-red-400 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                  Unmonitored & Direct
                </span>
              </div>

              {/* Diagram */}
              <div className="py-6 flex items-center justify-around font-mono text-xs text-slate-300">
                <div className="px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-center">
                  Application
                </div>
                <div className="flex items-center text-slate-500">
                  <span className="w-8 sm:w-16 h-0.5 bg-slate-700" />
                  <ArrowRight size={14} className="text-slate-500 -ml-1" />
                </div>
                <div className="px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-center">
                  OpenAI / Claude
                </div>
              </div>

              {/* Code Snippet */}
              <div className="mt-4 rounded-xl bg-slate-950 border border-white/10 p-4 font-mono text-xs text-slate-400">
                <p className="text-slate-600 mb-2">{'// Direct point-to-point connection'}</p>
                <div className="text-slate-300">
                  <span className="text-violet-400">const</span> client = <span className="text-violet-400">new</span> OpenAI(&#123;
                </div>
                <div className="pl-4 text-slate-400">
                  apiKey: process.env.OPENAI_API_KEY,
                </div>
                <div className="pl-4 text-red-400/80 line-through">
                  baseURL: &quot;https://api.openai.com/v1&quot;
                </div>
                <div className="text-slate-300">&#125;)</div>
              </div>

              {/* Drawbacks */}
              <div className="mt-6 space-y-2 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-red-500 font-bold">✕</span> No central budget guardrails
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-red-500 font-bold">✕</span> Unchecked prompt egress & PII leaks
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-red-500 font-bold">✕</span> Zero tamper-evident audit history
                </div>
              </div>
            </div>
          </div>

          {/* AFTER CARD */}
          <div className="p-6 sm:p-8 rounded-2xl border-2 border-violet-500/40 bg-gradient-to-b from-violet-950/20 to-slate-900/80 backdrop-blur-md flex flex-col justify-between shadow-xl shadow-violet-500/10">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-violet-500/20">
                <span className="text-xs font-mono uppercase tracking-widest text-violet-300 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  AFTER AI-GCM
                </span>
                <span className="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 font-semibold">
                  Governed & Protected (&lt;3ms)
                </span>
              </div>

              {/* Diagram */}
              <div className="py-6 flex items-center justify-around font-mono text-xs">
                <div className="px-3.5 py-2 rounded-lg bg-slate-900 border border-white/10 text-white font-medium">
                  Application
                </div>
                <div className="flex items-center text-violet-400">
                  <span className="w-5 sm:w-10 h-0.5 bg-violet-500" />
                  <ArrowRight size={14} className="text-violet-400 -ml-1" />
                </div>
                <div className="px-3.5 py-2 rounded-lg bg-violet-600/30 border border-violet-500/50 text-violet-200 font-bold shadow-lg shadow-violet-500/20">
                  AI-GCM Proxy
                </div>
                <div className="flex items-center text-violet-400">
                  <span className="w-5 sm:w-10 h-0.5 bg-violet-500" />
                  <ArrowRight size={14} className="text-violet-400 -ml-1" />
                </div>
                <div className="px-3.5 py-2 rounded-lg bg-slate-900 border border-white/10 text-white font-medium">
                  AI Providers
                </div>
              </div>

              {/* Code Snippet */}
              <div className="mt-4 rounded-xl bg-slate-950 border border-violet-500/30 p-4 font-mono text-xs text-slate-300 relative group">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(afterCode)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-md bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  title="Copy snippet"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
                <p className="text-violet-400/80 mb-2">{'// 1-line configuration change in your env'}</p>
                <div>
                  <span className="text-violet-400">const</span> client = <span className="text-violet-400">new</span> OpenAI(&#123;
                </div>
                <div className="pl-4 text-emerald-300 font-medium">
                  apiKey: process.env.AIGCM_API_KEY,
                </div>
                <div className="pl-4 text-emerald-300 font-medium bg-emerald-500/10 -mx-2 px-2 py-0.5 rounded border-l-2 border-emerald-400">
                  baseURL: &quot;https://ai-gcm.yourcompany.com/v1&quot;
                </div>
                <div>&#125;)</div>
              </div>

              {/* Checklist */}
              <div className="mt-6 grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</span>
                  <span>Cost tracking</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</span>
                  <span>In-memory DLP</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</span>
                  <span>OPA Policy enforcement</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</span>
                  <span>Real-time budget gate</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</span>
                  <span>SHA-256 HMAC audit</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</span>
                  <span>Sub-50ms ClickHouse OLAP</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

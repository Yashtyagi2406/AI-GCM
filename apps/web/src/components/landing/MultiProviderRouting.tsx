'use client'

import React from 'react'
import { Network, ArrowDown, Cpu, ShieldCheck } from 'lucide-react'

export function MultiProviderRouting() {
  return (
    <section className="py-24 sm:py-32 bg-slate-950/40 relative border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-violet-500/25 bg-violet-500/10 text-violet-400 text-xs font-mono mb-4">
            <Network size={13} />
            <span>UNIFIED ROUTING GATEWAY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            One gateway. Every model.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Stop building redundant security filters, budget trackers, and logging systems for every separate provider SDK.
          </p>
        </div>

        {/* Visual Multi-Route Tree */}
        <div className="mt-16 max-w-4xl mx-auto p-6 sm:p-10 rounded-2xl border border-white/10 bg-[#080d17] shadow-2xl">
          
          {/* Top: Application Workloads */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md p-3.5 rounded-xl bg-slate-900 border border-white/10 text-center font-mono text-xs shadow-md">
              <span className="text-slate-400 font-bold block">ALL APPLICATION WORKLOADS</span>
              <span className="text-slate-300 text-[11px]">Backend Services · Internal AI Agents · Web Apps · Batch Workers</span>
            </div>

            <div className="py-4 flex flex-col items-center text-violet-400">
              <div className="w-0.5 h-6 bg-gradient-to-b from-slate-600 to-violet-500" />
              <ArrowDown size={14} className="-mt-1" />
            </div>
          </div>

          {/* Center: AI-GCM Proxy Nexus */}
          <div className="max-w-lg mx-auto p-5 rounded-2xl border-2 border-violet-500/50 bg-violet-950/30 text-center font-mono relative shadow-xl shadow-violet-500/10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold uppercase mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Central Control Plane
            </div>
            <h4 className="text-sm font-bold text-white">AI-GCM TRANSPARENT PROXY</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Uniform DLP · Central OPA Policies · Hard Budget Caps · SHA-256 Audit Chain
            </p>
          </div>

          {/* Tree Branches downwards */}
          <div className="py-4 flex flex-col items-center text-violet-400">
            <div className="w-0.5 h-6 bg-gradient-to-b from-violet-500 to-slate-600" />
            <ArrowDown size={14} className="-mt-1" />
          </div>

          {/* Target Model Endpoints */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-center hover:border-violet-500/30 transition-all">
              <div className="w-2 h-2 rounded-full bg-violet-400 mx-auto mb-2" />
              <p className="text-white font-bold">Anthropic</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Claude 3.5 Sonnet / Opus / Haiku</p>
              <span className="text-[9px] text-violet-300 mt-2 block bg-violet-500/10 py-0.5 rounded">Standard Completions</span>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-center hover:border-blue-500/30 transition-all">
              <div className="w-2 h-2 rounded-full bg-blue-400 mx-auto mb-2" />
              <p className="text-white font-bold">OpenAI</p>
              <p className="text-[10px] text-slate-400 mt-0.5">GPT-4o / o1 / o3-mini</p>
              <span className="text-[9px] text-blue-300 mt-2 block bg-blue-500/10 py-0.5 rounded">Reasoning &amp; Chat</span>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-center hover:border-emerald-500/30 transition-all">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mx-auto mb-2" />
              <p className="text-white font-bold">Google Gemini</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Gemini 2.0 Flash / 1.5 Pro</p>
              <span className="text-[9px] text-emerald-300 mt-2 block bg-emerald-500/10 py-0.5 rounded">Multimodal Gateway</span>
            </div>

          </div>

          {/* Bottom Secondary Targets */}
          <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center text-slate-400 font-mono text-xs flex flex-wrap items-center justify-center gap-3">
            <span>Also seamlessly routes to:</span>
            <span className="text-slate-200 font-semibold">Azure OpenAI</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-200 font-semibold">AWS Bedrock</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-200 font-semibold">Ollama &amp; vLLM (Self-Hosted)</span>
          </div>

        </div>

      </div>
    </section>
  )
}

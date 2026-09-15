'use client'

import React from 'react'
import { Server, Database, Activity, Cpu, ShieldCheck, ArrowDown, ArrowRight, Zap } from 'lucide-react'

export function ArchitectureDeepDive() {
  return (
    <section id="architecture" className="py-24 sm:py-32 bg-[#030712] relative border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-violet-500/25 bg-violet-500/10 text-violet-400 text-xs font-mono mb-4">
            <Server size={13} />
            <span>SYSTEM ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Built like infrastructure. <br />Not glued together like a dashboard.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            The AI-GCM engine separates high-throughput inline request enforcement from asynchronous data ingestion, guaranteeing sub-3ms overhead.
          </p>
        </div>

        {/* Technical Architecture Canvas */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-slate-950/80 p-6 sm:p-10 shadow-2xl space-y-10">
          
          {/* LAYER 1: CLIENTS */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl p-4 rounded-xl bg-slate-900/90 border border-white/10 text-center font-mono text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
                CLIENT APPLICATIONS &amp; MICROSERVICES
              </span>
              <span className="text-slate-300">
                Python SDK · Node.js / Next.js · Go Services · LangChain · LlamaIndex · Raw HTTP
              </span>
            </div>

            <div className="py-3 flex flex-col items-center text-violet-400">
              <div className="w-0.5 h-6 bg-gradient-to-b from-slate-600 to-violet-500" />
              <ArrowDown size={14} className="-mt-1" />
              <span className="text-[10px] font-mono text-slate-500 mt-0.5">TLS / HTTP/2 Request</span>
            </div>
          </div>

          {/* LAYER 2: HOT PATH PROXY (Go) */}
          <div className="p-6 rounded-2xl border-2 border-violet-500/40 bg-gradient-to-b from-violet-950/30 to-slate-900/90 relative">
            <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-white/10 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-sm font-bold text-white font-mono">
                  INLINE AI PROXY (Go Service)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Target Overhead: &lt;3ms
                </span>
                <span className="text-slate-500">In-Memory Engine</span>
              </div>
            </div>

            {/* In-Memory Steps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
              
              <div className="p-3 rounded-lg bg-black/50 border border-white/10">
                <p className="text-[10px] text-slate-400">STEP 1</p>
                <p className="text-white font-bold mt-0.5">API Key Auth</p>
                <p className="text-[10px] text-slate-400 mt-1">Redis token cache</p>
              </div>

              <div className="p-3 rounded-lg bg-black/50 border border-white/10">
                <p className="text-[10px] text-slate-400">STEP 2</p>
                <p className="text-white font-bold mt-0.5">In-Memory DLP</p>
                <p className="text-[10px] text-slate-400 mt-1">Compiled regex rules</p>
              </div>

              <div className="p-3 rounded-lg bg-black/50 border border-white/10">
                <p className="text-[10px] text-slate-400">STEP 3</p>
                <p className="text-white font-bold mt-0.5">OPA Policy Engine</p>
                <p className="text-[10px] text-slate-400 mt-1">Embedded Rego evaluation</p>
              </div>

              <div className="p-3 rounded-lg bg-black/50 border border-white/10">
                <p className="text-[10px] text-slate-400">STEP 4</p>
                <p className="text-white font-bold mt-0.5">Budget Gate</p>
                <p className="text-[10px] text-slate-400 mt-1">Atomic Redis balance</p>
              </div>

              <div className="p-3 rounded-lg bg-black/50 border border-emerald-500/30">
                <p className="text-[10px] text-emerald-400">STEP 5</p>
                <p className="text-white font-bold mt-0.5">Provider Routing</p>
                <p className="text-[10px] text-slate-400 mt-1">AES-256 Vault injected</p>
              </div>

            </div>

            {/* Hot Path Routing Fork */}
            <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between text-xs font-mono gap-2">
              <span className="text-emerald-400 flex items-center gap-1">
                <ArrowRight size={13} /> Direct forward to downstream model provider
              </span>
              <span className="text-sky-300 flex items-center gap-1">
                <ArrowDown size={13} /> Async fire-and-forget to Kafka bus
              </span>
            </div>
          </div>

          {/* LAYER 3: DOWNSTREAM AI PROVIDERS */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 text-center font-mono text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-2">
              TARGET AI PROVIDERS (Upstream API)
            </span>
            <div className="flex flex-wrap justify-center gap-3 text-slate-200">
              <span className="px-3 py-1 rounded bg-black/40 border border-white/10">OpenAI</span>
              <span className="px-3 py-1 rounded bg-black/40 border border-white/10">Anthropic Claude</span>
              <span className="px-3 py-1 rounded bg-black/40 border border-white/10">Google Gemini</span>
              <span className="px-3 py-1 rounded bg-black/40 border border-white/10">Azure OpenAI</span>
              <span className="px-3 py-1 rounded bg-black/40 border border-white/10">AWS Bedrock</span>
              <span className="px-3 py-1 rounded bg-black/40 border border-white/10">Ollama / LocalAI</span>
            </div>
          </div>

          {/* LAYER 4: ASYNC TELEMETRY PIPELINE (Kafka) */}
          <div className="p-6 rounded-2xl border border-sky-500/30 bg-sky-950/10 relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
                <span className="text-sm font-bold text-sky-300 font-mono">
                  ASYNC TELEMETRY PIPELINE (Kafka Event Bus: usage-events)
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">Decoupled from client latency</span>
            </div>

            {/* Async Workers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
              
              <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                <p className="text-sky-400 font-bold text-[11px]">Cost Engine (Go)</p>
                <p className="text-[10px] text-slate-400 mt-1">Calculates token pricing & ledger updates</p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                <p className="text-sky-400 font-bold text-[11px]">Analytics (Go)</p>
                <p className="text-[10px] text-slate-400 mt-1">Micro-batch insertion into ClickHouse</p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                <p className="text-sky-400 font-bold text-[11px]">Audit Service (Go)</p>
                <p className="text-[10px] text-slate-400 mt-1">Computes SHA-256 HMAC hash chain</p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                <p className="text-sky-400 font-bold text-[11px]">Alert Engine (Go)</p>
                <p className="text-[10px] text-slate-400 mt-1">Threshold alerts to Slack / Webhook</p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-violet-500/30">
                <p className="text-violet-300 font-bold text-[11px]">ML Service (Python)</p>
                <p className="text-[10px] text-slate-400 mt-1">IsolationForest anomaly detector</p>
              </div>

            </div>
          </div>

          {/* LAYER 5: STORAGE LAYER */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            
            <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-white font-bold">
                <Database size={15} className="text-blue-400" />
                <span>PostgreSQL (OLTP)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Source of truth for Users, Teams, Budgets, and the Cryptographic Audit Hash Ledger.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-white font-bold">
                <Activity size={15} className="text-amber-400" />
                <span>ClickHouse (OLAP)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Columnar store for raw usage events, materialized views, and sub-50ms analytics aggregations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-white font-bold">
                <Zap size={15} className="text-red-400" />
                <span>Redis (Real-Time State)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Sub-millisecond API key cache, active team budget counters, and rate-limiting buckets.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

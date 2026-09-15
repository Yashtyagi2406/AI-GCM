'use client'

import React from 'react'
import { Zap, Clock, ShieldCheck, Database, ArrowRight } from 'lucide-react'

export function HotPathVsAsync() {
  return (
    <section id="hot-path" className="py-24 sm:py-32 bg-slate-950/40 relative border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono mb-4">
            <Clock size={13} />
            <span>PERFORMANCE PHILOSOPHY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Keep the request path fast. <br className="hidden sm:block" />Push everything else async.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            Every millisecond added to an LLM completion degrades end-user application UX. AI-GCM guarantees sub-3ms overhead by strictly separating synchronous enforcement from asynchronous writes.
          </p>
        </div>

        {/* Hot Path vs Async Plane Comparison */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* HOT PATH CARD */}
          <div className="p-6 sm:p-8 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-slate-900/80 backdrop-blur-md relative shadow-xl shadow-emerald-500/5">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-300 font-bold flex items-center gap-2">
                <Zap size={14} className="text-emerald-400" />
                THE HOT PATH (INLINE)
              </span>
              <span className="text-xs font-mono text-emerald-300 font-bold px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                &lt;3ms latency target
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-6 font-mono leading-relaxed">
              Only in-memory operations execute while your application client waits. Zero database writes or external disk I/O on the critical path.
            </p>

            {/* Hot Path Pipeline Flow */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-slate-300 font-medium">1. TLS Handshake &amp; Header Parse</span>
                <span className="text-emerald-400 font-mono">0.3 ms</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-slate-300 font-medium">2. API Key Authentication (Redis RAM)</span>
                <span className="text-emerald-400 font-mono">0.4 ms</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-slate-300 font-medium">3. In-Memory Regex DLP Scan</span>
                <span className="text-emerald-400 font-mono">0.6 ms</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-slate-300 font-medium">4. Embedded OPA Rego Policy Check</span>
                <span className="text-emerald-400 font-mono">0.4 ms</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-slate-300 font-medium">5. Atomic Budget Balance Gate</span>
                <span className="text-emerald-400 font-mono">0.3 ms</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Measured 99th percentile:</span>
              <span className="text-emerald-400 font-bold text-sm">~2.1 ms total overhead</span>
            </div>
          </div>

          {/* ASYNC PLANE CARD */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-slate-950/70 backdrop-blur-md relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <span className="text-xs font-mono uppercase tracking-widest text-sky-300 font-bold flex items-center gap-2">
                <Database size={14} className="text-sky-400" />
                THE ASYNC PLANE (KAFKA EVENT BUS)
              </span>
              <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-white/[0.04]">
                Fire-and-forget
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-6 font-mono leading-relaxed">
              When a response finishes streaming, telemetry packets publish asynchronously to Kafka. Heavy relational inserts, token billing, and analytics never block client responses.
            </p>

            {/* Async Pipeline Items */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Cost Engine Token Accounting</p>
                  <p className="text-[10px] text-slate-400">Computes input/output cost &amp; decrements balances</p>
                </div>
                <span className="text-slate-400 text-[11px]">Go Consumer</span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">ClickHouse OLAP Ingestion</p>
                  <p className="text-[10px] text-slate-400">Micro-batched for columnar time-series storage</p>
                </div>
                <span className="text-slate-400 text-[11px]">Go Consumer</span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Cryptographic Audit Chain</p>
                  <p className="text-[10px] text-slate-400">Computes SHA-256 HMAC for immutable ledger</p>
                </div>
                <span className="text-slate-400 text-[11px]">Go Consumer</span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">ML Anomaly Detection</p>
                  <p className="text-[10px] text-slate-400">IsolationForest retrained every 6 hours</p>
                </div>
                <span className="text-slate-400 text-[11px]">Python Worker</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Client latency penalty:</span>
              <span className="text-emerald-400 font-bold text-sm">0.00 ms</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

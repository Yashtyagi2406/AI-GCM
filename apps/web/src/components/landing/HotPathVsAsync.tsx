'use client'

import React from 'react'
import { Zap, Clock, ShieldCheck, Database, ArrowRight } from 'lucide-react'

export function HotPathVsAsync() {
  return (
    <section id="hot-path" className="py-24 sm:py-32 dark:bg-black/30 bg-white/50 relative border-b border-slate-200/80 dark:border-white/[0.08] backdrop-blur-[3px] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold mb-4">
            <Clock size={14} />
            <span>PERFORMANCE PHILOSOPHY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
            Keep the request path fast. <br className="hidden sm:block" />Push everything else async.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            Every millisecond added to an LLM completion degrades end-user application UX. AI-GCM guarantees sub-3ms overhead by strictly separating synchronous enforcement from asynchronous writes.
          </p>
        </div>

        {/* Hot Path vs Async Plane Comparison */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* HOT PATH CARD */}
          <div className="p-6 sm:p-8 rounded-2xl border-2 border-emerald-500/30 dark:border-emerald-500/40 bg-gradient-to-b from-emerald-500/5 to-white dark:from-emerald-950/20 dark:to-slate-900/80 backdrop-blur-md relative shadow-xl shadow-emerald-500/5">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-white/10">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
                <Zap size={14} className="text-emerald-500 dark:text-emerald-400" />
                THE HOT PATH (INLINE)
              </span>
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                &lt;3ms latency target
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 font-mono leading-relaxed">
              Only in-memory operations execute while your application client waits. Zero database writes or external disk I/O on the critical path.
            </p>

            {/* Hot Path Pipeline Flow */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 shadow-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">1. TLS Handshake &amp; Header Parse</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">0.3 ms</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 shadow-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">2. API Key Authentication (Redis RAM)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">0.4 ms</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 shadow-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">3. In-Memory Regex DLP Scan</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">0.6 ms</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 shadow-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">4. Embedded OPA Rego Policy Check</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">0.4 ms</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 shadow-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">5. Atomic Budget Balance Gate</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">0.3 ms</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400">Measured 99th percentile:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">~2.1 ms total overhead</span>
            </div>
          </div>

          {/* ASYNC PLANE CARD */}
          <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/70 backdrop-blur-md relative shadow-lg dark:shadow-none">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-white/10">
              <span className="text-xs font-mono uppercase tracking-widest text-sky-700 dark:text-sky-300 font-bold flex items-center gap-2">
                <Database size={14} className="text-sky-500 dark:text-sky-400" />
                THE ASYNC PLANE (KAFKA EVENT BUS)
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-transparent">
                Fire-and-forget
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 font-mono leading-relaxed">
              When a response finishes streaming, telemetry packets publish asynchronously to Kafka. Heavy relational inserts, token billing, and analytics never block client responses.
            </p>

            {/* Async Pipeline Items */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">Cost Engine Token Accounting</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Computes input/output cost &amp; decrements balances</p>
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Go Consumer</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">ClickHouse OLAP Ingestion</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Micro-batched for columnar time-series storage</p>
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Go Consumer</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">Cryptographic Audit Chain</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Computes SHA-256 HMAC for immutable ledger</p>
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Go Consumer</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">ML Anomaly Detection</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">IsolationForest retrained every 6 hours</p>
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Python Worker</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400">Client latency penalty:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">0.00 ms</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

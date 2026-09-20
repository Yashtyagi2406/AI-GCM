'use client'

import React from 'react'
import { DollarSign, ShieldAlert, SlidersHorizontal, FileSearch, ArrowRight, AlertOctagon } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

export function ProblemsSection() {
  return (
    <section className="py-24 sm:py-32 relative dark:bg-black/20 bg-white/30 border-b dark:border-white/[0.08] border-slate-200/60 backdrop-blur-[2px] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-red-500/20 bg-red-500/10 text-red-500 dark:text-red-400 text-xs font-mono mb-4">
            <AlertOctagon size={13} />
            <span>PRODUCTION CHALLENGES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            AI in production creates a new infrastructure problem.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            When teams move from experimental notebooks to enterprise microservices, point-to-point provider calls become an operational vulnerability.
          </p>
        </div>

        {/* 4 Problem Cards with Technical Visualizations */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. Uncontrolled Spend */}
          <ScrollReveal delay={100} direction="up">
            <div className="h-full p-7 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-slate-950/80 bg-white backdrop-blur-sm hover:border-red-500/30 transition-all flex flex-col justify-between group shadow-xl dark:shadow-black/50 shadow-slate-200/50">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 dark:text-red-400">
                    <DollarSign size={20} />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-300 border border-red-500/20">
                    CRITICAL IMPACT
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Uncontrolled Spend</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Teams create API keys and workloads independently. AI spending becomes difficult to track, apportion, and cap before end-of-month invoice shock.
                </p>
              </div>

              {/* Visual Representation */}
              <div className="mt-6 p-4 rounded-xl dark:bg-black/50 bg-slate-50 border dark:border-white/10 border-slate-200 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                  <span>ORPHANED_KEY: sk-proj-...8492</span>
                  <span className="text-red-600 dark:text-red-400 font-bold">$14,280 / UNMETERED</span>
                </div>
                <div className="w-full dark:bg-white/[0.05] bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full w-[94%]" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Engineering Spike: 4.2x velocity</span>
                  <span className="text-red-600 dark:text-red-400">No Budget Cap Active</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* 2. Sensitive Data */}
          <ScrollReveal delay={200} direction="up">
            <div className="h-full p-7 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-slate-950/80 bg-white backdrop-blur-sm hover:border-amber-500/30 transition-all flex flex-col justify-between group shadow-xl dark:shadow-black/50 shadow-slate-200/50">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                    <ShieldAlert size={20} />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
                    DATA LEAKAGE
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sensitive Data</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Applications can accidentally send customer PII, HIPAA medical records, or proprietary database secrets to external model providers without inspection.
                </p>
              </div>

              {/* Visual Representation */}
              <div className="mt-6 p-4 rounded-xl dark:bg-black/50 bg-slate-50 border dark:border-white/10 border-slate-200 font-mono text-xs space-y-1.5">
                <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  OUTBOUND PAYLOAD UNFILTERED
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px] truncate">
                  prompt: &quot;...customer SSN: <span className="bg-red-500/20 dark:bg-red-500/30 text-red-600 dark:text-red-200 px-1 rounded">XXX-XX-4912</span> and token: <span className="bg-red-500/20 dark:bg-red-500/30 text-red-600 dark:text-red-200 px-1 rounded">ghp_...</span>&quot;
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t dark:border-white/5 border-slate-200 flex justify-between">
                  <span>Destination: api.openai.com</span>
                  <span className="text-amber-600 dark:text-amber-400">Zero DLP Interception</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* 3. No Governance */}
          <ScrollReveal delay={300} direction="up">
            <div className="h-full p-7 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-slate-950/80 bg-white backdrop-blur-sm hover:border-sky-500/30 transition-all flex flex-col justify-between group shadow-xl dark:shadow-black/50 shadow-slate-200/50">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 dark:text-sky-400">
                    <SlidersHorizontal size={20} />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/20">
                    POLICY VOID
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Central Governance</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Organizations lack centralized policies for who can use which models, what token limits apply per team, and under what production environment conditions.
                </p>
              </div>

              {/* Visual Representation */}
              <div className="mt-6 p-4 rounded-xl dark:bg-black/50 bg-slate-50 border dark:border-white/10 border-slate-200 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-700 dark:text-slate-300">Requested: o1-preview</span>
                  <span className="text-amber-600 dark:text-amber-400">Marketing Intern</span>
                </div>
                <div className="p-2 rounded dark:bg-white/[0.03] bg-white text-[10px] text-slate-600 dark:text-slate-400 border dark:border-white/5 border-slate-200 flex justify-between items-center shadow-xs">
                  <span>Cost: $15.00 / 1M tokens</span>
                  <span className="text-red-600 dark:text-red-400">No Model Allowlist Rule</span>
                </div>
                <p className="text-[10px] text-slate-500">Result: Expensive reasoning model used for basic grammar checking.</p>
              </div>
            </div>
          </ScrollReveal>

          {/* 4. No Verifiable Audit Trail */}
          <ScrollReveal delay={400} direction="up">
            <div className="h-full p-7 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-slate-950/80 bg-white backdrop-blur-sm hover:border-violet-500/30 transition-all flex flex-col justify-between group shadow-xl dark:shadow-black/50 shadow-slate-200/50">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400">
                    <FileSearch size={20} />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20">
                    COMPLIANCE VOID
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Verifiable Audit Trail</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Security, legal, and compliance teams need answers to fundamental audit questions: Who made the call? What went in? Which model processed it? How much did it cost?
                </p>
              </div>

              {/* Visual Representation */}
              <div className="mt-6 p-4 rounded-xl dark:bg-black/50 bg-slate-50 border dark:border-white/10 border-slate-200 font-mono text-xs space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-1.5 rounded dark:bg-white/[0.02] bg-white border dark:border-white/5 border-slate-200 text-slate-600 dark:text-slate-400">
                    User ID: <span className="text-slate-400 dark:text-slate-500">Unknown</span>
                  </div>
                  <div className="p-1.5 rounded dark:bg-white/[0.02] bg-white border dark:border-white/5 border-slate-200 text-slate-600 dark:text-slate-400">
                    Payload Hash: <span className="text-slate-400 dark:text-slate-500">None</span>
                  </div>
                  <div className="p-1.5 rounded dark:bg-white/[0.02] bg-white border dark:border-white/5 border-slate-200 text-slate-600 dark:text-slate-400">
                    Cost Ledger: <span className="text-slate-400 dark:text-slate-500">Untracked</span>
                  </div>
                  <div className="p-1.5 rounded dark:bg-white/[0.02] bg-white border dark:border-white/5 border-slate-200 text-slate-600 dark:text-slate-400">
                    Hash Chain: <span className="text-red-500 dark:text-red-400">Missing</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 pt-1">Audit verification impossible during forensic review.</p>
              </div>
            </div>
          </ScrollReveal>

        </div>

      </div>
    </section>
  )
}

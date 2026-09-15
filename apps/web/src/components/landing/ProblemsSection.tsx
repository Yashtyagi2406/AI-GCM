'use client'

import React from 'react'
import { DollarSign, ShieldAlert, SlidersHorizontal, FileSearch, ArrowRight, AlertOctagon } from 'lucide-react'

export function ProblemsSection() {
  return (
    <section className="py-24 sm:py-32 relative bg-[#030712] border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-mono mb-4">
            <AlertOctagon size={13} />
            <span>PRODUCTION CHALLENGES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            AI in production creates a new infrastructure problem.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            When teams move from experimental notebooks to enterprise microservices, point-to-point provider calls become an operational vulnerability.
          </p>
        </div>

        {/* 4 Problem Cards with Technical Visualizations */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. Uncontrolled Spend */}
          <div className="p-7 rounded-2xl border border-white/10 bg-slate-950/60 hover:border-red-500/30 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <DollarSign size={20} />
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">
                  CRITICAL IMPACT
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Uncontrolled Spend</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Teams create API keys and workloads independently. AI spending becomes difficult to track, apportion, and cap before end-of-month invoice shock.
              </p>
            </div>

            {/* Visual Representation */}
            <div className="mt-6 p-4 rounded-xl bg-black/50 border border-white/10 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>ORPHANED_KEY: sk-proj-...8492</span>
                <span className="text-red-400 font-bold">$14,280 / UNMETERED</span>
              </div>
              <div className="w-full bg-white/[0.05] h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full w-[94%]" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Engineering Spike: 4.2x velocity</span>
                <span className="text-red-400">No Budget Cap Active</span>
              </div>
            </div>
          </div>

          {/* 2. Sensitive Data */}
          <div className="p-7 rounded-2xl border border-white/10 bg-slate-950/60 hover:border-amber-500/30 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <ShieldAlert size={20} />
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  DATA LEAKAGE
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sensitive Data</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Applications can accidentally send customer PII, HIPAA medical records, or proprietary database secrets to external model providers without inspection.
              </p>
            </div>

            {/* Visual Representation */}
            <div className="mt-6 p-4 rounded-xl bg-black/50 border border-white/10 font-mono text-xs space-y-1.5">
              <div className="text-[11px] text-amber-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                OUTBOUND PAYLOAD UNFILTERED
              </div>
              <div className="text-slate-400 text-[11px] truncate">
                prompt: &quot;...customer SSN: <span className="bg-red-500/30 text-red-200 px-1 rounded">XXX-XX-4912</span> and token: <span className="bg-red-500/30 text-red-200 px-1 rounded">ghp_...</span>&quot;
              </div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-white/5 flex justify-between">
                <span>Destination: api.openai.com</span>
                <span className="text-amber-400">Zero DLP Interception</span>
              </div>
            </div>
          </div>

          {/* 3. No Governance */}
          <div className="p-7 rounded-2xl border border-white/10 bg-slate-950/60 hover:border-sky-500/30 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <SlidersHorizontal size={20} />
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  POLICY VOID
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Central Governance</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Organizations lack centralized policies for who can use which models, what token limits apply per team, and under what production environment conditions.
              </p>
            </div>

            {/* Visual Representation */}
            <div className="mt-6 p-4 rounded-xl bg-black/50 border border-white/10 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Requested: o1-preview</span>
                <span className="text-amber-400">Marketing Intern</span>
              </div>
              <div className="p-2 rounded bg-white/[0.03] text-[10px] text-slate-400 border border-white/5 flex justify-between items-center">
                <span>Cost: $15.00 / 1M tokens</span>
                <span className="text-red-400">No Model Allowlist Rule</span>
              </div>
              <p className="text-[10px] text-slate-500">Result: Expensive reasoning model used for basic grammar checking.</p>
            </div>
          </div>

          {/* 4. No Verifiable Audit Trail */}
          <div className="p-7 rounded-2xl border border-white/10 bg-slate-950/60 hover:border-violet-500/30 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <FileSearch size={20} />
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  COMPLIANCE VOID
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Verifiable Audit Trail</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Security, legal, and compliance teams need answers to fundamental audit questions: Who made the call? What went in? Which model processed it? How much did it cost?
              </p>
            </div>

            {/* Visual Representation */}
            <div className="mt-6 p-4 rounded-xl bg-black/50 border border-white/10 font-mono text-xs space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="p-1.5 rounded bg-white/[0.02] border border-white/5 text-slate-400">
                  User ID: <span className="text-slate-500">Unknown</span>
                </div>
                <div className="p-1.5 rounded bg-white/[0.02] border border-white/5 text-slate-400">
                  Payload Hash: <span className="text-slate-500">None</span>
                </div>
                <div className="p-1.5 rounded bg-white/[0.02] border border-white/5 text-slate-400">
                  Cost Ledger: <span className="text-slate-500">Untracked</span>
                </div>
                <div className="p-1.5 rounded bg-white/[0.02] border border-white/5 text-slate-400">
                  Hash Chain: <span className="text-red-400">Missing</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 pt-1">Audit verification impossible during forensic review.</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

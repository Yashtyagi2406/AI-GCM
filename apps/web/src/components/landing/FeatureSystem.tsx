'use client'

import React from 'react'
import { 
  DollarSign, ShieldCheck, FileText, Bell, Zap, 
  Activity, CheckCircle2, AlertTriangle, Lock, Cpu, ArrowUpRight 
} from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

export function FeatureSystem() {
  return (
    <section id="features" className="py-24 sm:py-32 dark:bg-black/20 bg-white/25 relative border-b dark:border-white/[0.08] border-slate-200/60 backdrop-blur-[2px] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-mono mb-4">
            <Cpu size={13} />
            <span>PLATFORM CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Six pillars of enterprise AI control.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Engineered specifically for infrastructure teams managing high-throughput GenAI workloads.
          </p>
        </div>

        {/* 6 Capabilities Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 1. COST CONTROL */}
          <ScrollReveal delay={50} direction="up">
            <div className="h-full p-6 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-slate-950/80 bg-white flex flex-col justify-between hover:border-violet-500/30 transition-all group shadow-lg dark:shadow-xl shadow-slate-200/50">
              <div>
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4">
                  <DollarSign size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Cost Control</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Know exactly where your AI spend goes across every layer of your architecture in real time.
                </p>

              {/* Technical Visual */}
              <div className="mt-5 p-3.5 rounded-xl dark:bg-black/50 bg-slate-50 border dark:border-white/10 border-slate-200 font-mono text-[11px] space-y-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-300 pb-1.5 border-b dark:border-white/5 border-slate-200">
                  <span className="text-slate-500 dark:text-slate-400">Dimension</span>
                  <span className="text-violet-600 dark:text-violet-300 font-medium">Live Breakdown</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">By Provider</span>
                  <span className="text-slate-800 dark:text-slate-200">Anthropic (50%) · OpenAI (31%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">By Model</span>
                  <span className="text-slate-800 dark:text-slate-200">claude-3-5-sonnet: $12.4k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">By Team</span>
                  <span className="text-slate-800 dark:text-slate-200">Engineering ($12.4k) · DS ($5.1k)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Token Volume</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">1.84 Billion tokens</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t dark:border-white/5 border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Granular attribution</span>
              <span className="text-violet-600 dark:text-violet-400">Hard budget caps</span>
            </div>
          </div>
          </ScrollReveal>

          {/* 2. GOVERNANCE (OPA Rego) */}
          <ScrollReveal delay={120} direction="up">
            <div className="h-full p-6 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-slate-950/80 bg-white flex flex-col justify-between hover:border-sky-500/30 transition-all group shadow-lg dark:shadow-xl shadow-slate-200/50">
              <div>
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-500 dark:text-sky-400 mb-4">
                  <Zap size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Governance & OPA Policies</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Enforce declarative policies before requests ever reach external model endpoints using Open Policy Agent.
                </p>

                {/* OPA Policy Interface Visual */}
                <div className="mt-5 p-3.5 rounded-xl dark:bg-black/50 bg-slate-50 border dark:border-white/10 border-slate-200 font-mono text-[11px] space-y-1.5">
                  <div className="flex justify-between items-center text-sky-600 dark:text-sky-300 pb-1 border-b dark:border-white/5 border-slate-200">
                    <span className="font-bold">POLICY: production-ai</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">ACTIVE</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Provider Allowlist:</span>
                    <span className="text-slate-900 dark:text-white">OpenAI ✓ · Anthropic ✓</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Max Monthly Spend:</span>
                    <span className="text-slate-900 dark:text-white">$25,000</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Environment:</span>
                    <span className="text-slate-900 dark:text-white">Production (Strict)</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>PII Action:</span>
                    <span className="text-red-500 dark:text-red-400 font-bold">BLOCK</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t dark:border-white/5 border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Embedded Rego Engine</span>
                <span className="text-sky-600 dark:text-sky-400">0.4ms evaluation</span>
              </div>
            </div>
          </ScrollReveal>

          {/* 3. DLP (Data Loss Prevention) */}
          <ScrollReveal delay={190} direction="up">
            <div className="h-full p-6 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-slate-950/80 bg-white flex flex-col justify-between hover:border-emerald-500/30 transition-all group shadow-lg dark:shadow-xl shadow-slate-200/50">
              <div>
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-4">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">In-Memory DLP</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Stop sensitive customer data before it leaves your infrastructure using high-speed compiled regex scanners.
                </p>

                {/* DLP Interception Visual */}
                <div className="mt-5 p-3.5 rounded-xl dark:bg-black/50 bg-slate-50 border dark:border-white/10 border-slate-200 font-mono text-[11px] space-y-2">
                  <div className="text-slate-500 dark:text-slate-400 text-[10px]">INBOUND PAYLOAD:</div>
                  <div className="p-2 rounded dark:bg-white/[0.03] bg-white border dark:border-transparent border-slate-200 text-[10px] text-slate-700 dark:text-slate-300">
                    customer_email: yash@example.com<br />
                    credit_card: **** **** **** 4242
                  </div>
                  <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-[10px] space-y-0.5">
                    <div className="text-red-500 dark:text-red-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      DLP DETECTION: PII FOUND
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">ACTION: <strong className="text-red-500 dark:text-red-400">BLOCK REQUEST (HTTP 403)</strong></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t dark:border-white/5 border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>PCI-DSS & HIPAA Filter</span>
                <span className="text-emerald-600 dark:text-emerald-400">Pre-network drop</span>
              </div>
            </div>
          </ScrollReveal>

          {/* 4. AUDIT (Tamper-Evident SHA-256 HMAC Chain) */}
          <ScrollReveal delay={260} direction="up">
            <div className="h-full p-6 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-slate-950/80 bg-white flex flex-col justify-between hover:border-violet-500/30 transition-all group shadow-lg dark:shadow-xl shadow-slate-200/50">
              <div>
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4">
                  <FileText size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Cryptographic Audit Chain</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every AI interaction becomes traceable with a tamper-evident SHA-256/HMAC hash chain.
                </p>

                {/* Audit Timeline */}
                <div className="mt-5 p-3.5 rounded-xl dark:bg-black/50 bg-slate-50 border dark:border-white/10 border-slate-200 font-mono text-[11px] space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 pb-1 border-b dark:border-white/5 border-slate-200">
                    <span>TIME / ENTITY</span>
                    <span>MODEL / COST</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-700 dark:text-slate-300">10:42:31 · Engineering</span>
                    <span className="text-slate-700 dark:text-slate-300">gpt-4o · <strong className="text-slate-900 dark:text-white">$0.042</strong></span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-700 dark:text-slate-300">10:42:32 · Marketing</span>
                    <span className="text-slate-700 dark:text-slate-300">claude-3-5 · <strong className="text-slate-900 dark:text-white">$0.018</strong></span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-700 dark:text-slate-300">10:42:35 · Support</span>
                    <span className="text-slate-700 dark:text-slate-300">gemini-2.0 · <strong className="text-slate-900 dark:text-white">$0.009</strong></span>
                  </div>
                  <div className="pt-1.5 border-t dark:border-white/5 border-slate-200 text-[9px] text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                    <span>CHAIN: SHA256(prev + row + HMAC)</span>
                    <span className="text-slate-500 dark:text-slate-400">VERIFIED ✓</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t dark:border-white/5 border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>GET /audit/verify</span>
                <span className="text-violet-600 dark:text-violet-400">Immutable ledger</span>
              </div>
            </div>
          </ScrollReveal>

          {/* 5. ALERTING */}
          <ScrollReveal delay={330} direction="up">
            <div className="h-full p-6 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-slate-950/80 bg-white flex flex-col justify-between hover:border-amber-500/30 transition-all group shadow-lg dark:shadow-xl shadow-slate-200/50">
              <div>
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-4">
                  <Bell size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Real-Time Alerting</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Know before AI spending becomes an emergency with proactive threshold, rate-limit, and anomaly alerts.
                </p>

                {/* Alert Card Mockup */}
                <div className="mt-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 font-mono text-[11px] space-y-2">
                  <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                    <span className="font-bold flex items-center gap-1">
                      <AlertTriangle size={12} />
                      BUDGET ALERT
                    </span>
                    <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-600 dark:text-amber-300 font-semibold">WARNING</span>
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 font-semibold">
                    Engineering Team: $18,720 / $20,000
                  </div>
                  <div className="w-full dark:bg-black/40 bg-amber-200/50 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[93.6%]" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="text-amber-600 dark:text-amber-300 font-medium">93.6% Consumed</span>
                    <span className="text-slate-900 dark:text-white hover:underline cursor-pointer">Review spending →</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t dark:border-white/5 border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Slack & Webhook Dispatch</span>
                <span className="text-amber-600 dark:text-amber-400">Sub-second trigger</span>
              </div>
            </div>
          </ScrollReveal>

          {/* 6. ANOMALY DETECTION (Python ML) */}
          <ScrollReveal delay={400} direction="up">
            <div className="h-full p-6 rounded-2xl border dark:border-white/10 border-slate-200 dark:bg-slate-950/80 bg-white flex flex-col justify-between hover:border-red-500/30 transition-all group shadow-lg dark:shadow-xl shadow-slate-200/50">
              <div>
                <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 dark:text-red-400 mb-4">
                  <Activity size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">ML Anomaly Detection</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Find unusual AI usage automatically using an IsolationForest model running continuous retraining loops.
                </p>

                {/* ML Visual */}
                <div className="mt-5 p-3.5 rounded-xl dark:bg-black/50 bg-slate-50 border dark:border-white/10 border-slate-200 font-mono text-[11px] space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400">Normal Baseline: $1.2k/day</span>
                    <span className="text-red-500 dark:text-red-400 font-bold animate-pulse">SPIKE: $4.8k</span>
                  </div>
                  <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-[10px] space-y-1">
                    <div className="text-red-600 dark:text-red-300 font-bold">Anomaly detected: +$3,600 delta</div>
                    <div className="text-slate-600 dark:text-slate-400">Model: <strong className="text-slate-900 dark:text-white">GPT-4o</strong> · Env: <strong className="text-slate-900 dark:text-white">Production</strong></div>
                    <div className="text-slate-600 dark:text-slate-400">Root Cause: Infinite retry loop on worker #12</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t dark:border-white/5 border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Python IsolationForest</span>
                <span className="text-red-500 dark:text-red-400">6h retrain loop</span>
              </div>
            </div>
          </ScrollReveal>

        </div>

      </div>
    </section>
  )
}

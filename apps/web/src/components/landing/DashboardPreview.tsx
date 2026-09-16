'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  DollarSign, Activity, Cpu, Layers, TrendingUp, 
  TrendingDown, ArrowUpRight, ShieldCheck, Zap 
} from 'lucide-react'

export function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'teams'>('overview')

  return (
    <section className="py-24 sm:py-32 bg-slate-950/70 relative border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-violet-500/25 bg-violet-500/10 text-violet-400 text-xs font-mono mb-4">
              <Activity size={13} />
              <span>LIVE OBSERVABILITY</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              A unified control console for production.
            </h2>
            <p className="mt-3 text-base text-slate-400 max-w-2xl">
              Inspect real-time token economics, budget thresholds, and security policies across every team and provider in your organization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/25 transition-all"
            >
              <span>Explore Live Dashboard</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Shell */}
        <div className="rounded-2xl border border-white/10 bg-[#090d16] p-4 sm:p-7 shadow-2xl shadow-black/80 relative overflow-hidden">
          
          {/* Top Bar of Shell */}
          <div className="flex flex-wrap items-center justify-between pb-5 mb-6 border-b border-white/[0.08] gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono font-bold text-white">ORGANIZATION CONSOLE: ACME CORP</span>
              </div>
              <span className="text-xs font-mono text-slate-500">|</span>
              <span className="text-xs font-mono text-slate-400">Environment: Production-US-East</span>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('models')}
                className={`px-3 py-1 rounded-lg transition-all ${activeTab === 'models' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                Providers
              </button>
              <button 
                onClick={() => setActiveTab('teams')}
                className={`px-3 py-1 rounded-lg transition-all ${activeTab === 'teams' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                Teams & Budgets
              </button>
            </div>
          </div>

          {/* 4 Stat Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <p className="text-xs font-mono text-slate-400">Total AI Spend</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white font-mono">$42,861</span>
                <span className="text-xs font-mono text-emerald-400 flex items-center">
                  <TrendingDown size={11} className="mr-0.5" /> -18.4%
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">Trailing 30 days</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <p className="text-xs font-mono text-slate-400">Total Requests</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white font-mono">12.7M</span>
                <span className="text-xs font-mono text-emerald-400 flex items-center">
                  <TrendingUp size={11} className="mr-0.5" /> +24%
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">100% routed through proxy</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <p className="text-xs font-mono text-slate-400">Token Volume</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white font-mono">1.84B</span>
                <span className="text-xs font-mono text-slate-400">tokens</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">Input: 1.12B · Output: 720M</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <p className="text-xs font-mono text-slate-400">Active Models</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white font-mono">24</span>
                <span className="text-xs font-mono text-violet-400">across 4 providers</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">All governed by OPA</p>
            </div>
          </div>

          {/* Charts & Breakdown Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Visual: Daily Cost Trend (2 Cols) */}
            <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/60 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Daily Cost Trend</h4>
                  <p className="text-xs text-slate-500">Stacked by provider across trailing 30 days</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-400" />Anthropic</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />OpenAI</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />Gemini</span>
                </div>
              </div>

              {/* Simplified high-aesthetic SVG Area Chart */}
              <div className="h-48 w-full relative flex items-end">
                <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="130" x2="500" y2="130" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

                  {/* Primary Anthropic Curve */}
                  <path 
                    d="M0,130 Q70,110 140,80 T280,60 T420,40 L500,25 L500,150 L0,150 Z" 
                    fill="url(#purpleGrad)" 
                  />
                  <path 
                    d="M0,130 Q70,110 140,80 T280,60 T420,40 L500,25" 
                    fill="none" 
                    stroke="#8b5cf6" 
                    strokeWidth="2.5" 
                  />

                  {/* Secondary OpenAI Curve */}
                  <path 
                    d="M0,140 Q80,125 160,110 T320,85 T440,75 L500,65 L500,150 L0,150 Z" 
                    fill="url(#blueGrad)" 
                  />
                  <path 
                    d="M0,140 Q80,125 160,110 T320,85 T440,75 L500,65" 
                    fill="none" 
                    stroke="#38bdf8" 
                    strokeWidth="2" 
                  />

                  {/* Anomaly Detection Callout Pin */}
                  <circle cx="280" cy="60" r="4" fill="#ef4444" className="animate-ping" />
                  <circle cx="280" cy="60" r="4" fill="#ef4444" />
                </svg>

                {/* Floating Anomaly Badge */}
                <div className="absolute top-6 left-1/2 -translate-x-8 px-2.5 py-1 rounded bg-red-500/20 border border-red-500/40 text-[10px] font-mono text-red-300 backdrop-blur-md">
                  ML Flag: Spike Resolved (+$3.6k)
                </div>
              </div>

              <div className="mt-3 flex justify-between text-[11px] font-mono text-slate-500">
                <span>May 17</span>
                <span>May 24</span>
                <span>May 31</span>
                <span>Jun 07</span>
                <span>Jun 15 (Today)</span>
              </div>
            </div>

            {/* Provider Breakdown Donut & Teams (1 Col) */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-white/[0.06] flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Provider Distribution</h4>
                <p className="text-xs text-slate-500 mb-4">Spend share across 24 models</p>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Anthropic Claude</span>
                      <span className="text-white font-bold">$21,430 (50%)</span>
                    </div>
                    <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-violet-500 h-full w-[50%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>OpenAI</span>
                      <span className="text-white font-bold">$13,280 (31%)</span>
                    </div>
                    <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-sky-400 h-full w-[31%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Google Gemini</span>
                      <span className="text-white font-bold">$5,570 (13%)</span>
                    </div>
                    <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[13%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Azure & Local</span>
                      <span className="text-white font-bold">$2,581 (6%)</span>
                    </div>
                    <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-[6%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Utilization Snippet */}
              <div className="mt-4 pt-3 border-t border-white/10 font-mono text-[11px] text-slate-400 flex items-center justify-between">
                <span>Top Team: Engineering</span>
                <span className="text-violet-300 font-semibold">83% of $15k limit</span>
              </div>
            </div>

          </div>

          {/* Bottom Live Audit Request Stream */}
          <div className="mt-6 pt-5 border-t border-white/[0.08]">
            <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE AUDIT STREAM (SHA-256 HMAC VERIFIED)
              </span>
              <span className="text-slate-500">Latency &lt;3ms overhead</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-white text-[11px] font-semibold">app-payment-service</p>
                  <p className="text-[10px] text-slate-400">claude-3-5-sonnet · 1,420 tokens</p>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 text-[10px] font-bold">200 OK</span>
                  <p className="text-[10px] text-slate-500">1.8ms proxy</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-white text-[11px] font-semibold">bi-analytics-pipeline</p>
                  <p className="text-[10px] text-slate-400">gpt-4o · 890 tokens</p>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 text-[10px] font-bold">200 OK</span>
                  <p className="text-[10px] text-slate-500">2.1ms proxy</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-red-500/20 flex items-center justify-between">
                <div>
                  <p className="text-red-300 text-[11px] font-semibold">support-agent-worker</p>
                  <p className="text-[10px] text-slate-400">DLP: SSN pattern blocked</p>
                </div>
                <div className="text-right">
                  <span className="text-red-400 text-[10px] font-bold">403 BLOCKED</span>
                  <p className="text-[10px] text-slate-500">0.9ms proxy</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

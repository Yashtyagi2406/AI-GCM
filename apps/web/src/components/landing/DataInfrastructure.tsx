'use client'

import React from 'react'
import { Database, HardDrive, Zap, Radio, CheckCircle2 } from 'lucide-react'

export function DataInfrastructure() {
  const stores = [
    {
      name: 'PostgreSQL',
      badge: 'OLTP Core',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      icon: Database,
      iconColor: 'text-blue-400',
      role: 'Operational System of Record',
      description: 'Houses organizational hierarchies, team definitions, user credentials, strict budget limits, and the cryptographic audit ledger metadata.',
      specs: ['ACID Transactions', 'Relational Schemas', 'Audit Ledger Table', 'Row-Level Isolation']
    },
    {
      name: 'ClickHouse',
      badge: 'OLAP Analytics',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      icon: HardDrive,
      iconColor: 'text-amber-400',
      role: 'High-Throughput Time-Series Analytics',
      description: 'Ingests millions of raw token usage events via Kafka batching. Powers sub-50ms analytical queries with MergeTree and SummingMergeTree materialized views.',
      specs: ['Sub-50ms Queries', 'MergeTree Engine', 'Hourly Materialized Views', 'Billions of Rows']
    },
    {
      name: 'Redis',
      badge: 'Real-Time State',
      badgeColor: 'text-red-400 bg-red-500/10 border-red-500/20',
      icon: Zap,
      iconColor: 'text-red-400',
      role: 'In-Memory Sub-Millisecond Cache',
      description: 'Enforces inline rate limits, stores active API key authorization tokens, tracks live budget balance counters, and handles session management.',
      specs: ['Sub-millisecond Ops', 'Atomic Decrements', 'Key Token Cache', 'Sliding Window Limits']
    },
    {
      name: 'Apache Kafka',
      badge: 'Event Backbone',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      icon: Radio,
      iconColor: 'text-sky-400',
      role: 'Event Bus & Telemetry Buffer',
      description: 'Guarantees the Go proxy never blocks on downstream writes. Buffers raw usage events to cost accounting, audit hashing, and ML anomaly pipelines.',
      specs: ['Zero Proxy Backpressure', 'usage-events Topic', 'Consumer Groups', 'Guaranteed Delivery']
    },
  ]

  return (
    <section className="py-24 sm:py-32 bg-[#030712] relative border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-violet-500/25 bg-violet-500/10 text-violet-400 text-xs font-mono mb-4">
            <Database size={13} />
            <span>STORAGE &amp; EVENT BACKBONE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Dual-database architecture. <br />Engineered for massive scale.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            AI-GCM pairs relational OLTP consistency for billing limits with columnar OLAP power for high-cardinality time-series analytics.
          </p>
        </div>

        {/* 4 Storage Pillars */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stores.map((s) => {
            const Icon = s.icon
            return (
              <div 
                key={s.name}
                className="p-6 rounded-2xl border border-white/10 bg-slate-950/60 hover:border-white/20 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                      <Icon size={19} className={s.iconColor} />
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${s.badgeColor}`}>
                      {s.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 font-mono">{s.name}</h3>
                  <p className="text-xs font-semibold text-slate-300 mb-2">{s.role}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 space-y-1.5 font-mono text-[11px]">
                  {s.specs.map((spec) => (
                    <div key={spec} className="flex items-center gap-2 text-slate-400">
                      <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

'use client'

import React from 'react'
import { Check, X, Minus, Split } from 'lucide-react'

export function ComparisonMatrix() {
  const rows = [
    {
      feature: 'Real-time inline governance',
      direct: false,
      observability: false,
      aigcm: true,
      note: 'Enforced before the request ever reaches the external model'
    },
    {
      feature: 'Zero code changes (1-line baseURL)',
      direct: true,
      observability: false,
      aigcm: true,
      note: 'No proprietary SDK replacement or vendor lock-in'
    },
    {
      feature: 'Active budget enforcement (Hard caps)',
      direct: false,
      observability: false,
      aigcm: true,
      note: 'Blocks requests atomically at HTTP gateway when quota is exceeded'
    },
    {
      feature: 'In-memory DLP & PII blocking',
      direct: false,
      observability: false,
      aigcm: true,
      note: 'Prevents sensitive credentials and SSNs from leaving infrastructure'
    },
    {
      feature: 'OPA Rego policy engine',
      direct: false,
      observability: false,
      aigcm: true,
      note: 'Declarative enterprise rules evaluated in <0.5ms'
    },
    {
      feature: 'Cryptographic audit chain (SHA-256 HMAC)',
      direct: false,
      observability: false,
      aigcm: true,
      note: 'Tamper-evident hash ledger verifiable by compliance'
    },
    {
      feature: 'ML Anomaly detection (IsolationForest)',
      direct: false,
      observability: true,
      aigcm: true,
      note: 'Detects sudden velocity surges and runaway retry loops'
    },
    {
      feature: 'Multi-provider credential encryption at rest',
      direct: false,
      observability: false,
      aigcm: true,
      note: 'AES-256-GCM Key Vault service keeps keys private'
    },
    {
      feature: 'Sub-50ms OLAP cost analytics (ClickHouse)',
      direct: false,
      observability: true,
      aigcm: true,
      note: 'High-cardinality queries without database latency slowdowns'
    },
  ]

  return (
    <section className="py-24 sm:py-32 bg-[#030712] relative border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-violet-500/25 bg-violet-500/10 text-violet-400 text-xs font-mono mb-4">
            <Split size={13} />
            <span>CATEGORY ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            AI infrastructure is becoming a platform problem.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            Passive observability tools can only alert you hours after an expensive incident occurred. AI-GCM actively intervenes inline on the request path.
          </p>
        </div>

        {/* Matrix Table */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-slate-950/70 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="py-4 px-6 text-slate-400 font-semibold w-2/5">CAPABILITY</th>
                  <th className="py-4 px-6 text-slate-400 font-semibold text-center w-1/5">
                    Direct Provider APIs
                  </th>
                  <th className="py-4 px-6 text-slate-400 font-semibold text-center w-1/5">
                    Observability Tools
                  </th>
                  <th className="py-4 px-6 text-violet-300 font-bold text-center w-1/5 bg-violet-500/10 border-x border-violet-500/30">
                    AI-GCM (Proxy-Native)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((row) => (
                  <tr key={row.feature} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-6 text-slate-200">
                      <p className="font-semibold text-white">{row.feature}</p>
                      <p className="text-[10px] text-slate-400 font-normal font-sans mt-0.5">{row.note}</p>
                    </td>

                    {/* Direct Provider APIs */}
                    <td className="py-3.5 px-6 text-center text-slate-500">
                      {row.direct ? (
                        <Check size={16} className="text-slate-400 mx-auto" />
                      ) : (
                        <X size={16} className="text-slate-600 mx-auto" />
                      )}
                    </td>

                    {/* Observability Tools */}
                    <td className="py-3.5 px-6 text-center text-slate-500">
                      {row.observability ? (
                        <Check size={16} className="text-slate-400 mx-auto" />
                      ) : (
                        <X size={16} className="text-slate-600 mx-auto" />
                      )}
                    </td>

                    {/* AI-GCM */}
                    <td className="py-3.5 px-6 text-center bg-violet-500/[0.05] border-x border-violet-500/30">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 font-bold">
                        ✓
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  )
}

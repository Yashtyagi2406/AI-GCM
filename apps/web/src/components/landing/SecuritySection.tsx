'use client'

import React from 'react'
import { ShieldCheck, Lock, Key, FileCheck, Users, Sliders, Server, EyeOff } from 'lucide-react'

export function SecuritySection() {
  const securityItems = [
    {
      title: 'In-Memory DLP Scanners',
      desc: 'Compiled regular expressions detect credit cards, SSNs, phone numbers, and secrets before bytes leave your network perimeter.',
      icon: EyeOff,
      badge: 'Inline Inspection',
    },
    {
      title: 'AES-256-GCM Key Vault',
      desc: 'Provider API keys (OpenAI, Anthropic, Bedrock) are encrypted with master keys at rest. Raw credentials never touch PostgreSQL in plain text.',
      icon: Key,
      badge: 'Key Vault Service',
    },
    {
      title: 'OPA Rego Policy Engine',
      desc: 'Embedded Open Policy Agent executes sandboxed Rego rules against request context, team quotas, and model allowlists in <0.5ms.',
      icon: ShieldCheck,
      badge: 'Zero Network Hops',
    },
    {
      title: 'Cryptographic Audit Hash Chain',
      desc: 'Audit logs store SHA256(prev_hash + row + HMAC_key). Historical modifications invalidate downstream chains, verifiable via GET /audit/verify.',
      icon: FileCheck,
      badge: 'Tamper-Evident',
    },
    {
      title: 'Role-Based Access Control',
      desc: 'Granular permissions for Admins, Engineers, and Finance teams. Restrict model creation, budget configuration, and audit access.',
      icon: Users,
      badge: 'RBAC Enforced',
    },
    {
      title: 'Environment & VPC Isolation',
      desc: 'Deploy AI-GCM as a self-hosted container inside your AWS VPC, GCP project, or on-prem Kubernetes cluster. Your prompts stay private.',
      icon: Server,
      badge: 'Zero Telemetry Egress',
    },
  ]

  return (
    <section id="security" className="py-24 sm:py-32 dark:bg-black/30 bg-white/50 relative border-b border-slate-200/80 dark:border-white/[0.08] backdrop-blur-[3px] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold mb-4">
            <Lock size={14} />
            <span>ENTERPRISE SECURITY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
            Govern AI without losing control of your data.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            Protect sensitive data, secure credentials, and maintain verifiable compliance across every model invocation.
          </p>
        </div>

        {/* Security Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityItems.map((item) => {
            const Icon = item.icon
            return (
              <div 
                key={item.title}
                className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 hover:border-emerald-500/30 transition-all group flex flex-col justify-between shadow-sm dark:shadow-none"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Icon size={19} />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  <span>Enforced at Proxy Boundary</span>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

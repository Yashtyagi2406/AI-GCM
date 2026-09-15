'use client'

import React from 'react'

const PROVIDERS = [
  { name: 'OpenAI', models: 'GPT-4o, o1, o3-mini', tag: 'Native Proxy' },
  { name: 'Anthropic', models: 'Claude 3.5 Sonnet, Haiku, Opus', tag: 'Native Proxy' },
  { name: 'Google Gemini', models: 'Gemini 2.0 Flash, 1.5 Pro', tag: 'Direct Gateway' },
  { name: 'Azure OpenAI', models: 'Custom Deployments, Private VNet', tag: 'Enterprise' },
  { name: 'AWS Bedrock', models: 'Claude, Titan, Llama 3', tag: 'IAM Auth' },
  { name: 'Ollama', models: 'DeepSeek-R1, Llama 3.3', tag: 'Local Engine' },
  { name: 'vLLM', models: 'High-Throughput PagedAttention', tag: 'Self-Hosted' },
  { name: 'LocalAI', models: 'Private Air-Gapped Instances', tag: 'On-Prem' },
]

export function ProviderBar() {
  return (
    <section className="border-y border-white/[0.08] bg-slate-950/60 py-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
            One control plane. Every AI provider.
          </p>
        </div>

        {/* Monochrome Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 items-center">
          {PROVIDERS.map((p) => (
            <div
              key={p.name}
              className="group flex flex-col items-center justify-center p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all text-center"
            >
              <span className="text-xs font-mono font-bold text-slate-300 group-hover:text-white transition-colors">
                {p.name}
              </span>
              <span className="text-[9px] text-slate-400 mt-1 font-mono truncate max-w-full">
                {p.tag}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Transparent provider failover and unified API credential vault (AES-256-GCM)</span>
        </div>
      </div>
    </section>
  )
}

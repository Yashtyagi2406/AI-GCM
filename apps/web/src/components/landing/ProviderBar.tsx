'use client'

import React from 'react'
import {
  OpenAILogo,
  AnthropicLogo,
  GoogleGeminiLogo,
  AzureOpenAILogo,
  AWSBedrockLogo,
  OllamaLogo,
  VLLMLogo,
  LocalAILogo,
} from './ProviderLogos'

const PROVIDERS = [
  { 
    name: 'OpenAI', 
    models: 'GPT-4o, o1, o3-mini', 
    tag: 'Native Proxy',
    icon: OpenAILogo,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  { 
    name: 'Anthropic', 
    models: 'Claude 3.5 Sonnet, Haiku, Opus', 
    tag: 'Native Proxy',
    icon: AnthropicLogo,
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  { 
    name: 'Google Gemini', 
    models: 'Gemini 2.0 Flash, 1.5 Pro', 
    tag: 'Direct Gateway',
    icon: GoogleGeminiLogo,
    iconColor: '',
  },
  { 
    name: 'Azure OpenAI', 
    models: 'Custom Deployments, Private VNet', 
    tag: 'Enterprise',
    icon: AzureOpenAILogo,
    iconColor: '',
  },
  { 
    name: 'AWS Bedrock', 
    models: 'Claude, Titan, Llama 3', 
    tag: 'IAM Auth',
    icon: AWSBedrockLogo,
    iconColor: '',
  },
  { 
    name: 'Ollama', 
    models: 'DeepSeek-R1, Llama 3.3', 
    tag: 'Local Engine',
    icon: OllamaLogo,
    iconColor: 'text-slate-800 dark:text-slate-200',
  },
  { 
    name: 'vLLM', 
    models: 'High-Throughput PagedAttention', 
    tag: 'Self-Hosted',
    icon: VLLMLogo,
    iconColor: '',
  },
  { 
    name: 'LocalAI', 
    models: 'Private Air-Gapped Instances', 
    tag: 'On-Prem',
    icon: LocalAILogo,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
]

export function ProviderBar() {
  return (
    <section className="border-y border-slate-200 dark:border-white/10 dark:bg-slate-950/80 bg-white/90 py-10 relative overflow-hidden backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title with high visibility */}
        <div className="text-center mb-7">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
            One control plane. Every AI provider.
          </p>
        </div>

        {/* Provider Cards Grid with Official Logos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5 items-stretch">
          {PROVIDERS.map((p) => {
            const Icon = p.icon
            return (
              <div
                key={p.name}
                className="group flex flex-col items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800/90 hover:border-violet-500/50 dark:hover:border-violet-400/50 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-center"
              >
                {/* Provider Logo */}
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:border-violet-500/40 transition-all shadow-xs">
                  <Icon className={`w-5 h-5 ${p.iconColor}`} />
                </div>

                {/* Provider Name */}
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {p.name}
                </span>

                {/* Tag Badge */}
                <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/5 truncate max-w-full">
                  {p.tag}
                </span>
              </div>
            )
          })}
        </div>

        {/* High-visibility Status Guarantee */}
        <div className="mt-7 flex items-center justify-center gap-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
          <span>Transparent provider failover and unified API credential vault (AES-256-GCM)</span>
        </div>

      </div>
    </section>
  )
}

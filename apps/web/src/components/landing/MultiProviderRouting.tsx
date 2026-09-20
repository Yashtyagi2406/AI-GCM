'use client'

import React from 'react'
import { Network, ArrowDown } from 'lucide-react'
import {
  OpenAILogo,
  AnthropicLogo,
  GoogleGeminiLogo,
  AzureOpenAILogo,
  AWSBedrockLogo,
  OllamaLogo,
  VLLMLogo,
} from './ProviderLogos'

export function MultiProviderRouting() {
  return (
    <section className="py-24 sm:py-32 dark:bg-black/25 bg-white/40 relative border-b border-slate-200 dark:border-white/[0.08] backdrop-blur-[3px] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-mono font-bold mb-4">
            <Network size={14} />
            <span>UNIFIED ROUTING GATEWAY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
            One gateway. Every model.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-700 dark:text-slate-300 font-medium">
            Stop building redundant security filters, budget trackers, and logging systems for every separate provider SDK.
          </p>
        </div>

        {/* Visual Multi-Route Tree */}
        <div className="mt-16 max-w-4xl mx-auto p-6 sm:p-10 rounded-2xl border border-slate-300 dark:border-white/10 bg-white/95 dark:bg-slate-950/90 shadow-2xl">
          
          {/* Top: Application Workloads */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center font-mono text-xs shadow-sm">
              <span className="text-slate-950 dark:text-white font-bold block text-sm">ALL APPLICATION WORKLOADS</span>
              <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium mt-0.5 block">
                Backend Services · Internal AI Agents · Web Apps · Batch Workers
              </span>
            </div>

            <div className="py-4 flex flex-col items-center text-violet-600 dark:text-violet-400">
              <div className="w-0.5 h-6 bg-gradient-to-b from-slate-400 dark:from-slate-600 to-violet-500" />
              <ArrowDown size={16} className="-mt-1" />
            </div>
          </div>

          {/* Center: AI-GCM Proxy Nexus */}
          <div className="max-w-lg mx-auto p-6 rounded-2xl border-2 border-violet-500/50 bg-violet-50/90 dark:bg-violet-950/30 text-center font-mono relative shadow-xl shadow-violet-500/10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-200/80 dark:bg-violet-500/20 text-violet-800 dark:text-violet-300 text-[10px] font-bold uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400 animate-pulse" />
              Central Control Plane
            </div>
            <h4 className="text-base font-bold text-slate-950 dark:text-white">AI-GCM TRANSPARENT PROXY</h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
              Uniform DLP · Central OPA Policies · Hard Budget Caps · SHA-256 Audit Chain
            </p>
          </div>

          {/* Tree Branches downwards */}
          <div className="py-4 flex flex-col items-center text-violet-600 dark:text-violet-400">
            <div className="w-0.5 h-6 bg-gradient-to-b from-violet-500 to-slate-400 dark:to-slate-600" />
            <ArrowDown size={16} className="-mt-1" />
          </div>

          {/* Target Model Endpoints with Logos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            
            {/* Anthropic */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-center hover:border-amber-500/50 transition-all shadow-sm group">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center mx-auto mb-2.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <AnthropicLogo className="w-5 h-5" />
              </div>
              <p className="text-slate-950 dark:text-white font-bold text-sm">Anthropic</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Claude 3.5 Sonnet / Opus / Haiku</p>
              <span className="text-[10px] text-amber-800 dark:text-amber-300 mt-2.5 block bg-amber-100 dark:bg-amber-500/15 py-1 rounded-md font-bold">
                Standard Completions
              </span>
            </div>

            {/* OpenAI */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-center hover:border-emerald-500/50 transition-all shadow-sm group">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mx-auto mb-2.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <OpenAILogo className="w-5 h-5" />
              </div>
              <p className="text-slate-950 dark:text-white font-bold text-sm">OpenAI</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">GPT-4o / o1 / o3-mini</p>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 mt-2.5 block bg-emerald-100 dark:bg-emerald-500/15 py-1 rounded-md font-bold">
                Reasoning &amp; Chat
              </span>
            </div>

            {/* Google Gemini */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-center hover:border-sky-500/50 transition-all shadow-sm group">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                <GoogleGeminiLogo className="w-5 h-5" />
              </div>
              <p className="text-slate-950 dark:text-white font-bold text-sm">Google Gemini</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Gemini 2.0 Flash / 1.5 Pro</p>
              <span className="text-[10px] text-sky-800 dark:text-sky-300 mt-2.5 block bg-sky-100 dark:bg-sky-500/15 py-1 rounded-md font-bold">
                Multimodal Gateway
              </span>
            </div>

          </div>

          {/* Bottom Secondary Targets with Logos */}
          <div className="mt-5 p-3.5 rounded-xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-center font-mono text-xs flex flex-wrap items-center justify-center gap-4">
            <span className="text-slate-700 dark:text-slate-400 font-medium">Also seamlessly routes to:</span>
            
            <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
              <AzureOpenAILogo className="w-3.5 h-3.5" />
              <span>Azure OpenAI</span>
            </div>
            <span className="text-slate-400 dark:text-slate-600">·</span>

            <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
              <AWSBedrockLogo className="w-3.5 h-3.5" />
              <span>AWS Bedrock</span>
            </div>
            <span className="text-slate-400 dark:text-slate-600">·</span>

            <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
              <OllamaLogo className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span>Ollama</span>
            </div>
            <span className="text-slate-400 dark:text-slate-600">·</span>

            <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
              <VLLMLogo className="w-3.5 h-3.5" />
              <span>vLLM (Self-Hosted)</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

'use client'

import React, { useState } from 'react'
import { Terminal, Copy, Check, Play, CheckCircle2, ArrowRight } from 'lucide-react'

export function DeveloperExperience() {
  const [activeTab, setActiveTab] = useState<'cli' | 'node' | 'python'>('node')
  const [copied, setCopied] = useState(false)

  const snippets = {
    cli: `# 1. Clone & run full stack locally
git clone https://github.com/yashtyagi2406/AI-GCM.git
cd ai-gcm
cp .env.example .env

# 2. Boot up proxy, Kafka, ClickHouse, Postgres & ML service
make dev

# 3. Test through the transparent proxy
curl http://localhost:8080/v1/chat/completions \\
  -H "Authorization: Bearer aigcm_live_79a2..." \\
  -H "Content-Type: application/json" \\
  -d '{"model": "claude-3-5-sonnet", "messages": [{"role": "user", "content": "Ping"}]}'`,
    
    node: `import OpenAI from 'openai'

// Standard OpenAI SDK client pointing at your AI-GCM Proxy
const client = new OpenAI({
  apiKey: process.env.AIGCM_API_KEY,
  baseURL: "https://ai-gcm.internal.company.com/v1"
})

// Call any supported provider using identical syntax
const completion = await client.chat.completions.create({
  model: "claude-3-5-sonnet", // Transparently routed & budget-gated
  messages: [{ role: "user", content: "Summarize deployment logs" }],
  stream: true,
})

for await (const chunk of completion) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '')
}`,

    python: `from openai import OpenAI
import os

# Drop-in Python SDK client
client = OpenAI(
    api_key=os.environ.get("AIGCM_API_KEY"),
    base_url="https://ai-gcm.internal.company.com/v1"
)

# Seamless multi-provider invocation
response = client.chat.completions.create(
    model="gpt-4o",  # Evaluated by OPA & inspected by DLP
    messages=[{"role": "user", "content": "Extract financial table"}]
)

print(response.choices[0].message.content)`
  }

  const copyCode = () => {
    navigator.clipboard.writeText(snippets[activeTab])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="py-24 sm:py-32 bg-[#030712] relative border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-violet-500/25 bg-violet-500/10 text-violet-400 text-xs font-mono mb-4">
            <Terminal size={13} />
            <span>DEVELOPER EXPERIENCE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Drop it into your stack. <br />Keep your code.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            Configure once via environment variables. Your teams continue using official SDKs with zero breaking changes or proprietary lock-in.
          </p>
        </div>

        {/* Code & Live Terminal Simulation */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Code Editor (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-slate-950/90 shadow-2xl overflow-hidden flex flex-col justify-between">
            <div>
              {/* Tabs Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('node')}
                    className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                      activeTab === 'node' 
                        ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Node.js / TS
                  </button>
                  <button
                    onClick={() => setActiveTab('python')}
                    className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                      activeTab === 'python' 
                        ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Python
                  </button>
                  <button
                    onClick={() => setActiveTab('cli')}
                    className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                      activeTab === 'cli' 
                        ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    CLI / cURL
                  </button>
                </div>

                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Editor Body */}
              <div className="p-5 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed whitespace-pre">
                {snippets[activeTab]}
              </div>
            </div>

            <div className="p-4 border-t border-white/[0.06] bg-black/40 text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>Standard OpenAI &amp; Anthropic wire protocol</span>
              <span className="text-emerald-400 font-medium">100% API Compatibility</span>
            </div>
          </div>

          {/* Right: Simulated Proxy Trace Terminal (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-violet-500/30 bg-[#060a12] p-5 font-mono text-xs shadow-2xl flex flex-col justify-between">
            <div>
              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-[11px] text-white font-bold">ai-gcm-proxy.log</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  STREAMING
                </span>
              </div>

              {/* Execution Steps */}
              <div className="space-y-3 text-[11px]">
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-emerald-400 font-bold">Request accepted</span>
                    <p className="text-[10px] text-slate-500">POST /v1/chat/completions (model: claude-3-5-sonnet)</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-emerald-400 font-bold">API Key verified</span>
                    <p className="text-[10px] text-slate-500">Org: Acme Corp · Team: Engineering · Latency: 0.3ms</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-emerald-400 font-bold">In-memory DLP passed</span>
                    <p className="text-[10px] text-slate-500">Scanned 1,840 bytes · 0 PII patterns matched (0.5ms)</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-emerald-400 font-bold">OPA Policy evaluated</span>
                    <p className="text-[10px] text-slate-500">Rule production-ai: ALLOW (0.4ms)</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-emerald-400 font-bold">Budget verified</span>
                    <p className="text-[10px] text-slate-500">Team balance: $2,550 remaining of $15,000 (0.2ms)</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-emerald-400 font-bold">Provider request forwarded</span>
                    <p className="text-[10px] text-slate-500">AES-256 Key decrypted &amp; injected into upstream headers</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-emerald-400 font-bold">Usage asynchronously recorded</span>
                    <p className="text-[10px] text-slate-500">Emitted event to Kafka: usage-events (0.0ms delay to client)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span>Overall Proxy Overhead:</span>
              <span className="text-violet-300 font-bold">1.8 ms total</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

'use client'
import { useState } from 'react'
import { Key, Plus, RotateCcw, Trash2, Copy, Eye, EyeOff, Clock, CheckCircle, AlertCircle } from 'lucide-react'

// ── Mock Data ──────────────────────────────────────────────────────────────────
const KEYS = [
  {
    id: '1', provider: 'anthropic', label: 'Production — Claude',
    preview: 'sk-ant-ap1••',  hash: 'a8f3c912••••••••••••••••',
    active: true, lastUsed: '2 min ago', expires: null, rotateAt: '2026-08-01',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
  },
  {
    id: '2', provider: 'openai', label: 'Production — GPT',
    preview: 'sk-proj-••••••', hash: 'b2d8f441••••••••••••••••',
    active: true, lastUsed: '8 min ago', expires: null, rotateAt: '2026-08-15',
    models: ['gpt-4o', 'gpt-4o-mini', 'o3'],
  },
  {
    id: '3', provider: 'google', label: 'Production — Gemini',
    preview: 'AIzaSy••••••',   hash: 'c5e1a882••••••••••••••••',
    active: true, lastUsed: '1h ago', expires: '2026-09-01', rotateAt: null,
    models: ['gemini-2.0-flash', 'gemini-2.5-pro'],
  },
  {
    id: '4', provider: 'openai', label: 'Dev / Staging',
    preview: 'sk-dev-••••••',  hash: 'd4c9b773••••••••••••••••',
    active: false, lastUsed: '3 days ago', expires: null, rotateAt: null,
    models: ['gpt-4o-mini'],
  },
]

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: 'from-violet-500 to-purple-600',
  openai:    'from-blue-500 to-cyan-600',
  google:    'from-emerald-500 to-teal-600',
  azure:     'from-amber-500 to-orange-600',
}

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Anthropic', openai: 'OpenAI', google: 'Google', azure: 'Azure',
}

function AddKeyModal({ onClose }: { onClose: () => void }) {
  const [show, setShow] = useState(false)
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card w-full max-w-md mx-4 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-white">Add API Key</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Provider</label>
            <select className="w-full glass text-sm text-slate-300 px-3 py-2 rounded-lg outline-none cursor-pointer">
              <option>anthropic</option><option>openai</option>
              <option>google</option><option>azure</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Label</label>
            <input placeholder="e.g. Production — Claude"
              className="w-full glass text-sm text-slate-200 px-3 py-2 rounded-lg outline-none placeholder:text-slate-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">API Key</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} placeholder="sk-••••••••••••••••••••"
                className="w-full glass text-sm text-slate-200 px-3 py-2 pr-10 rounded-lg outline-none placeholder:text-slate-600 font-mono" />
              <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5">Key is encrypted with AES-256-GCM before storage. Never stored in plaintext.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Allowed Models (optional)</label>
            <input placeholder="claude-3-5-sonnet-20241022, gpt-4o"
              className="w-full glass text-sm text-slate-200 px-3 py-2 rounded-lg outline-none placeholder:text-slate-600" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm text-slate-400 glass rounded-lg transition-colors hover:text-slate-200">Cancel</button>
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors">Save Key</button>
        </div>
      </div>
    </div>
  )
}

export default function KeysPage() {
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  function copyHash(id: string, hash: string) {
    navigator.clipboard.writeText(hash)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="p-6 space-y-6">
      {showModal && <AddKeyModal onClose={() => setShowModal(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">API Keys</h1>
          <p className="text-sm text-slate-500 mt-0.5">Encrypted provider key vault — keys are never shown in plaintext</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={14} /> Add Key
        </button>
      </div>

      {/* Security Banner */}
      <div className="glass-card p-4 border-violet-500/20 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0 mt-0.5">
          <Key size={15} className="text-violet-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">AES-256-GCM Encryption</p>
          <p className="text-xs text-slate-400 mt-0.5">
            All API keys are encrypted at rest using AES-256-GCM with a hardware-backed master key.
            Only the key hash is shown for identification. Keys are never logged or transmitted in plaintext.
          </p>
        </div>
      </div>

      {/* Key Cards */}
      <div className="space-y-3">
        {KEYS.map(key => (
          <div key={key.id}
            className={`glass-card p-5 hover:border-white/[0.12] transition-all ${!key.active ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${PROVIDER_COLORS[key.provider] || 'from-slate-500 to-slate-600'} flex items-center justify-center shrink-0`}>
                  <Key size={16} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{key.label}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                      ${key.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-500'}`}>
                      {key.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">{PROVIDER_LABELS[key.provider]}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors" title="Rotate key">
                  <RotateCcw size={14} />
                </button>
                <button className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Revoke key">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Key details */}
            <div className="mt-4 grid grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="bg-white/[0.03] rounded-lg p-3">
                <p className="text-[10px] text-slate-600 font-medium mb-1">KEY HASH (SHA-256)</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-400 font-mono truncate">{key.hash}</p>
                  <button onClick={() => copyHash(key.id, key.hash)}
                    className="shrink-0 text-slate-600 hover:text-slate-400 transition-colors">
                    {copied === key.id ? <CheckCircle size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <p className="text-[10px] text-slate-600 font-medium mb-1">LAST USED</p>
                <div className="flex items-center gap-1.5">
                  <Clock size={11} className="text-slate-600" />
                  <p className="text-xs text-slate-400">{key.lastUsed}</p>
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <p className="text-[10px] text-slate-600 font-medium mb-1">EXPIRES</p>
                <p className="text-xs text-slate-400">{key.expires || 'Never'}</p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <p className="text-[10px] text-slate-600 font-medium mb-1">ROTATE AT</p>
                <div className="flex items-center gap-1.5">
                  {key.rotateAt ? <AlertCircle size={11} className="text-amber-500" /> : <CheckCircle size={11} className="text-slate-600" />}
                  <p className="text-xs text-slate-400">{key.rotateAt || 'Not scheduled'}</p>
                </div>
              </div>
            </div>

            {/* Allowed models */}
            {key.models.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {key.models.map(m => (
                  <span key={m} className="text-[10px] font-mono bg-white/[0.04] border border-white/[0.07] text-slate-400 px-2 py-0.5 rounded-md">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

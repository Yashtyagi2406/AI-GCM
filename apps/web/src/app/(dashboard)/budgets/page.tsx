'use client'
import { useState } from 'react'
import { Wallet, Plus, Trash2, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

// ── Mock Data ──────────────────────────────────────────────────────────────────
const budgets = [
  {
    id: '1', name: 'Engineering Team Budget', scope: 'team',  scopeName: 'Engineering',
    period: 'monthly', limit: 15000, spent: 12450, hardLimit: false,
    thresholds: [50, 75, 90, 100], active: true,
  },
  {
    id: '2', name: 'Organization Budget',    scope: 'org',   scopeName: 'Acme Corp',
    period: 'monthly', limit: 37500, spent: 24891, hardLimit: false,
    thresholds: [50, 75, 90, 100], active: true,
  },
  {
    id: '3', name: 'Data Science Budget',    scope: 'team',  scopeName: 'Data Science',
    period: 'monthly', limit: 5500,  spent: 5100,  hardLimit: true,
    thresholds: [75, 90, 100], active: true,
  },
  {
    id: '4', name: 'Product Budget',         scope: 'team',  scopeName: 'Product',
    period: 'monthly', limit: 6000,  spent: 4200,  hardLimit: false,
    thresholds: [50, 75, 90, 100], active: true,
  },
  {
    id: '5', name: 'Customer Ops Budget',    scope: 'team',  scopeName: 'Customer Ops',
    period: 'monthly', limit: 4000,  spent: 1800,  hardLimit: false,
    thresholds: [50, 75, 90, 100], active: false,
  },
]

function UtilBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? 'from-red-500 to-rose-600'
              : pct >= 75 ? 'from-amber-500 to-orange-500'
              : 'from-emerald-500 to-teal-500'
  const StatusIcon = pct >= 90 ? XCircle : pct >= 75 ? AlertTriangle : CheckCircle
  const textColor  = pct >= 90 ? 'text-red-400' : pct >= 75 ? 'text-amber-400' : 'text-emerald-400'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <div className={`flex items-center gap-1 ${textColor} text-xs font-semibold w-16`}>
        <StatusIcon size={12} />
        {pct.toFixed(0)}%
      </div>
    </div>
  )
}

type BudgetEntry = typeof budgets[number]

function BudgetModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card w-full max-w-md mx-4 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-white">Create Budget</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">✕</button>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Budget Name', placeholder: 'e.g. Engineering Team Budget', type: 'text' },
            { label: 'Limit (USD)', placeholder: '5000', type: 'number' },
          ].map(({ label, placeholder, type }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
              <input type={type} placeholder={placeholder}
                className="w-full glass text-sm text-slate-200 px-3 py-2 rounded-lg outline-none placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Scope Type</label>
            <select className="w-full glass text-sm text-slate-300 px-3 py-2 rounded-lg outline-none cursor-pointer">
              <option>org</option><option>team</option><option>user</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Period</label>
            <select className="w-full glass text-sm text-slate-300 px-3 py-2 rounded-lg outline-none cursor-pointer">
              <option>monthly</option><option>weekly</option><option>quarterly</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-slate-300 font-medium">Hard Limit</p>
              <p className="text-xs text-slate-500">Block requests when budget is reached</p>
            </div>
            <button className="text-slate-600 hover:text-violet-400 transition-colors">
              <ToggleLeft size={28} />
            </button>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 glass rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors">
            Create Budget
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BudgetsPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="p-6 space-y-6">
      {showModal && <BudgetModal onClose={() => setShowModal(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Budgets</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage spend limits across org, teams, and users</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={14} /> New Budget
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Budgets',  value: '4',     color: 'text-emerald-400' },
          { label: 'Budgets at Risk', value: '2',     color: 'text-amber-400'   },
          { label: 'Over Budget',     value: '0',     color: 'text-red-400'     },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4 text-center">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Budget List */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">All Budgets</h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {budgets.map(b => {
            const pct = (b.spent / b.limit) * 100
            return (
              <div key={b.id} className={`px-5 py-4 hover:bg-white/[0.02] transition-colors ${!b.active ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{b.name}</p>
                      {b.hardLimit && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
                          HARD LIMIT
                        </span>
                      )}
                      {!b.active && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-500">
                          INACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 capitalize">{b.scope} · {b.scopeName} · {b.period}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-slate-600 hover:text-violet-400 transition-colors p-1.5 rounded-lg hover:bg-violet-500/10">
                      {b.active ? <ToggleRight size={18} className="text-violet-400" /> : <ToggleLeft size={18} />}
                    </button>
                    <button className="text-slate-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <UtilBar pct={pct} />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-600">
                    Spent <span className="text-slate-400">${b.spent.toLocaleString()}</span> of <span className="text-slate-400">${b.limit.toLocaleString()}</span>
                  </span>
                  <span className="text-xs text-slate-600">
                    Remaining <span className="text-slate-400">${(b.limit - b.spent).toLocaleString()}</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { BookOpen, Search, Filter, ShieldAlert, CheckCircle, XCircle, Download } from 'lucide-react'

// ── Mock Data ──────────────────────────────────────────────────────────────────
const AUDIT_ROWS = [
  { id: 'req-001', user: 'alice@acme.com', team: 'Engineering', provider: 'anthropic', model: 'claude-3-5-sonnet-20241022',
    promptTokens: 1240, completionTokens: 820,   cost: 0.0156, latencyMs: 1420, status: 'success',  dlp: false, policy: 'allow',   time: '14:52:33' },
  { id: 'req-002', user: 'bob@acme.com',   team: 'Data Science', provider: 'openai',    model: 'gpt-4o',
    promptTokens: 580,  completionTokens: 0,     cost: 0,      latencyMs: 12,   status: 'blocked',  dlp: true,  policy: 'block',   time: '14:51:08' },
  { id: 'req-003', user: 'carol@acme.com', team: 'Engineering', provider: 'anthropic', model: 'claude-3-5-haiku-20241022',
    promptTokens: 340,  completionTokens: 210,   cost: 0.0011, latencyMs: 680,  status: 'success',  dlp: false, policy: 'allow',   time: '14:49:52' },
  { id: 'req-004', user: 'dan@acme.com',   team: 'Product',     provider: 'openai',    model: 'gpt-4o-mini',
    promptTokens: 920,  completionTokens: 640,   cost: 0.0005, latencyMs: 390,  status: 'success',  dlp: false, policy: 'allow',   time: '14:48:17' },
  { id: 'req-005', user: 'eve@acme.com',   team: 'Sales',       provider: 'openai',    model: 'gpt-4o',
    promptTokens: 1100, completionTokens: 0,     cost: 0,      latencyMs: 8,    status: 'blocked',  dlp: false, policy: 'block',   time: '14:47:41' },
  { id: 'req-006', user: 'frank@acme.com', team: 'Customer Ops',provider: 'google',    model: 'gemini-2.0-flash',
    promptTokens: 480,  completionTokens: 320,   cost: 0.0001, latencyMs: 510,  status: 'success',  dlp: false, policy: 'allow',   time: '14:46:09' },
  { id: 'req-007', user: 'alice@acme.com', team: 'Engineering', provider: 'anthropic', model: 'claude-3-5-sonnet-20241022',
    promptTokens: 2100, completionTokens: 1400,  cost: 0.0272, latencyMs: 2180, status: 'success',  dlp: false, policy: 'allow',   time: '14:44:55' },
  { id: 'req-008', user: 'bob@acme.com',   team: 'Data Science', provider: 'openai',   model: 'gpt-4o',
    promptTokens: 760,  completionTokens: 520,   cost: 0.0071, latencyMs: 840,  status: 'success',  dlp: false, policy: 'allow',   time: '14:43:22' },
]

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: 'text-violet-400', openai: 'text-blue-400', google: 'text-emerald-400', azure: 'text-amber-400',
}

export default function AuditPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'blocked' | 'error'>('all')
  const [dlpOnly, setDlpOnly] = useState(false)

  const filtered = AUDIT_ROWS.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (dlpOnly && !r.dlp) return false
    if (search) {
      const q = search.toLowerCase()
      return r.user.includes(q) || r.model.includes(q) || r.team.toLowerCase().includes(q) || r.id.includes(q)
    }
    return true
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Audit Log</h1>
          <p className="text-sm text-slate-500 mt-0.5">Immutable record of every AI request through the proxy</p>
        </div>
        <button className="flex items-center gap-2 glass text-sm text-slate-300 px-4 py-2 rounded-lg hover:text-white transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by user, model, team, request ID…"
            className="w-full glass text-sm text-slate-300 pl-8 pr-3 py-2 rounded-lg outline-none placeholder:text-slate-600"
          />
        </div>
        <div className="flex rounded-lg overflow-hidden border border-white/[0.08]">
          {(['all', 'success', 'blocked', 'error'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize
                ${statusFilter === s ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'}`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={() => setDlpOnly(!dlpOnly)}
          className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border transition-colors
            ${dlpOnly ? 'bg-red-500/15 border-red-500/30 text-red-400' : 'glass text-slate-400 hover:text-slate-200'}`}>
          <ShieldAlert size={12} /> DLP Only
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Requests',  value: AUDIT_ROWS.length },
          { label: 'Blocked',         value: AUDIT_ROWS.filter(r => r.status === 'blocked').length, color: 'text-red-400' },
          { label: 'DLP Violations',  value: AUDIT_ROWS.filter(r => r.dlp).length,                  color: 'text-amber-400' },
          { label: 'Total Cost',      value: '$' + AUDIT_ROWS.reduce((s, r) => s + r.cost, 0).toFixed(4) },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4 text-center">
            <p className={`text-xl font-bold ${color || 'text-white'}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Time', 'User', 'Model', 'Tokens In', 'Tokens Out', 'Cost', 'Latency', 'Status', 'Flags'].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-slate-600 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filtered.map(row => (
                <tr key={row.id} className="hover:bg-white/[0.03] transition-colors cursor-pointer group">
                  <td className="px-4 py-3 text-[11px] text-slate-600 font-mono whitespace-nowrap">{row.time}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-slate-300 font-medium">{row.user.split('@')[0]}</p>
                    <p className="text-[10px] text-slate-600">{row.team}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className={`text-[10px] font-mono font-medium ${PROVIDER_COLORS[row.provider] || 'text-slate-400'}`}>
                      {row.model}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 text-right">{row.promptTokens.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 text-right">{row.completionTokens.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-white font-semibold text-right">${row.cost.toFixed(4)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 text-right">{row.latencyMs}ms</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                      ${row.status === 'success' ? 'bg-emerald-500/10 text-emerald-400'
                       : row.status === 'blocked' ? 'bg-red-500/10 text-red-400'
                       : 'bg-amber-500/10 text-amber-400'}`}>
                      {row.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {row.dlp && <span title="DLP violation"><ShieldAlert size={12} className="text-red-400" /></span>}
                      {row.policy === 'block' && !row.dlp && <span title="Policy blocked"><XCircle size={12} className="text-red-400" /></span>}
                      {row.policy === 'allow' && <CheckCircle size={12} className="text-emerald-400 opacity-30" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-white/[0.05] flex items-center justify-between">
          <p className="text-xs text-slate-600">Showing {filtered.length} of {AUDIT_ROWS.length} entries</p>
          <div className="flex items-center gap-2">
            <button className="text-xs text-slate-500 glass px-3 py-1.5 rounded-lg hover:text-slate-300 transition-colors disabled:opacity-30" disabled>
              ← Previous
            </button>
            <button className="text-xs text-slate-500 glass px-3 py-1.5 rounded-lg hover:text-slate-300 transition-colors">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

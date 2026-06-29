'use client'
import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts'
import { Activity, Zap, Users, MessageSquare, Filter } from 'lucide-react'

// ── Mock Data ──────────────────────────────────────────────────────────────────
const requestsByDay = [
  { date: 'Jun 8',  requests: 4200, tokens: 8400000  },
  { date: 'Jun 9',  requests: 4800, tokens: 9600000  },
  { date: 'Jun 10', requests: 5100, tokens: 10200000 },
  { date: 'Jun 11', requests: 4600, tokens: 9200000  },
  { date: 'Jun 12', requests: 5400, tokens: 10800000 },
  { date: 'Jun 13', requests: 6200, tokens: 12400000 },
  { date: 'Jun 14', requests: 5900, tokens: 11800000 },
]

const usageByUser = [
  { name: 'Alice Chen',    team: 'Engineering',   model: 'claude-3-5-sonnet', requests: 842, tokens: 1240000, cost: 1860 },
  { name: 'Bob Martinez',  team: 'Data Science',  model: 'gpt-4o',            requests: 621, tokens: 980000,  cost: 1540 },
  { name: 'Carol Wu',      team: 'Engineering',   model: 'claude-3-5-haiku',  requests: 1204, tokens: 560000, cost: 448  },
  { name: 'Dan Okafor',    team: 'Product',       model: 'gpt-4o-mini',       requests: 394, tokens: 720000,  cost: 108  },
  { name: 'Eve Larsson',   team: 'Data Science',  model: 'claude-3-5-sonnet', requests: 510, tokens: 840000,  cost: 1260 },
  { name: 'Frank Nguyen',  team: 'Customer Ops',  model: 'gemini-2.0-flash',  requests: 287, tokens: 420000,  cost: 32   },
]

const modelTokens = [
  { model: 'claude-3-5-haiku',  tokens: 18400000, color: '#8b5cf6' },
  { model: 'gpt-4o-mini',       tokens: 14200000, color: '#3b82f6' },
  { model: 'gemini-2.0-flash',  tokens: 12100000, color: '#10b981' },
  { model: 'claude-3-5-sonnet', tokens: 8600000,  color: '#a78bfa' },
  { model: 'gpt-4o',            tokens: 5400000,  color: '#60a5fa' },
]

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 text-xs shadow-xl">
      <p className="font-semibold text-white mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-medium">
            {typeof p.value === 'number' && p.value > 100000
              ? `${(p.value / 1e6).toFixed(1)}M`
              : p.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

const GROUP_OPTS = ['User', 'Team', 'Provider', 'Model']

export default function UsagePage() {
  const [groupBy, setGroupBy] = useState('User')
  const [search, setSearch] = useState('')

  const filtered = usageByUser.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.team.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Usage</h1>
          <p className="text-sm text-slate-500 mt-0.5">Token consumption and request volume breakdown</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <div className="flex rounded-lg overflow-hidden border border-white/[0.08]">
            {GROUP_OPTS.map(opt => (
              <button key={opt} onClick={() => setGroupBy(opt)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors
                  ${groupBy === opt ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests MTD',  value: '38,200',    icon: Activity,       grad: 'from-violet-500 to-indigo-600' },
          { label: 'Total Tokens MTD',    value: '68.4M',     icon: Zap,            grad: 'from-blue-500 to-cyan-600'    },
          { label: 'Active Users',        value: '342',        icon: Users,          grad: 'from-emerald-500 to-teal-600'  },
          { label: 'Avg Tokens / Request',value: '1,790',     icon: MessageSquare,  grad: 'from-amber-500 to-orange-600' },
        ].map(({ label, value, icon: Icon, grad }) => (
          <div key={label} className="glass-card p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-3`}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Requests over time */}
        <div className="xl:col-span-2 glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-1">Requests & Tokens Over Time</h2>
          <p className="text-xs text-slate-500 mb-4">Last 7 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={requestsByDay} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left"  tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} />
              <Tooltip content={<Tip />} />
              <Line yAxisId="left"  type="monotone" dataKey="requests" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Requests" />
              <Line yAxisId="right" type="monotone" dataKey="tokens"   stroke="#3b82f6" strokeWidth={2} dot={false} name="Tokens"   />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tokens by model */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-1">Tokens by Model</h2>
          <p className="text-xs text-slate-500 mb-4">MTD consumption</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={modelTokens} layout="vertical" margin={{ left: 8, right: 8 }}>
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 9 }}
                tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="model" tick={{ fill: '#94a3b8', fontSize: 9 }}
                axisLine={false} tickLine={false} width={100} />
              <Tooltip formatter={(v: any) => [`${(v / 1e6).toFixed(1)}M tokens`, '']}
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '12px' }} />
              <Bar dataKey="tokens" radius={[0, 4, 4, 0]}>
                {modelTokens.map((m, i) => <Cell key={i} fill={m.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Usage Table */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Usage by {groupBy}</h2>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users or teams…"
            className="glass text-sm text-slate-300 px-3 py-1.5 rounded-lg outline-none placeholder:text-slate-600 w-52"
          />
        </div>
        <div className="space-y-1">
          <div className="grid grid-cols-[1fr_100px_100px_80px_80px] text-[11px] text-slate-600 font-medium pb-2 border-b border-white/[0.05] px-3">
            <span>USER</span><span className="text-right">TEAM</span>
            <span className="text-right">REQUESTS</span><span className="text-right">TOKENS</span>
            <span className="text-right">COST</span>
          </div>
          {filtered.map(u => (
            <div key={u.name}
              className="grid grid-cols-[1fr_100px_100px_80px_80px] items-center px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors text-sm cursor-pointer">
              <div>
                <p className="text-slate-200 font-medium text-sm">{u.name}</p>
                <p className="text-[10px] text-slate-600 font-mono">{u.model}</p>
              </div>
              <span className="text-right text-slate-400 text-xs">{u.team}</span>
              <span className="text-right text-slate-300 text-xs">{u.requests.toLocaleString()}</span>
              <span className="text-right text-slate-300 text-xs">{(u.tokens / 1e6).toFixed(1)}M</span>
              <span className="text-right text-white font-semibold text-xs">${u.cost.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

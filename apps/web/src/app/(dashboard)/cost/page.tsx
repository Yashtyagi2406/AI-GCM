'use client'
import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts'
import { TrendingUp, DollarSign, Cpu, ArrowUpRight, Calendar } from 'lucide-react'

// ── Mock Data ──────────────────────────────────────────────────────────────────
const dailyCost = [
  { date: 'Jun 1',  anthropic: 1200, openai: 800,  google: 400,  azure: 200 },
  { date: 'Jun 2',  anthropic: 1400, openai: 950,  google: 380,  azure: 220 },
  { date: 'Jun 3',  anthropic: 1100, openai: 700,  google: 420,  azure: 190 },
  { date: 'Jun 4',  anthropic: 1800, openai: 1100, google: 500,  azure: 300 },
  { date: 'Jun 5',  anthropic: 2100, openai: 1300, google: 600,  azure: 280 },
  { date: 'Jun 6',  anthropic: 1950, openai: 1200, google: 550,  azure: 240 },
  { date: 'Jun 7',  anthropic: 2400, openai: 1450, google: 680,  azure: 310 },
  { date: 'Jun 8',  anthropic: 2200, openai: 1380, google: 620,  azure: 295 },
  { date: 'Jun 9',  anthropic: 2600, openai: 1550, google: 710,  azure: 330 },
  { date: 'Jun 10', anthropic: 2800, openai: 1700, google: 780,  azure: 360 },
  { date: 'Jun 11', anthropic: 2350, openai: 1420, google: 650,  azure: 280 },
  { date: 'Jun 12', anthropic: 2700, openai: 1600, google: 730,  azure: 340 },
  { date: 'Jun 13', anthropic: 3100, openai: 1850, google: 820,  azure: 390 },
  { date: 'Jun 14', anthropic: 2900, openai: 1750, google: 790,  azure: 370 },
]

const modelBreakdown = [
  { model: 'claude-3-5-sonnet', cost: 8200, requests: 1840, provider: 'anthropic' },
  { model: 'gpt-4o',            cost: 6100, requests: 980,  provider: 'openai'    },
  { model: 'claude-3-5-haiku',  cost: 4300, requests: 6200, provider: 'anthropic' },
  { model: 'gpt-4o-mini',       cost: 1700, requests: 4100, provider: 'openai'    },
  { model: 'gemini-2.0-flash',  cost: 2100, requests: 7800, provider: 'google'    },
  { model: 'gemini-2.5-pro',    cost: 1100, requests: 420,  provider: 'google'    },
]

const costPerReq = [
  { model: 'claude-3-5-sonnet', avg: 0.0045 },
  { model: 'gpt-4o',            avg: 0.0062 },
  { model: 'claude-3-5-haiku',  avg: 0.0007 },
  { model: 'gpt-4o-mini',       avg: 0.0004 },
  { model: 'gemini-2.0-flash',  avg: 0.0003 },
  { model: 'gemini-2.5-pro',    avg: 0.0026 },
]

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: '#8b5cf6',
  openai:    '#3b82f6',
  google:    '#10b981',
  azure:     '#f59e0b',
}

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 text-xs shadow-xl">
      <p className="font-semibold text-white mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-medium">${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

const RANGES = ['Last 7 Days', 'Last 14 Days', 'Month to Date', 'Last 30 Days']

export default function CostPage() {
  const [range, setRange] = useState('Last 14 Days')
  const sliced = range === 'Last 7 Days' ? dailyCost.slice(-7) : dailyCost

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Cost Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Detailed cost breakdown by provider, model, and team</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-500" />
          <select
            value={range}
            onChange={e => setRange(e.target.value)}
            className="glass text-sm text-slate-300 px-3 py-2 rounded-lg outline-none cursor-pointer"
          >
            {RANGES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Spend MTD',    value: '$24,891', sub: '+12% vs last month',    icon: DollarSign,  grad: 'from-violet-500 to-indigo-600' },
          { label: 'Daily Average',      value: '$1,778',  sub: 'Last 14 days',           icon: TrendingUp,  grad: 'from-blue-500 to-cyan-600'    },
          { label: 'Cost Per Request',   value: '$0.0024', sub: '↓ 8% efficiency gain',  icon: Cpu,         grad: 'from-emerald-500 to-teal-600'  },
          { label: 'Projected Month End',value: '$31,400', sub: 'At current velocity',   icon: ArrowUpRight, grad: 'from-amber-500 to-orange-600' },
        ].map(({ label, value, sub, icon: Icon, grad }) => (
          <div key={label} className="glass-card p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-3`}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{label}</p>
            <p className="text-xs text-slate-600 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Cost Trend Chart */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Daily Cost Trend</h2>
            <p className="text-xs text-slate-500 mt-0.5">Stacked by provider</p>
          </div>
          <div className="flex gap-4 text-[11px] text-slate-500">
            {Object.entries(PROVIDER_COLORS).map(([name, color]) => (
              <span key={name} className="flex items-center gap-1.5 capitalize">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />{name}
              </span>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={sliced} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              {Object.entries(PROVIDER_COLORS).map(([name, color]) => (
                <linearGradient key={name} id={`g-${name}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0}   />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} />
            <Tooltip content={<Tip />} />
            {Object.entries(PROVIDER_COLORS).map(([name, color]) => (
              <Area key={name} type="monotone" dataKey={name} stackId="1"
                stroke={color} fill={`url(#g-${name})`} strokeWidth={2} name={name} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Model Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Model cost bar */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-1">Cost by Model</h2>
          <p className="text-xs text-slate-500 mb-4">Total spend MTD</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={modelBreakdown} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `$${v}`}
                axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="model" tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false} tickLine={false} width={110} />
              <Tooltip formatter={(v: any) => [`$${v.toLocaleString()}`, 'Cost']}
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '12px' }} />
              <Bar dataKey="cost" radius={[0, 4, 4, 0]}
                fill="url(#barGrad)" />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Model table */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Model Cost Details</h2>
          <div className="space-y-1">
            <div className="grid grid-cols-[1fr_70px_80px_70px] text-[11px] text-slate-600 font-medium pb-2 border-b border-white/[0.05] px-2">
              <span>MODEL</span><span className="text-right">COST</span>
              <span className="text-right">REQUESTS</span><span className="text-right">AVG/REQ</span>
            </div>
            {modelBreakdown.map(m => (
              <div key={m.model} className="grid grid-cols-[1fr_70px_80px_70px] items-center px-2 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PROVIDER_COLORS[m.provider] }} />
                  <span className="text-slate-300 text-xs font-mono truncate">{m.model}</span>
                </div>
                <span className="text-right text-white font-semibold text-xs">${m.cost.toLocaleString()}</span>
                <span className="text-right text-slate-500 text-xs">{m.requests.toLocaleString()}</span>
                <span className="text-right text-slate-400 text-xs">${(m.cost / m.requests).toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

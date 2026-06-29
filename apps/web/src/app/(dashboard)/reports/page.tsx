'use client'
import { useState } from 'react'
import { FileText, Download, Calendar, TrendingUp, DollarSign, Cpu, Users, BarChart2 } from 'lucide-react'

// ── Mock Data ──────────────────────────────────────────────────────────────────
const MONTHLY_SUMMARY = [
  { month: 'Jan 2026', cost: 18200, requests: 28400, tokens: 48200000, users: 298 },
  { month: 'Feb 2026', cost: 21400, requests: 33100, tokens: 56800000, users: 311 },
  { month: 'Mar 2026', cost: 19800, requests: 30600, tokens: 52400000, users: 305 },
  { month: 'Apr 2026', cost: 23100, requests: 36800, tokens: 62100000, users: 318 },
  { month: 'May 2026', cost: 22200, requests: 34700, tokens: 58900000, users: 325 },
  { month: 'Jun 2026', cost: 24891, requests: 38200, tokens: 68400000, users: 342 },
]

const TEAM_REPORT = [
  { team: 'Engineering',  cost: 12450, requests: 18420, pct: 50.0 },
  { team: 'Data Science', cost: 5100,  requests: 6200,  pct: 20.5 },
  { team: 'Product',      cost: 4200,  requests: 6840,  pct: 16.9 },
  { team: 'Customer Ops', cost: 1800,  requests: 4820,  pct: 7.2  },
  { team: 'Sales',        cost: 1341,  requests: 1920,  pct: 5.4  },
]

const REPORT_TYPES = [
  { id: 'monthly',   label: 'Monthly Cost Report',   icon: DollarSign,  desc: 'Full cost breakdown by provider, model, and team' },
  { id: 'usage',     label: 'Usage Summary',         icon: BarChart2,   desc: 'Token consumption and request volume report' },
  { id: 'teams',     label: 'Team Spend Report',     icon: Users,       desc: 'Cost allocation per team with budget comparison' },
  { id: 'audit',     label: 'Audit Export',          icon: FileText,    desc: 'Full request log with DLP and policy decisions' },
]

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState('Jun 2026')
  const current = MONTHLY_SUMMARY.find(m => m.month === selectedMonth) ?? MONTHLY_SUMMARY[MONTHLY_SUMMARY.length - 1]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Generate and export usage and cost reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-500" />
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="glass text-sm text-slate-300 px-3 py-2 rounded-lg outline-none cursor-pointer"
          >
            {MONTHLY_SUMMARY.map(m => <option key={m.month}>{m.month}</option>)}
          </select>
        </div>
      </div>

      {/* Summary KPIs for selected month */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Cost',      value: `$${current.cost.toLocaleString()}`, icon: DollarSign, grad: 'from-violet-500 to-indigo-600' },
          { label: 'Total Requests',  value: current.requests.toLocaleString(),    icon: TrendingUp, grad: 'from-blue-500 to-cyan-600'    },
          { label: 'Total Tokens',    value: `${(current.tokens / 1e6).toFixed(1)}M`, icon: Cpu,   grad: 'from-emerald-500 to-teal-600'  },
          { label: 'Active Users',    value: current.users.toString(),             icon: Users,     grad: 'from-amber-500 to-orange-600'  },
        ].map(({ label, value, icon: Icon, grad }) => (
          <div key={label} className="glass-card p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-3`}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{label}</p>
            <p className="text-xs text-slate-600 mt-1">{selectedMonth}</p>
          </div>
        ))}
      </div>

      {/* Report generators */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Generate Report</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {REPORT_TYPES.map(({ id, label, icon: Icon, desc }) => (
            <div key={id} className="glass-card p-4 flex items-center justify-between hover:border-white/[0.12] transition-all group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center group-hover:bg-violet-500/25 transition-colors">
                  <Icon size={16} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 glass px-3 py-1.5 rounded-lg transition-colors shrink-0 ml-4">
                <Download size={12} /> Export
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly history table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Monthly History</h2>
          <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 glass px-3 py-1.5 rounded-lg transition-colors">
            <Download size={12} /> Export All
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {['Month', 'Total Cost', 'Requests', 'Tokens', 'Active Users', 'MoM Change'].map(h => (
                <th key={h} className="text-left text-[11px] font-semibold text-slate-600 px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {[...MONTHLY_SUMMARY].reverse().map((row, i, arr) => {
              const prev = arr[i + 1]
              const change = prev ? ((row.cost - prev.cost) / prev.cost) * 100 : null
              return (
                <tr key={row.month} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-3 text-sm text-white font-medium">{row.month}</td>
                  <td className="px-5 py-3 text-sm text-white font-semibold">${row.cost.toLocaleString()}</td>
                  <td className="px-5 py-3 text-sm text-slate-400">{row.requests.toLocaleString()}</td>
                  <td className="px-5 py-3 text-sm text-slate-400">{(row.tokens / 1e6).toFixed(1)}M</td>
                  <td className="px-5 py-3 text-sm text-slate-400">{row.users}</td>
                  <td className="px-5 py-3">
                    {change !== null && (
                      <span className={`text-xs font-semibold ${change >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Team allocation */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Team Cost Allocation — {selectedMonth}</h2>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {TEAM_REPORT.map(t => (
            <div key={t.team} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
              <span className="text-sm text-slate-300 font-medium w-32 shrink-0">{t.team}</span>
              <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                  style={{ width: `${t.pct}%` }} />
              </div>
              <span className="text-xs text-slate-500 w-10 text-right shrink-0">{t.pct}%</span>
              <span className="text-sm text-white font-semibold w-20 text-right shrink-0">${t.cost.toLocaleString()}</span>
              <span className="text-xs text-slate-600 w-20 text-right shrink-0">{t.requests.toLocaleString()} req</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

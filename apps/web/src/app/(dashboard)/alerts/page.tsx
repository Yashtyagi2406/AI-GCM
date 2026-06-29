'use client'
import { useState } from 'react'
import { Bell, XCircle, AlertTriangle, CheckCircle, ShieldAlert, TrendingUp, X, Filter } from 'lucide-react'

// ── Mock Data ──────────────────────────────────────────────────────────────────
const ALERTS = [
  {
    id: '1', type: 'budget_threshold', severity: 'critical', read: false,
    msg: 'Data Science team has reached 93% of monthly budget ($5,100 / $5,500)',
    entity: 'Data Science Team', time: '2 min ago',
  },
  {
    id: '2', type: 'velocity_spike', severity: 'warning', read: false,
    msg: 'Engineering team request velocity: 2.8× 7-day rolling average (last 1h)',
    entity: 'Engineering Team', time: '15 min ago',
  },
  {
    id: '3', type: 'dlp_violation', severity: 'critical', read: false,
    msg: 'PII detected in prompt — SSN pattern matched. Request blocked. User: alice@acme.com',
    entity: 'alice@acme.com', time: '32 min ago',
  },
  {
    id: '4', type: 'policy_block', severity: 'warning', read: true,
    msg: 'Blocked: gpt-4o requested by Sales team (not in model allowlist)',
    entity: 'Sales Team', time: '1h ago',
  },
  {
    id: '5', type: 'budget_threshold', severity: 'info', read: true,
    msg: 'Organization budget is at 66% utilization ($24,891 / $37,500)',
    entity: 'Acme Corp', time: '2h ago',
  },
  {
    id: '6', type: 'policy_block', severity: 'info', read: true,
    msg: 'Policy updated: Sales team model allowlist now includes gemini-2.0-flash',
    entity: 'System', time: '3h ago',
  },
]

type Alert = typeof ALERTS[number]

function alertIcon(type: string, severity: string) {
  if (type === 'dlp_violation' || type === 'budget_threshold' && severity === 'critical') return XCircle
  if (type === 'velocity_spike' || severity === 'warning') return TrendingUp
  if (type === 'policy_block') return ShieldAlert
  return CheckCircle
}

function severityStyle(s: string) {
  if (s === 'critical') return 'bg-red-500/10 text-red-400 border-red-500/20'
  if (s === 'warning')  return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
}

type Filter = 'all' | 'critical' | 'warning' | 'info'

export default function AlertsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [alerts, setAlerts] = useState(ALERTS)

  const filtered = alerts.filter(a => filter === 'all' || a.severity === filter)
  const unread   = alerts.filter(a => !a.read).length

  function dismiss(id: string) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))
  }
  function dismissAll() {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Alerts
            {unread > 0 && (
              <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time governance and cost alerts</p>
        </div>
        {unread > 0 && (
          <button onClick={dismissAll}
            className="text-sm text-slate-400 hover:text-slate-200 glass px-3 py-2 rounded-lg transition-colors">
            Mark all as read
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Critical', count: alerts.filter(a => a.severity === 'critical' && !a.read).length, color: 'text-red-400',    bg: 'bg-red-500/10' },
          { label: 'Warning',  count: alerts.filter(a => a.severity === 'warning'  && !a.read).length, color: 'text-amber-400',  bg: 'bg-amber-500/10' },
          { label: 'Info',     count: alerts.filter(a => a.severity === 'info'     && !a.read).length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(({ label, count, color, bg }) => (
          <button key={label} onClick={() => setFilter(label.toLowerCase() as Filter)}
            className={`glass-card p-4 text-center hover:border-white/[0.14] transition-all ${filter === label.toLowerCase() ? 'border-violet-500/30' : ''}`}>
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
              <Bell size={18} className={color} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
            <p className="text-xs text-slate-500 mt-0.5">Unread {label}</p>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <Filter size={13} className="text-slate-500" />
        {(['all', 'critical', 'warning', 'info'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors capitalize
              ${filter === f ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200 glass'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="glass-card p-12 text-center">
            <CheckCircle size={32} className="text-emerald-400 mx-auto mb-3" />
            <p className="text-white font-medium">All clear!</p>
            <p className="text-sm text-slate-500 mt-1">No alerts matching this filter.</p>
          </div>
        )}
        {filtered.map(alert => {
          const Icon = alertIcon(alert.type, alert.severity)
          const iconStyle = severityStyle(alert.severity)
          return (
            <div key={alert.id}
              className={`flex gap-3 p-4 rounded-xl border transition-all
                ${alert.read
                  ? 'bg-white/[0.02] border-white/[0.04] opacity-60'
                  : 'glass-card hover:border-white/[0.12]'}`}>
              <span className={`shrink-0 w-9 h-9 rounded-xl border ${iconStyle} flex items-center justify-center`}>
                <Icon size={15} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-slate-200 leading-snug">{alert.msg}</p>
                  {!alert.read && (
                    <button onClick={() => dismiss(alert.id)}
                      className="shrink-0 text-slate-600 hover:text-slate-400 transition-colors p-0.5">
                      <X size={13} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${iconStyle}`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-slate-600">{alert.entity}</span>
                  <span className="text-[10px] text-slate-700">·</span>
                  <span className="text-[10px] text-slate-600">{alert.time}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

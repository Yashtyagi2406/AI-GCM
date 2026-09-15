'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import {
  TrendingUp, TrendingDown, DollarSign, Users, ShieldAlert, Zap,
  Bell, CheckCircle, AlertTriangle, XCircle, ArrowUpRight, X, Check, ExternalLink
} from 'lucide-react'

// ── Time Periods Data Dictionary ───────────────────────────────────────────
type PeriodKey = 'mtd' | '7d' | '30d' | 'qtd'

interface PeriodData {
  label: string
  subtitle: string
  providerSubtitle: string
  kpis: {
    spend: { label: string; value: string; delta: number; deltaLabel: string }
    utilization: { label: string; value: string; delta: number; deltaLabel: string }
    users: { label: string; value: string; delta: number; deltaLabel: string }
    violations: { label: string; value: string; delta: number; deltaLabel: string }
  }
  costTrend: Array<{ date: string; anthropic: number; openai: number; google: number }>
  providerBreakdown: Array<{ name: string; value: number; color: string }>
  teams: Array<{ name: string; spend: number; budget: number; model: string; pct: number }>
}

const PERIOD_DATA: Record<PeriodKey, PeriodData> = {
  mtd: {
    label: 'Month to Date',
    subtitle: 'June 1 - June 15, 2026 · Acme Corp',
    providerSubtitle: 'MTD cost by provider',
    kpis: {
      spend: { label: 'Total Spend MTD', value: '$24,891', delta: 12, deltaLabel: '$12,609 remaining of $37.5k' },
      utilization: { label: 'Budget Utilization', value: '67%', delta: -3, deltaLabel: '$37,500 total limit' },
      users: { label: 'Active Users', value: '342', delta: 23, deltaLabel: '↑ 23 this month' },
      violations: { label: 'Policy Violations', value: '3', delta: -8, deltaLabel: '↓ 8 vs last month' },
    },
    costTrend: [
      { date: 'Jun 1', anthropic: 1200, openai: 800, google: 400 },
      { date: 'Jun 3', anthropic: 1400, openai: 950, google: 380 },
      { date: 'Jun 6', anthropic: 1100, openai: 700, google: 420 },
      { date: 'Jun 9', anthropic: 1800, openai: 1100, google: 500 },
      { date: 'Jun 12', anthropic: 2100, openai: 1300, google: 600 },
      { date: 'Jun 14', anthropic: 1950, openai: 1200, google: 550 },
      { date: 'Jun 15', anthropic: 2400, openai: 1450, google: 680 },
    ],
    providerBreakdown: [
      { name: 'Anthropic', value: 12450, color: '#8b5cf6' },
      { name: 'OpenAI',    value: 7800,  color: '#3b82f6' },
      { name: 'Google',    value: 3200,  color: '#10b981' },
      { name: 'Azure',     value: 1441,  color: '#f59e0b' },
    ],
    teams: [
      { name: 'Engineering',    spend: 12450, budget: 15000, model: 'claude-3-5-sonnet', pct: 83 },
      { name: 'Product',        spend: 4200,  budget: 6000,  model: 'gpt-4o',            pct: 70 },
      { name: 'Data Science',   spend: 5100,  budget: 5500,  model: 'claude-3-opus',     pct: 93 },
      { name: 'Customer Ops',   spend: 1800,  budget: 4000,  model: 'gpt-4o-mini',       pct: 45 },
      { name: 'Sales',          spend: 1341,  budget: 3000,  model: 'gemini-2.0-flash',  pct: 45 },
    ]
  },
  '7d': {
    label: 'Last 7 Days',
    subtitle: 'June 9 - June 15, 2026 · Acme Corp',
    providerSubtitle: 'Last 7 days cost by provider',
    kpis: {
      spend: { label: 'Total Spend (7d)', value: '$6,840', delta: -5, deltaLabel: 'vs prior 7 days ($7,200)' },
      utilization: { label: 'Weekly Pace', value: '18.2%', delta: -2, deltaLabel: 'On track with monthly cap' },
      users: { label: 'Active Users (7d)', value: '289', delta: 14, deltaLabel: '↑ 36 active this week' },
      violations: { label: 'Policy Violations (7d)', value: '1', delta: -67, deltaLabel: '↓ 2 vs previous week' },
    },
    costTrend: [
      { date: 'Jun 9',  anthropic: 480, openai: 310, google: 140 },
      { date: 'Jun 10', anthropic: 520, openai: 340, google: 160 },
      { date: 'Jun 11', anthropic: 490, openai: 290, google: 150 },
      { date: 'Jun 12', anthropic: 560, openai: 380, google: 180 },
      { date: 'Jun 13', anthropic: 610, openai: 410, google: 210 },
      { date: 'Jun 14', anthropic: 580, openai: 390, google: 190 },
      { date: 'Jun 15', anthropic: 640, openai: 440, google: 210 },
    ],
    providerBreakdown: [
      { name: 'Anthropic', value: 3420, color: '#8b5cf6' },
      { name: 'OpenAI',    value: 2180, color: '#3b82f6' },
      { name: 'Google',    value: 890,  color: '#10b981' },
      { name: 'Azure',     value: 350,  color: '#f59e0b' },
    ],
    teams: [
      { name: 'Engineering',    spend: 3420, budget: 3750, model: 'claude-3-5-sonnet', pct: 91 },
      { name: 'Data Science',   spend: 1380, budget: 1375, model: 'claude-3-opus',     pct: 100 },
      { name: 'Product',        spend: 1150, budget: 1500, model: 'gpt-4o',            pct: 77 },
      { name: 'Customer Ops',   spend: 490,  budget: 1000, model: 'gpt-4o-mini',       pct: 49 },
      { name: 'Sales',          spend: 400,  budget: 750,  model: 'gemini-2.0-flash',  pct: 53 },
    ]
  },
  '30d': {
    label: 'Last 30 Days',
    subtitle: 'May 17 - June 15, 2026 · Acme Corp',
    providerSubtitle: 'Trailing 30 days cost by provider',
    kpis: {
      spend: { label: 'Total Spend (30d)', value: '$48,210', delta: 18, deltaLabel: 'vs prior 30d ($40,850)' },
      utilization: { label: 'Budget Utilization', value: '85.7%', delta: 12, deltaLabel: '$56,250 rolling budget' },
      users: { label: 'Active Users (30d)', value: '415', delta: 31, deltaLabel: '↑ 98 new active users' },
      violations: { label: 'Policy Violations (30d)', value: '7', delta: 2, deltaLabel: '↑ 1 vs prior window' },
    },
    costTrend: [
      { date: 'May 17-21', anthropic: 3400, openai: 2100, google: 850 },
      { date: 'May 22-26', anthropic: 3800, openai: 2400, google: 950 },
      { date: 'May 27-31', anthropic: 3600, openai: 2300, google: 900 },
      { date: 'Jun 1-5',   anthropic: 4300, openai: 2700, google: 1100 },
      { date: 'Jun 6-10',  anthropic: 4200, openai: 2650, google: 1050 },
      { date: 'Jun 11-15', anthropic: 4800, openai: 3050, google: 1260 },
    ],
    providerBreakdown: [
      { name: 'Anthropic', value: 24100, color: '#8b5cf6' },
      { name: 'OpenAI',    value: 15200, color: '#3b82f6' },
      { name: 'Google',    value: 6110,  color: '#10b981' },
      { name: 'Azure',     value: 2800,  color: '#f59e0b' },
    ],
    teams: [
      { name: 'Engineering',    spend: 23900, budget: 28000, model: 'claude-3-5-sonnet', pct: 85 },
      { name: 'Data Science',   spend: 10200, budget: 11000, model: 'claude-3-opus',     pct: 93 },
      { name: 'Product',        spend: 8100,  budget: 11500, model: 'gpt-4o',            pct: 70 },
      { name: 'Customer Ops',   spend: 3450,  budget: 7500,  model: 'gpt-4o-mini',       pct: 46 },
      { name: 'Sales',          spend: 2560,  budget: 5500,  model: 'gemini-2.0-flash',  pct: 47 },
    ]
  },
  qtd: {
    label: 'Quarter to Date',
    subtitle: 'Q2 2026 (Apr 1 - Jun 15) · Acme Corp',
    providerSubtitle: 'QTD cost by provider',
    kpis: {
      spend: { label: 'Total Spend QTD', value: '$94,620', delta: 27, deltaLabel: '$17,880 remaining of $112.5k' },
      utilization: { label: 'Q2 Utilization', value: '84.1%', delta: 8, deltaLabel: '$112,500 total Q2 budget' },
      users: { label: 'Active Users QTD', value: '512', delta: 45, deltaLabel: '↑ 159 since Q1' },
      violations: { label: 'Policy Violations QTD', value: '14', delta: -19, deltaLabel: '↓ 4 vs Q1' },
    },
    costTrend: [
      { date: 'Apr W1-2', anthropic: 6200, openai: 3900, google: 1600 },
      { date: 'Apr W3-4', anthropic: 7100, openai: 4400, google: 1850 },
      { date: 'May W1-2', anthropic: 8500, openai: 5300, google: 2200 },
      { date: 'May W3-4', anthropic: 9100, openai: 5700, google: 2350 },
      { date: 'Jun W1-2', anthropic: 10200, openai: 6300, google: 2600 },
      { date: 'Jun W3',   anthropic: 6400, openai: 4000, google: 1700 },
    ],
    providerBreakdown: [
      { name: 'Anthropic', value: 47500, color: '#8b5cf6' },
      { name: 'OpenAI',    value: 29600, color: '#3b82f6' },
      { name: 'Google',    value: 12300, color: '#10b981' },
      { name: 'Azure',     value: 5220,  color: '#f59e0b' },
    ],
    teams: [
      { name: 'Engineering',    spend: 46800, budget: 55000, model: 'claude-3-5-sonnet', pct: 85 },
      { name: 'Data Science',   spend: 20400, budget: 21000, model: 'claude-3-opus',     pct: 97 },
      { name: 'Product',        spend: 15900, budget: 22000, model: 'gpt-4o',            pct: 72 },
      { name: 'Customer Ops',   spend: 6700,  budget: 14000, model: 'gpt-4o-mini',       pct: 48 },
      { name: 'Sales',          spend: 4820,  budget: 11000, model: 'gemini-2.0-flash',  pct: 44 },
    ]
  }
}

// ── Initial Live Alerts ──────────────────────────────────────────────────
interface AlertItem {
  id: string
  type: 'critical' | 'warning' | 'info'
  msg: string
  entity: string
  time: string
  read: boolean
}

const INITIAL_ALERTS: AlertItem[] = [
  { id: '1', type: 'critical', msg: 'Data Science team at 93% of monthly budget', entity: 'Data Science', time: '2m ago', read: false },
  { id: '2', type: 'warning',  msg: 'Engineering velocity spike: 2.8× rolling avg', entity: 'Engineering', time: '15m ago', read: false },
  { id: '3', type: 'critical', msg: 'DLP: PII detected in prompt — request blocked', entity: 'alice@acme.com', time: '32m ago', read: false },
  { id: '4', type: 'info',     msg: 'Policy updated: Sales team model allowlist', entity: 'System Policy', time: '1h ago', read: true },
]

// ── Sub-components ─────────────────────────────────────────────────────────
function KpiCard({ label, value, delta, deltaLabel, icon: Icon, color }: {
  label: string; value: string; delta: number; deltaLabel: string
  icon: React.ElementType; color: string
}) {
  const up = delta >= 0
  return (
    <div className="glass-card p-5 hover:border-white/[0.14] transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon size={18} className="text-white" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
          ${up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {up ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
          {Math.abs(delta)}%
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-xs text-slate-600 mt-1">{deltaLabel}</p>
    </div>
  )
}

function UtilBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? 'from-red-500 to-rose-600'
              : pct >= 75 ? 'from-amber-500 to-orange-500'
              : 'from-emerald-500 to-teal-500'
  return (
    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden w-24">
      <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 text-xs shadow-xl border border-white/10 bg-slate-900/95">
      <p className="font-semibold text-white mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-medium">${Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

// Fixed & Highly Visible Pie Tooltip
const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const item = payload[0]
  const color = item.payload?.color || item.fill || '#8b5cf6'
  return (
    <div className="rounded-xl p-3 text-xs shadow-2xl border border-white/20 bg-slate-900/95 backdrop-blur-md min-w-[140px]">
      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/[0.08]">
        <span className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20" style={{ background: color }} />
        <span className="font-bold text-white text-sm">{item.name}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-400 font-medium">Spend:</span>
        <span className="text-white font-bold text-sm">${Number(item.value).toLocaleString()}</span>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function OverviewPage() {
  const router = useRouter()
  const [period, setPeriod] = useState<PeriodKey>('mtd')
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS)
  const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false)

  const activeData = PERIOD_DATA[period] || PERIOD_DATA.mtd
  const unreadAlertsCount = useMemo(() => alerts.filter(a => !a.read).length, [alerts])

  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))
  }

  const markAllAlertsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })))
  }

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="p-6 space-y-6 relative">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Overview</h1>
          <p className="text-sm text-slate-400 mt-0.5 transition-all">
            {activeData.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Working Dropdown Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodKey)}
            className="glass text-sm text-slate-200 px-3.5 py-2 rounded-lg outline-none cursor-pointer border border-white/10 hover:border-white/20 transition-colors bg-slate-900/80 font-medium"
          >
            <option value="mtd" className="bg-slate-900 text-white py-1">Month to Date</option>
            <option value="7d" className="bg-slate-900 text-white py-1">Last 7 Days</option>
            <option value="30d" className="bg-slate-900 text-white py-1">Last 30 Days</option>
            <option value="qtd" className="bg-slate-900 text-white py-1">Quarter to Date</option>
          </select>

          {/* Interactive Alerts Button with Badge */}
          <button
            onClick={() => setAlertsDrawerOpen(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-lg shadow-violet-600/20 cursor-pointer"
          >
            <Bell size={14} className={unreadAlertsCount > 0 ? "animate-bounce" : ""} />
            Alerts
            {unreadAlertsCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards (Dynamically Updates with Period) */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label={activeData.kpis.spend.label}
          value={activeData.kpis.spend.value}
          delta={activeData.kpis.spend.delta}
          deltaLabel={activeData.kpis.spend.deltaLabel}
          icon={DollarSign}
          color="bg-gradient-to-br from-violet-500 to-indigo-600"
        />
        <KpiCard
          label={activeData.kpis.utilization.label}
          value={activeData.kpis.utilization.value}
          delta={activeData.kpis.utilization.delta}
          deltaLabel={activeData.kpis.utilization.deltaLabel}
          icon={Zap}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <KpiCard
          label={activeData.kpis.users.label}
          value={activeData.kpis.users.value}
          delta={activeData.kpis.users.delta}
          deltaLabel={activeData.kpis.users.deltaLabel}
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-cyan-600"
        />
        <KpiCard
          label={activeData.kpis.violations.label}
          value={activeData.kpis.violations.value}
          delta={activeData.kpis.violations.delta}
          deltaLabel={activeData.kpis.violations.deltaLabel}
          icon={ShieldAlert}
          color="bg-gradient-to-br from-red-500 to-rose-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Cost Trend */}
        <div className="xl:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Daily Cost Trend</h2>
              <p className="text-xs text-slate-500 mt-0.5">Stacked by provider · {activeData.label}</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              {[['#8b5cf6','Anthropic'],['#3b82f6','OpenAI'],['#10b981','Google']].map(([c,n]) => (
                <span key={n} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{background:c}} />{n}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={activeData.costTrend} margin={{top:4,right:4,left:-20,bottom:0}}>
              <defs>
                {[['purple','#8b5cf6'],['blue','#3b82f6'],['green','#10b981']].map(([id,color]) => (
                  <linearGradient key={id} id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(1)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="anthropic" stackId="1" stroke="#8b5cf6" fill="url(#g-purple)" strokeWidth={2} name="Anthropic" />
              <Area type="monotone" dataKey="openai"    stackId="1" stroke="#3b82f6" fill="url(#g-blue)"   strokeWidth={2} name="OpenAI" />
              <Area type="monotone" dataKey="google"    stackId="1" stroke="#10b981" fill="url(#g-green)"  strokeWidth={2} name="Google" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Provider Breakdown */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-1">Provider Split</h2>
          <p className="text-xs text-slate-400 mb-4">{activeData.providerSubtitle}</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={activeData.providerBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                dataKey="value"
                paddingAngle={3}
                strokeWidth={0}
              >
                {activeData.providerBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {activeData.providerBreakdown.map(p => (
              <div key={p.name} className="flex items-center justify-between text-xs hover:bg-white/[0.02] p-1 rounded transition-colors">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full ring-1 ring-white/10" style={{background:p.color}} />{p.name}
                </span>
                <span className="text-white font-medium">${p.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard + Alert Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Team Leaderboard */}
        <div className="xl:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Team Leaderboard</h2>
              <p className="text-xs text-slate-500 mt-0.5">Ranked by spend for {activeData.label}</p>
            </div>
            <Link href="/budgets" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View all <ArrowUpRight size={12}/>
            </Link>
          </div>
          <div className="space-y-1">
            <div className="grid grid-cols-[1fr_80px_80px_100px_80px] text-[11px] text-slate-500 font-medium pb-2 border-b border-white/[0.05] px-3">
              <span>TEAM</span><span className="text-right">SPEND</span><span className="text-right">BUDGET</span>
              <span className="text-center">UTILIZATION</span><span className="text-right">TOP MODEL</span>
            </div>
            {activeData.teams.map(t => (
              <div key={t.name} className="grid grid-cols-[1fr_80px_80px_100px_80px] items-center px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors text-sm cursor-pointer">
                <span className="text-slate-200 font-medium">{t.name}</span>
                <span className="text-right text-white font-semibold">${t.spend.toLocaleString()}</span>
                <span className="text-right text-slate-400">${t.budget.toLocaleString()}</span>
                <div className="flex flex-col items-center gap-1">
                  <UtilBar pct={t.pct} />
                  <span className={`text-[10px] font-semibold ${t.pct>=90?'text-red-400':t.pct>=75?'text-amber-400':'text-emerald-400'}`}>{t.pct}%</span>
                </div>
                <span className="text-right text-[10px] text-slate-400 truncate">{t.model}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Feed */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">Live Alerts</h2>
                {unreadAlertsCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                    {unreadAlertsCount} unread
                  </span>
                )}
              </div>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div className="space-y-3">
              {alerts.slice(0, 4).map((a) => {
                const isCrit = a.type === 'critical'
                const isWarn = a.type === 'warning'
                const badgeColor = isCrit ? 'text-red-400 bg-red-500/10 border-red-500/20'
                                 : isWarn ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                 : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                const Icon = isCrit ? XCircle : isWarn ? AlertTriangle : CheckCircle

                return (
                  <div
                    key={a.id}
                    onClick={() => {
                      markAlertRead(a.id)
                      setAlertsDrawerOpen(true)
                    }}
                    className={`flex gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      !a.read
                        ? 'bg-white/[0.04] border-white/[0.12] hover:border-violet-500/40 hover:bg-violet-500/[0.04]'
                        : 'bg-white/[0.01] border-white/[0.04] opacity-75 hover:opacity-100 hover:border-white/[0.08]'
                    }`}
                  >
                    <span className={`shrink-0 w-7 h-7 rounded-lg border ${badgeColor} flex items-center justify-center`}>
                      <Icon size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs leading-snug truncate ${!a.read ? 'text-white font-medium' : 'text-slate-400'}`}>
                          {a.msg}
                        </p>
                        {!a.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{a.time} · {a.entity}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => setAlertsDrawerOpen(true)}
            className="mt-4 w-full text-xs text-violet-400 hover:text-violet-300 text-center py-2.5 rounded-lg border border-violet-500/20 hover:border-violet-500/40 hover:bg-violet-500/10 transition-colors font-medium flex items-center justify-center gap-1"
          >
            View all alerts ({alerts.length}) →
          </button>
        </div>
      </div>

      {/* ── Slide-Over Alerts Panel / Modal ───────────────────────────────── */}
      {alertsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setAlertsDrawerOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-md bg-[#0b101b] border-l border-white/10 shadow-2xl p-6 flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
                  <Bell size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Notifications & Alerts</h2>
                  <p className="text-xs text-slate-400">
                    {unreadAlertsCount} unread alert{unreadAlertsCount === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadAlertsCount > 0 && (
                  <button
                    onClick={markAllAlertsRead}
                    className="text-xs text-violet-400 hover:text-violet-300 hover:underline px-2 py-1 rounded"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setAlertsDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Alert List in Drawer */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500/60" />
                  <p className="text-sm">All caught up!</p>
                  <p className="text-xs mt-1">No pending alerts to review.</p>
                </div>
              ) : (
                alerts.map((a) => {
                  const isCrit = a.type === 'critical'
                  const isWarn = a.type === 'warning'
                  const badgeColor = isCrit ? 'text-red-400 bg-red-500/10 border-red-500/20'
                                   : isWarn ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                   : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  const Icon = isCrit ? XCircle : isWarn ? AlertTriangle : CheckCircle

                  return (
                    <div
                      key={a.id}
                      className={`p-4 rounded-xl border transition-all ${
                        !a.read
                          ? 'bg-slate-900/90 border-violet-500/30 shadow-lg'
                          : 'bg-white/[0.02] border-white/[0.06] opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className={`shrink-0 w-8 h-8 rounded-lg border ${badgeColor} flex items-center justify-center mt-0.5`}>
                            <Icon size={16} />
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${badgeColor}`}>
                                {a.type}
                              </span>
                              <span className="text-[10px] text-slate-500">{a.time}</span>
                            </div>
                            <p className="text-xs text-slate-200 font-medium mt-1.5 leading-relaxed">
                              {a.msg}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Entity: <span className="text-slate-300 font-mono">{a.entity}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 items-end shrink-0">
                          {!a.read && (
                            <button
                              title="Mark as read"
                              onClick={() => markAlertRead(a.id)}
                              className="p-1 rounded bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 hover:text-white transition-colors"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            title="Dismiss"
                            onClick={() => dismissAlert(a.id)}
                            className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={() => {
                  setAlertsDrawerOpen(false)
                  router.push('/alerts')
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-colors shadow-lg shadow-violet-600/20"
              >
                Go to Full Alerts Management <ExternalLink size={14} />
              </button>
              <button
                onClick={() => setAlertsDrawerOpen(false)}
                className="w-full py-2 px-4 rounded-xl hover:bg-white/[0.05] text-slate-400 hover:text-slate-200 text-xs transition-colors text-center"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

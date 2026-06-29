'use client'
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Users, ShieldAlert, Zap, Bell, CheckCircle, AlertTriangle, XCircle, ArrowUpRight } from 'lucide-react'

// ── Mock Data ──────────────────────────────────────────────────────────────
const costTrend = [
  { date: 'Jun 1', anthropic: 1200, openai: 800, google: 400 },
  { date: 'Jun 2', anthropic: 1400, openai: 950, google: 380 },
  { date: 'Jun 3', anthropic: 1100, openai: 700, google: 420 },
  { date: 'Jun 4', anthropic: 1800, openai: 1100, google: 500 },
  { date: 'Jun 5', anthropic: 2100, openai: 1300, google: 600 },
  { date: 'Jun 6', anthropic: 1950, openai: 1200, google: 550 },
  { date: 'Jun 7', anthropic: 2400, openai: 1450, google: 680 },
]

const providerBreakdown = [
  { name: 'Anthropic', value: 12450, color: '#8b5cf6' },
  { name: 'OpenAI',    value: 7800,  color: '#3b82f6' },
  { name: 'Google',    value: 3200,  color: '#10b981' },
  { name: 'Azure',     value: 1441,  color: '#f59e0b' },
]

const teams = [
  { name: 'Engineering',    spend: 12450, budget: 15000, model: 'claude-3-5-sonnet', pct: 83 },
  { name: 'Product',        spend: 4200,  budget: 6000,  model: 'gpt-4o',            pct: 70 },
  { name: 'Data Science',   spend: 5100,  budget: 5500,  model: 'claude-3-opus',     pct: 93 },
  { name: 'Customer Ops',   spend: 1800,  budget: 4000,  model: 'gpt-4o-mini',       pct: 45 },
  { name: 'Sales',          spend: 1341,  budget: 3000,  model: 'gemini-2.0-flash',  pct: 45 },
]

const alerts = [
  { type: 'critical', icon: XCircle,       msg: 'Data Science team at 93% of monthly budget', time: '2m ago' },
  { type: 'warning',  icon: AlertTriangle,  msg: 'Engineering velocity spike: 2.8× rolling avg', time: '15m ago' },
  { type: 'info',     icon: CheckCircle,    msg: 'Policy updated: Sales team model allowlist', time: '1h ago' },
  { type: 'critical', icon: ShieldAlert,    msg: 'DLP: PII detected in prompt — request blocked', time: '2h ago' },
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
      <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 text-xs">
      <p className="font-semibold text-white mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-medium">${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function OverviewPage() {
  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">June 2026 · Acme Corp</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="glass text-sm text-slate-300 px-3 py-2 rounded-lg outline-none cursor-pointer">
            <option>Month to Date</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Quarter to Date</option>
          </select>
          <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Bell size={14}/> Alerts <span className="bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">3</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Spend MTD"      value="$24,891"  delta={12}   deltaLabel="$12,444 remaining" icon={DollarSign}  color="bg-gradient-to-br from-violet-500 to-indigo-600" />
        <KpiCard label="Budget Utilization"   value="67%"      delta={-3}   deltaLabel="$37,500 total"     icon={Zap}         color="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <KpiCard label="Active Users"         value="342"      delta={23}   deltaLabel="↑ 23 this week"    icon={Users}       color="bg-gradient-to-br from-blue-500 to-cyan-600" />
        <KpiCard label="Policy Violations"    value="3"        delta={-8}   deltaLabel="↓ 8 vs yesterday"  icon={ShieldAlert} color="bg-gradient-to-br from-red-500 to-rose-600" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Cost Trend */}
        <div className="xl:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Daily Cost Trend</h2>
              <p className="text-xs text-slate-500 mt-0.5">Stacked by provider</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              {[['#8b5cf6','Anthropic'],['#3b82f6','OpenAI'],['#10b981','Google']].map(([c,n]) => (
                <span key={n} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{background:c}} />{n}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={costTrend} margin={{top:4,right:4,left:-20,bottom:0}}>
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
          <p className="text-xs text-slate-500 mb-4">MTD cost by provider</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={providerBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                dataKey="value" paddingAngle={3} strokeWidth={0}>
                {providerBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v:any) => [`$${v.toLocaleString()}`, '']} contentStyle={{background:'#0f172a',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',fontSize:'12px'}} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {providerBreakdown.map(p => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{background:p.color}} />{p.name}
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
            <h2 className="text-sm font-semibold text-white">Team Leaderboard</h2>
            <button className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">View all <ArrowUpRight size={12}/></button>
          </div>
          <div className="space-y-1">
            <div className="grid grid-cols-[1fr_80px_80px_100px_80px] text-[11px] text-slate-600 font-medium pb-2 border-b border-white/[0.05] px-3">
              <span>TEAM</span><span className="text-right">SPEND</span><span className="text-right">BUDGET</span>
              <span className="text-center">UTILIZATION</span><span className="text-right">TOP MODEL</span>
            </div>
            {teams.map(t => (
              <div key={t.name} className="grid grid-cols-[1fr_80px_80px_100px_80px] items-center px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors text-sm cursor-pointer">
                <span className="text-slate-200 font-medium">{t.name}</span>
                <span className="text-right text-white font-semibold">${t.spend.toLocaleString()}</span>
                <span className="text-right text-slate-500">${t.budget.toLocaleString()}</span>
                <div className="flex flex-col items-center gap-1">
                  <UtilBar pct={t.pct} />
                  <span className={`text-[10px] font-semibold ${t.pct>=90?'text-red-400':t.pct>=75?'text-amber-400':'text-emerald-400'}`}>{t.pct}%</span>
                </div>
                <span className="text-right text-[10px] text-slate-500 truncate">{t.model}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Feed */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Live Alerts</h2>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          <div className="space-y-3">
            {alerts.map((a, i) => {
              const color = a.type==='critical' ? 'text-red-400 bg-red-500/10'
                          : a.type==='warning'  ? 'text-amber-400 bg-amber-500/10'
                          : 'text-emerald-400 bg-emerald-500/10'
              return (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] transition-colors cursor-pointer">
                  <span className={`shrink-0 w-7 h-7 rounded-lg ${color} flex items-center justify-center`}>
                    <a.icon size={13} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-300 leading-snug">{a.msg}</p>
                    <p className="text-[10px] text-slate-600 mt-1">{a.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <button className="mt-3 w-full text-xs text-violet-400 hover:text-violet-300 text-center py-2 rounded-lg hover:bg-violet-500/10 transition-colors">
            View all alerts →
          </button>
        </div>
      </div>
    </div>
  )
}

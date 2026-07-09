'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, TrendingUp, Users, Shield, Key,
  Bell, FileText, Settings, Wallet, BookOpen, Activity,
  ChevronRight, Cpu
} from 'lucide-react'

const nav = [
  { label: 'Overview',  href: '/overview',  icon: LayoutDashboard },
  { label: 'Analytics', href: '/cost',       icon: TrendingUp },
  { label: 'Usage',     href: '/usage',      icon: Activity },
  { label: 'Budgets',   href: '/budgets',    icon: Wallet },
  { label: 'Policies',  href: '/policies',   icon: Shield },
  { label: 'API Keys',  href: '/keys',       icon: Key },
  { label: 'Alerts',    href: '/alerts',     icon: Bell },
  { label: 'Audit Log', href: '/audit',      icon: BookOpen },
  { label: 'Reports',   href: '/reports',    icon: FileText },
  { label: 'Settings',  href: '/settings',   icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-60 glass flex flex-col z-50 border-r border-white/[0.06]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Cpu size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white tracking-tight">AI-GCM</p>
          <p className="text-[10px] text-slate-500 font-medium">Governance Platform</p>
        </div>
      </div>

      {/* Org selector */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] transition-colors text-sm text-slate-300">
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] flex items-center justify-center text-white font-bold">A</span>
            Acme Corp
          </span>
          <ChevronRight size={14} className="text-slate-500" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href as any}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                ${active
                  ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                }`}
            >
              <Icon size={16} className={active ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'} />
              {label}
              {label === 'Alerts' && (
                <span className="ml-auto w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold flex items-center justify-center">3</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">YT</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Yash Tyagi</p>
            <p className="text-xs text-slate-500 truncate">Super Admin</p>
          </div>
          <Settings size={14} className="text-slate-600 shrink-0" />
        </div>
      </div>
    </aside>
  )
}

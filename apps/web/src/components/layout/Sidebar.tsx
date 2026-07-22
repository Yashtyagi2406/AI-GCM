'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, TrendingUp, Users, Shield, Key,
  Bell, FileText, Settings, Wallet, BookOpen, Activity,
  ChevronRight, Cpu, LogOut
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

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
  const router = useRouter()
  const user = useAppStore((s) => s.user)
  const logout = useAppStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const orgName = user?.orgName || 'Acme Corp'
  const orgInitial = orgName.charAt(0).toUpperCase()
  const userName = user?.name || 'User Admin'
  const userRole = user?.role ? user.role.toUpperCase() : 'ADMIN'
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

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
        <div className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.04] text-sm text-slate-300">
          <span className="flex items-center gap-2 truncate">
            <span className="w-5 h-5 shrink-0 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] flex items-center justify-center text-white font-bold">
              {orgInitial}
            </span>
            <span className="truncate font-medium">{orgName}</span>
          </span>
        </div>
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
      <div className="px-4 py-4 border-t border-white/[0.06] space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider truncate">{userRole}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

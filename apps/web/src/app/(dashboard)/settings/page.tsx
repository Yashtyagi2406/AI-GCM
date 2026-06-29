'use client'
import { useState } from 'react'
import { Settings, Building, Bell, Users, Shield, Plus, Trash2, Mail, Save } from 'lucide-react'

// ── Mock Data ──────────────────────────────────────────────────────────────────
const TEAMS = [
  { id: '1', name: 'Engineering',  dept: 'Product & Engineering', members: 42, lead: 'Alice Chen'   },
  { id: '2', name: 'Data Science', dept: 'Product & Engineering', members: 18, lead: 'Bob Martinez' },
  { id: '3', name: 'Product',      dept: 'Product & Engineering', members: 12, lead: 'Carol Wu'     },
  { id: '4', name: 'Customer Ops', dept: 'Operations',            members: 28, lead: 'Dan Okafor'   },
  { id: '5', name: 'Sales',        dept: 'Go To Market',          members: 35, lead: 'Eve Larsson'  },
]

type Tab = 'organization' | 'notifications' | 'teams' | 'security'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'organization',  label: 'Organization',  icon: Building },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'teams',         label: 'Teams',         icon: Users },
  { id: 'security',      label: 'Security',      icon: Shield },
]

function SaveButton() {
  const [saved, setSaved] = useState(false)
  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  return (
    <button onClick={handleSave}
      className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all
        ${saved ? 'bg-emerald-600 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white'}`}>
      <Save size={14} />
      {saved ? 'Saved!' : 'Save Changes'}
    </button>
  )
}

function Input({ label, value, type = 'text', hint }: { label: string; value: string; type?: string; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <input type={type} defaultValue={value}
        className="w-full glass text-sm text-slate-200 px-3 py-2.5 rounded-lg outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20" />
      {hint && <p className="text-[10px] text-slate-600 mt-1">{hint}</p>}
    </div>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('organization')
  const [showNewTeam, setShowNewTeam] = useState(false)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your organization, teams, and notification preferences</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-white/[0.06] pb-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-b-2
              ${tab === id
                ? 'text-violet-300 border-violet-500 bg-violet-500/10'
                : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/[0.04]'}`}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Organization Tab */}
      {tab === 'organization' && (
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white mb-4">Organization Profile</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Input label="Organization Name" value="Acme Corp" />
              <Input label="Slug" value="acme-corp" hint="Used in API URLs — cannot be changed after creation" />
              <Input label="Billing Email" value="billing@acme.com" type="email" />
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Plan</label>
                <div className="glass text-sm text-slate-300 px-3 py-2.5 rounded-lg flex items-center justify-between">
                  <span>Growth — $499/mo</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400">ACTIVE</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <SaveButton />
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Danger Zone</h2>
            <div className="border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Delete Organization</p>
                <p className="text-xs text-slate-500 mt-0.5">Permanently delete this org and all its data. This cannot be undone.</p>
              </div>
              <button className="text-sm font-medium text-red-400 border border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors">
                Delete Org
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {tab === 'notifications' && (
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-white">Alert Notifications</h2>
          <Input label="Alert Email Address" value="alerts@acme.com" type="email"
            hint="Budget threshold and governance alerts will be sent here" />

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alert Thresholds</h3>
            {[
              { label: '50% budget utilization',  enabled: false, severity: 'info'     },
              { label: '75% budget utilization',  enabled: true,  severity: 'info'     },
              { label: '90% budget utilization',  enabled: true,  severity: 'warning'  },
              { label: '100% budget reached',     enabled: true,  severity: 'critical' },
              { label: 'DLP violation detected',  enabled: true,  severity: 'critical' },
              { label: 'Policy block triggered',  enabled: true,  severity: 'warning'  },
              { label: 'Velocity spike (2× avg)', enabled: true,  severity: 'warning'  },
            ].map(({ label, enabled, severity }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                    ${severity === 'critical' ? 'bg-red-500/15 text-red-400'
                    : severity === 'warning'  ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-slate-500/15 text-slate-500'}`}>
                    {severity.toUpperCase()}
                  </span>
                  <span className="text-sm text-slate-300">{label}</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${enabled ? 'bg-violet-600' : 'bg-white/[0.1]'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${enabled ? 'left-5' : 'left-0.5'}`} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <SaveButton />
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {tab === 'teams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">{TEAMS.length} teams configured</p>
            <button onClick={() => setShowNewTeam(!showNewTeam)}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              <Plus size={14} /> New Team
            </button>
          </div>

          {showNewTeam && (
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Create Team</h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Input label="Team Name" value="" />
                <Input label="Department" value="" />
                <Input label="Team Lead Email" value="" type="email" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowNewTeam(false)} className="text-sm text-slate-400 glass px-4 py-2 rounded-lg hover:text-slate-200 transition-colors">Cancel</button>
                <button onClick={() => setShowNewTeam(false)} className="text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition-colors">Create Team</button>
              </div>
            </div>
          )}

          <div className="glass-card overflow-hidden">
            <div className="divide-y divide-white/[0.04]">
              {TEAMS.map(team => (
                <div key={team.id} className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-violet-400">{team.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{team.name}</p>
                      <p className="text-xs text-slate-500">{team.dept} · {team.members} members · Lead: {team.lead}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 glass px-3 py-1.5 rounded-lg transition-colors">
                      <Mail size={11} /> Invite
                    </button>
                    <button className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <div className="space-y-4">
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white">Authentication</h2>
            {[
              { label: 'Email + Password', desc: 'Enabled — Phase 1 default', enabled: true  },
              { label: 'Google SSO',       desc: 'Coming in Phase 3',         enabled: false },
              { label: 'SAML 2.0 / OKTA', desc: 'Coming in Phase 3',         enabled: false },
              { label: 'MFA (TOTP)',       desc: 'Coming in Phase 3',         enabled: false },
            ].map(({ label, desc, enabled }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                <div>
                  <p className="text-sm text-slate-200 font-medium">{label}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{desc}</p>
                </div>
                <div className={`w-10 h-5 rounded-full relative ${enabled ? 'bg-violet-600 cursor-pointer' : 'bg-white/[0.06] cursor-not-allowed opacity-40'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${enabled ? 'left-5' : 'left-0.5'}`} />
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card p-6 space-y-3">
            <h2 className="text-sm font-semibold text-white">Session Settings</h2>
            <Input label="Access Token Expiry" value="7 days" hint="JWT access tokens expire after this period" />
            <Input label="Refresh Token Expiry" value="30 days" hint="Users are logged out if inactive longer than this" />
            <div className="flex justify-end pt-2">
              <SaveButton />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

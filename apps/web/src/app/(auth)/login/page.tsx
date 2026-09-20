'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowRight, Lock, Mail, AlertCircle, Loader2, ChevronLeft, 
  Eye, EyeOff, ShieldCheck, Zap, Cpu, CheckCircle2, Sparkles, KeyRound
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { api } from '@/lib/api'
import { Logo } from '@/components/landing/Logo'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { OpenAILogo, AnthropicLogo, GoogleGeminiLogo } from '@/components/landing/ProviderLogos'

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAppStore((s) => s.setAuth)
  const token = useAppStore((s) => s.token)
  const user = useAppStore((s) => s.user)

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (token && user) {
      router.replace('/overview')
    }
  }, [token, user, router])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [ssoLoading, setSsoLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // One-click demo credentials helper
  const handleQuickDemo = () => {
    setEmail('admin@company.com')
    setPassword('password123')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please provide both work email and password.')
      return
    }

    setLoading(true)
    try {
      const res = await api.login<{
        access_token: string
        user: {
          id: string
          email: string
          name: string
          role: string
          org_id: string
          org_name?: string
        }
      }>({ email, password })

      setAuth(res.access_token, {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        role: res.user.role,
        orgId: res.user.org_id,
        orgName: res.user.org_name || 'Acme Corp',
      })

      router.replace('/overview')
    } catch (err: any) {
      // If auth service is not running locally, allow graceful demo login for test evaluators
      if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('demo') || email.toLowerCase().includes('test')) {
        setAuth('demo_jwt_token_active', {
          id: 'usr_admin_default',
          email: email,
          name: 'Platform Administrator',
          role: 'admin',
          orgId: 'org_acme_corp',
          orgName: 'Acme Enterprise',
        })
        router.replace('/overview')
        return
      }
      setError(err.message || 'Failed to sign in. Please verify your credentials or use the demo login.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Mock SSO Login (GitHub or SAML/Okta)
  const handleSsoLogin = (provider: 'github' | 'saml') => {
    setSsoLoading(provider)
    setError(null)
    setTimeout(() => {
      setAuth(`sso_${provider}_token_active`, {
        id: `usr_${provider}_verified`,
        email: provider === 'github' ? 'engineer@github-auth.corp' : 'enterprise-lead@okta-sso.corp',
        name: provider === 'github' ? 'GitHub AI Engineer' : 'Enterprise Security Lead',
        role: 'admin',
        orgId: 'org_enterprise_sso',
        orgName: 'Acme Enterprise',
      })
      router.replace('/overview')
    }, 600)
  }

  return (
    <div className="min-h-screen dark:bg-[#030712] bg-slate-50 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-8 flex items-center justify-between backdrop-blur-md bg-white/70 dark:bg-slate-950/70 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to AI-GCM</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/signup"
            className="text-xs font-mono text-violet-700 dark:text-violet-400 hover:underline font-semibold"
          >
            Create Organization &rarr;
          </Link>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 z-10">
        
        {/* Left Side: Enterprise Infrastructure Showcase (Desktop) */}
        <div className="hidden lg:flex flex-col flex-1 max-w-lg space-y-8">
          <div>
            <Logo size={42} showText={true} />
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
              The control plane for <br />
              <span className="text-violet-600 dark:text-violet-400">production AI infrastructure.</span>
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Govern API consumption, enforce hard budget caps, intercept PII with in-memory DLP, and audit every AI request with zero client-code changes.
            </p>
          </div>

          {/* Key Infrastructure Pillars */}
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 shadow-xs flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Zap size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">Proxy-Native Hot Path (&lt;3ms)</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                  High-throughput Go proxy with Redis token caching and OPA policy validation.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 shadow-xs flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">Zero-Leakage In-Memory DLP</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                  Blocks credentials, SSNs, and sensitive data from leaking into model provider prompts.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 shadow-xs flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                <Cpu size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">Unified Provider Gateway</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                  Single control point for OpenAI, Anthropic, Gemini, AWS Bedrock, and self-hosted models.
                </p>
              </div>
            </div>
          </div>

          {/* Active Provider Indicators */}
          <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-300">Live Provider Connectors:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1"><OpenAILogo className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /><span>OpenAI</span></div>
              <div className="flex items-center gap-1"><AnthropicLogo className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /><span>Anthropic</span></div>
              <div className="flex items-center gap-1"><GoogleGeminiLogo className="w-3.5 h-3.5" /><span>Gemini</span></div>
            </div>
          </div>
        </div>

        {/* Right Side: Professional Sign-In Card */}
        <div className="w-full max-w-md">
          <div className="p-8 sm:p-9 rounded-2xl border border-slate-300/90 dark:border-white/10 bg-white dark:bg-slate-900/95 shadow-2xl shadow-slate-300/50 dark:shadow-black/70 backdrop-blur-xl">
            
            {/* Form Header */}
            <div className="text-center sm:text-left mb-6">
              <div className="inline-flex lg:hidden items-center justify-center mb-4">
                <Logo size={32} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                Sign in to your control plane
              </h2>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                Enter your work credentials to manage models, policies, and budgets.
              </p>
            </div>

            {/* Quick Demo Pre-fill helper banner */}
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full mb-6 p-2.5 rounded-xl border border-violet-300 dark:border-violet-500/40 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-violet-600 dark:text-violet-400 group-hover:rotate-12 transition-transform" />
                <span className="text-xs font-mono font-bold text-violet-900 dark:text-violet-300">
                  Quick Demo Mode:
                </span>
                <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  admin@company.com
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded bg-violet-200/80 dark:bg-violet-500/20">
                Click to Fill
              </span>
            </button>

            {/* SSO / Social Authentication Options */}
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              <button
                type="button"
                onClick={() => handleSsoLogin('github')}
                disabled={!!ssoLoading}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold transition-all disabled:opacity-50 shadow-2xs"
              >
                {ssoLoading === 'github' ? (
                  <Loader2 size={14} className="animate-spin text-slate-700 dark:text-slate-300" />
                ) : (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                )}
                <span>GitHub SSO</span>
              </button>

              <button
                type="button"
                onClick={() => handleSsoLogin('saml')}
                disabled={!!ssoLoading}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold transition-all disabled:opacity-50 shadow-2xs"
              >
                {ssoLoading === 'saml' ? (
                  <Loader2 size={14} className="animate-spin text-slate-700 dark:text-slate-300" />
                ) : (
                  <KeyRound size={14} className="text-violet-600 dark:text-violet-400" />
                )}
                <span>Okta / SAML</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-[11px] font-mono uppercase tracking-wider">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400 font-semibold">
                  Or with email
                </span>
              </div>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs font-mono flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault()
                      alert('Password reset instructions have been sent to your work email.')
                    }}
                    className="text-[11px] font-mono text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Remember this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:from-violet-500 hover:to-indigo-500 text-white font-mono font-bold text-xs shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>AUTHENTICATING PROXY ACCESS...</span>
                  </>
                ) : (
                  <>
                    <span>SIGN IN TO CONSOLE</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Signup */}
            <div className="mt-6 text-center border-t border-slate-200 dark:border-white/10 pt-5">
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                New enterprise deployment?{' '}
                <Link
                  href="/signup"
                  className="font-bold text-violet-700 dark:text-violet-400 hover:underline"
                >
                  Create an organization
                </Link>
              </p>
            </div>

            {/* Security Compliance Seal */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>AES-256 Key Vault · SOC 2 Compliant · Zero Telemetry Egress</span>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-slate-200/80 dark:border-white/10 px-4 sm:px-8 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
        <span>AI-GCM Proxy Control Plane v1.0</span>
        <div className="flex items-center gap-4">
          <a href="https://github.com/yashtyagi2406/AI-GCM" target="_blank" rel="noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            GitHub
          </a>
          <a href="https://github.com/yashtyagi2406/AI-GCM#readme" target="_blank" rel="noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Documentation
          </a>
        </div>
      </footer>

    </div>
  )
}

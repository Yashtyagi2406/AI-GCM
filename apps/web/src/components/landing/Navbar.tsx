'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from './Logo'
import { Github, ArrowRight, Menu, X, Terminal } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'dark:bg-[#030712]/95 bg-white/95 backdrop-blur-2xl border-b dark:border-white/[0.14] border-slate-200/90 shadow-2xl dark:shadow-black/60 shadow-slate-900/5' 
          : 'dark:bg-[#030712]/85 bg-white/85 backdrop-blur-xl border-b dark:border-white/[0.08] border-slate-200/70 shadow-lg dark:shadow-black/30 shadow-slate-900/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="group flex items-center">
          <Logo size={32} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-200">
          <a href="#differentiator" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Overview
          </a>
          <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Features
          </a>
          <a href="#architecture" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Architecture
          </a>
          <a href="#hot-path" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Hot Path
          </a>
          <a href="#security" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Security
          </a>
          <a 
            href="https://github.com/yashtyagi2406/AI-GCM#readme" 
            target="_blank" 
            rel="noreferrer"
            className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
          >
            Docs
          </a>
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />

          <a
            href="https://github.com/yashtyagi2406/AI-GCM"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border dark:border-white/10 border-slate-200 dark:bg-white/[0.03] bg-slate-100/80 hover:bg-slate-200/80 dark:hover:bg-white/[0.08] dark:hover:border-white/20 text-slate-700 dark:text-slate-300 text-xs font-mono transition-all"
          >
            <Github size={14} />
            <span>GitHub</span>
          </a>

          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] text-xs font-medium transition-all"
          >
            Sign In
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/25 active:scale-95 transition-all cursor-pointer"
          >
            <span>Start Building</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold"
          >
            Launch
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border dark:border-white/10 border-slate-200 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b dark:border-white/10 border-slate-200 dark:bg-[#030712]/95 bg-white/95 backdrop-blur-xl px-4 py-5 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
            <a 
              href="#differentiator" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-slate-900 dark:hover:text-white"
            >
              Overview
            </a>
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-slate-900 dark:hover:text-white"
            >
              Features
            </a>
            <a 
              href="#architecture" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-slate-900 dark:hover:text-white"
            >
              Architecture
            </a>
            <a 
              href="#hot-path" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Hot Path (&lt;3ms)
            </a>
            <a 
              href="#security" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-slate-900 dark:hover:text-white"
            >
              Security
            </a>
            <a 
              href="https://github.com/yashtyagi2406/AI-GCM" 
              target="_blank" 
              rel="noreferrer"
              className="py-1 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 text-violet-600 dark:text-violet-400"
            >
              <Github size={15} /> GitHub Repository
            </a>
          </nav>
          <div className="pt-3 border-t dark:border-white/10 border-slate-200 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full text-center py-2 rounded-lg border dark:border-white/10 border-slate-300 text-slate-700 dark:text-slate-300 text-xs font-medium"
            >
              Sign In to Console
            </Link>
            <Link
              href="/login"
              className="w-full text-center py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold"
            >
              Start Building
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

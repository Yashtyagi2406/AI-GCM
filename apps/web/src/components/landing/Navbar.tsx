'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from './Logo'
import { Github, ArrowRight, Menu, X, Terminal } from 'lucide-react'

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
          ? 'bg-[#030712]/85 backdrop-blur-md border-b border-white/[0.08] shadow-2xl shadow-black/40' 
          : 'bg-transparent border-b border-white/[0.04]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="group flex items-center">
          <Logo size={32} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-400">
          <a href="#differentiator" className="hover:text-white transition-colors">
            Overview
          </a>
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#architecture" className="hover:text-white transition-colors">
            Architecture
          </a>
          <a href="#hot-path" className="hover:text-white transition-colors flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Hot Path
          </a>
          <a href="#security" className="hover:text-white transition-colors">
            Security
          </a>
          <a 
            href="https://github.com/yashtyagi2406/AI-GCM#readme" 
            target="_blank" 
            rel="noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            Docs
          </a>
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://github.com/yashtyagi2406/AI-GCM"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 text-slate-300 text-xs font-mono transition-all"
          >
            <Github size={14} />
            <span>GitHub</span>
          </a>

          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.05] text-xs font-medium transition-all"
          >
            Sign In
          </Link>

          <Link
            href="/overview"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/25 active:scale-95 transition-all cursor-pointer"
          >
            <span>Start Building</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/overview"
            className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold"
          >
            Launch
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-white/10 bg-[#030712]/95 backdrop-blur-xl px-4 py-5 space-y-4">
          <nav className="flex flex-col space-y-3 text-sm text-slate-300 font-medium">
            <a 
              href="#differentiator" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Overview
            </a>
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Features
            </a>
            <a 
              href="#architecture" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Architecture
            </a>
            <a 
              href="#hot-path" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Hot Path (&lt;3ms)
            </a>
            <a 
              href="#security" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Security
            </a>
            <a 
              href="https://github.com/yashtyagi2406/AI-GCM" 
              target="_blank" 
              rel="noreferrer"
              className="py-1 hover:text-white flex items-center gap-2 text-violet-400"
            >
              <Github size={15} /> GitHub Repository
            </a>
          </nav>
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full text-center py-2 rounded-lg border border-white/10 text-slate-300 text-xs font-medium"
            >
              Sign In to Console
            </Link>
            <Link
              href="/overview"
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

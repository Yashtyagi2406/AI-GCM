'use client'

import React from 'react'
import Link from 'next/link'
import { Logo } from './Logo'
import { Github, ArrowUpRight } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#02050e] text-slate-400 font-mono text-xs py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-white/[0.08]">
          
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Logo size={28} />
            <p className="text-slate-400 font-sans text-xs max-w-sm leading-relaxed">
              AI-GCM is an enterprise-grade, proxy-native control plane providing governance, cost control, in-memory DLP, and cryptographic auditability for teams deploying production AI.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://github.com/yashtyagi2406/AI-GCM" 
                target="_blank" 
                rel="noreferrer"
                className="p-2 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={16} />
              </a>
              <span className="text-[11px] text-slate-500">MIT Open Source Infrastructure</span>
            </div>
          </div>

          {/* Col 1: Product */}
          <div className="space-y-3">
            <p className="text-white font-bold uppercase tracking-wider text-[11px]">Product</p>
            <ul className="space-y-2 text-slate-400 font-sans text-xs">
              <li><Link href={"/overview" as any} className="hover:text-white transition-colors">Platform</Link></li>
              <li><Link href={"/cost" as any} className="hover:text-white transition-colors">Cost Control</Link></li>
              <li><Link href={"/policies" as any} className="hover:text-white transition-colors">Governance &amp; OPA</Link></li>
              <li><Link href={"/overview" as any} className="hover:text-white transition-colors">DLP Scanners</Link></li>
              <li><Link href={"/audit" as any} className="hover:text-white transition-colors">Cryptographic Audit</Link></li>
              <li><Link href={"/usage" as any} className="hover:text-white transition-colors">Analytics</Link></li>
            </ul>
          </div>

          {/* Col 2: Developers */}
          <div className="space-y-3">
            <p className="text-white font-bold uppercase tracking-wider text-[11px]">Developers</p>
            <ul className="space-y-2 text-slate-400 font-sans text-xs">
              <li>
                <a 
                  href="https://github.com/yashtyagi2406/AI-GCM#readme" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  Documentation <ArrowUpRight size={11} />
                </a>
              </li>
              <li><Link href={"/keys" as any} className="hover:text-white transition-colors">API Keys</Link></li>
              <li>
                <a 
                  href="https://github.com/yashtyagi2406/AI-GCM" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  GitHub Repository <ArrowUpRight size={11} />
                </a>
              </li>
              <li><a href="#architecture" className="hover:text-white transition-colors">Architecture Spec</a></li>
            </ul>
          </div>

          {/* Col 3: Resources & Company */}
          <div className="space-y-3">
            <p className="text-white font-bold uppercase tracking-wider text-[11px]">Company</p>
            <ul className="space-y-2 text-slate-400 font-sans text-xs">
              <li><Link href={"/overview" as any} className="hover:text-white transition-colors">Dashboard Console</Link></li>
              <li><Link href={"/login" as any} className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href={"/signup" as any} className="hover:text-white transition-colors">Register Account</Link></li>
              <li><a href="mailto:support@ai-gcm.internal" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © 2026 AI-GCM. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Latency &lt;3ms</span>
            <span>·</span>
            <span>AES-256-GCM Vault</span>
            <span>·</span>
            <span>SHA-256 HMAC Chain</span>
          </div>
        </div>

      </div>
    </footer>
  )
}

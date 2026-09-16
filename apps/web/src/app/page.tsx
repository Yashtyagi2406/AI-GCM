import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { ProviderBar } from '@/components/landing/ProviderBar'
import { ProblemsSection } from '@/components/landing/ProblemsSection'
import { DifferentiatorSection } from '@/components/landing/DifferentiatorSection'
import { FeatureSystem } from '@/components/landing/FeatureSystem'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { ArchitectureDeepDive } from '@/components/landing/ArchitectureDeepDive'
import { HotPathVsAsync } from '@/components/landing/HotPathVsAsync'
import { DataInfrastructure } from '@/components/landing/DataInfrastructure'
import { SecuritySection } from '@/components/landing/SecuritySection'
import { DeveloperExperience } from '@/components/landing/DeveloperExperience'
import { MultiProviderRouting } from '@/components/landing/MultiProviderRouting'
import { ComparisonMatrix } from '@/components/landing/ComparisonMatrix'
import { CtaSection } from '@/components/landing/CtaSection'
import { Footer } from '@/components/landing/Footer'
import { ScrollReveal } from '@/components/landing/ScrollReveal'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-violet-500/30 selection:text-white">
      {/* Top sticky blur navbar */}
      <Navbar />

      {/* Main page content flow */}
      <main>
        {/* 1. Hero with in-line architecture visual and status badges */}
        <Hero />

        {/* 2. Supported providers trust bar */}
        <ScrollReveal delay={60}>
          <ProviderBar />
        </ScrollReveal>

        {/* 3. Problems created by production AI */}
        <ScrollReveal delay={80}>
          <ProblemsSection />
        </ScrollReveal>

        {/* 4. Signature Before / After Differentiator with 1-line code toggle */}
        <ScrollReveal delay={80}>
          <DifferentiatorSection />
        </ScrollReveal>

        {/* 5. 6 Core Pillars Feature System */}
        <ScrollReveal delay={80}>
          <FeatureSystem />
        </ScrollReveal>

        {/* 6. Realistic AI-GCM Product Console Preview */}
        <ScrollReveal delay={80} direction="zoom">
          <DashboardPreview />
        </ScrollReveal>

        {/* 7. Full Technical Architecture Deep Dive */}
        <ScrollReveal delay={80}>
          <ArchitectureDeepDive />
        </ScrollReveal>

        {/* 8. Hot Path (<3ms) vs Async Kafka Plane */}
        <ScrollReveal delay={80}>
          <HotPathVsAsync />
        </ScrollReveal>

        {/* 9. Dual-Database Data Layer (Postgres, ClickHouse, Redis, Kafka) */}
        <ScrollReveal delay={80}>
          <DataInfrastructure />
        </ScrollReveal>

        {/* 10. Enterprise Security & Encryption at Rest */}
        <ScrollReveal delay={80}>
          <SecuritySection />
        </ScrollReveal>

        {/* 11. Developer Experience with Code Snippets and Terminal Trace */}
        <ScrollReveal delay={80}>
          <DeveloperExperience />
        </ScrollReveal>

        {/* 12. Multi-Provider Unified Routing */}
        <ScrollReveal delay={80}>
          <MultiProviderRouting />
        </ScrollReveal>

        {/* 13. Category Differentiation Matrix */}
        <ScrollReveal delay={80}>
          <ComparisonMatrix />
        </ScrollReveal>

        {/* 14. Final Call to Action */}
        <ScrollReveal delay={80} direction="zoom">
          <CtaSection />
        </ScrollReveal>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

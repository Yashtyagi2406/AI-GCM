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
        <ProviderBar />

        {/* 3. Problems created by production AI */}
        <ProblemsSection />

        {/* 4. Signature Before / After Differentiator with 1-line code toggle */}
        <DifferentiatorSection />

        {/* 5. 6 Core Pillars Feature System */}
        <FeatureSystem />

        {/* 6. Realistic AI-GCM Product Console Preview */}
        <DashboardPreview />

        {/* 7. Full Technical Architecture Deep Dive */}
        <ArchitectureDeepDive />

        {/* 8. Hot Path (<3ms) vs Async Kafka Plane */}
        <HotPathVsAsync />

        {/* 9. Dual-Database Data Layer (Postgres, ClickHouse, Redis, Kafka) */}
        <DataInfrastructure />

        {/* 10. Enterprise Security & Encryption at Rest */}
        <SecuritySection />

        {/* 11. Developer Experience with Code Snippets and Terminal Trace */}
        <DeveloperExperience />

        {/* 12. Multi-Provider Unified Routing */}
        <MultiProviderRouting />

        {/* 13. Category Differentiation Matrix */}
        <ComparisonMatrix />

        {/* 14. Final Call to Action */}
        <CtaSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

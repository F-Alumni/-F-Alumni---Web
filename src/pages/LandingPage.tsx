import type { FC } from 'react'
import {
  Navbar,
  Hero,
  Networking,
  Mentoring,
  Features,
  CTA,
  Footer,
} from '@/features/landing'

/**
 * LandingPage view orchestrator for FPT Alumni Connect.
 * Implements the Figma Desktop design layout:
 * - Navbar: Top brand header with navigation links and authentication CTAs
 * - Hero: Platform introduction, headline, action buttons, and community graphic
 * - Networking: 3-pillar network value row
 * - Mentoring: 2x2 core opportunity grid (Mentorship, Majors, Opportunities, Alumni)
 * - Features: 3-step timeline (Tạo hồ sơ -> Khám phá -> Kết nối & phát triển)
 * - CTA: Dark navy community onboarding banner
 * - Footer: Branding, quick links, copyright and policy notices
 */
export const LandingPage: FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col antialiased selection:bg-orange-100 selection:text-orange-900">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Networking />
        <Mentoring />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage

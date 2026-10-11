import type { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { ShieldCheck, Building2, Users2, Award } from 'lucide-react'

/**
 * Layout container for authentication workflows.
 * Implements a modern Split-Screen design tailored for FPT University Administration.
 */
export const AuthLayout: FC = () => {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Column: Form Area */}
      <div className="flex w-full flex-col justify-center px-6 py-10 md:w-1/2 lg:px-16 xl:px-24">
        <main className="mx-auto w-full max-w-md">
          <Outlet />
        </main>
      </div>

      {/* Right Column: Administration Visual & Governance Metrics */}
      <div className="relative hidden w-1/2 overflow-hidden bg-slate-900 md:block">
        <img
          src="/images/auth-bg.jpg"
          alt="FPT University Innovation & Administration Center"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        {/* FPT Brand Multi-tone Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-[#004e8a]/70 to-[#0066B2]/40" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-10 lg:p-16 text-white">
          {/* Top Tag */}
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md ring-1 ring-white/20">
              <span className="h-2 w-2 rounded-full bg-brand-accent animate-pulse" />
              FPT University Administration System
            </span>
            <span className="rounded-full bg-brand-primary/20 px-2.5 py-1 text-xs font-bold text-brand-primary backdrop-blur-md ring-1 ring-brand-primary/30">
              5 Campuses
            </span>
          </div>

          {/* Central Governance Narrative */}
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-primary bg-white/10 rounded-full backdrop-blur-sm">
                Centralized Governance Portal
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-white lg:text-4xl leading-tight">
                Alumni Network & Community Management
              </h2>
              <p className="text-sm text-white/80 max-w-lg leading-relaxed">
                Empowering university coordinators, faculty boards, and administrative staff to verify alumni degree credentials, moderate discussion circles, and track career outcomes.
              </p>
            </div>

            {/* Governance Highlight Card */}
            <div className="max-w-lg rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md shadow-2xl space-y-3">
              <div className="flex items-center gap-2.5 text-xs font-bold text-brand-accent">
                <ShieldCheck className="h-4 w-4" />
                <span>Institutional Governance Standards</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                Direct integration with FPT Academic Registry for automated verification of bachelor diplomas, student cohorts, and campus chapters.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-medium text-white/80">
                <span className="rounded-md bg-white/10 px-2 py-0.5">Hoa Lac</span>
                <span className="rounded-md bg-white/10 px-2 py-0.5">TP. Ho Chi Minh</span>
                <span className="rounded-md bg-white/10 px-2 py-0.5">Da Nang</span>
                <span className="rounded-md bg-white/10 px-2 py-0.5">Can Tho</span>
                <span className="rounded-md bg-white/10 px-2 py-0.5">Quy Nhon</span>
              </div>
            </div>

            {/* Operational Metrics */}
            <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
              <div>
                <div className="text-2xl font-bold text-white flex items-center gap-1.5">
                  <Users2 className="h-4 w-4 text-brand-primary" />
                  40k+
                </div>
                <div className="mt-0.5 text-[11px] font-medium text-white/70">Governed Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-brand-accent" />
                  85.4%
                </div>
                <div className="mt-0.5 text-[11px] font-medium text-white/70">Verified Alumni</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-sky-400" />
                  46
                </div>
                <div className="mt-0.5 text-[11px] font-medium text-white/70">Active Chapters</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout

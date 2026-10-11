import type { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { IconShieldCheck, IconSchool, IconUsers, IconAward } from '@tabler/icons-react'

/**
 * Layout container for authentication workflows.
 * Implements a modern Split-Screen design tailored for FPT University Administration.
 */
export const AuthLayout: FC = () => {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Column: Form Area */}
      <div className="flex w-full flex-col justify-center px-6 py-8 md:w-1/2 lg:px-12 xl:px-16 overflow-y-auto">
        <main className="mx-auto w-full max-w-[440px] my-auto py-4">
          <Outlet />
        </main>
      </div>

      {/* Right Column: Institutional Branding & Governance */}
      <div className="relative hidden w-1/2 overflow-hidden bg-slate-900 md:block">
        <img
          src="/images/auth-bg.jpg"
          alt="FPT University Innovation & Administration Center"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        {/* Controlled FPT Dark Blue Overlay for guaranteed optimal text readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(7, 29, 54, 0.92) 0%, rgba(0, 56, 105, 0.88) 50%, rgba(0, 102, 178, 0.78) 100%)',
          }}
        />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 lg:p-10 xl:p-12 text-white">
          {/* Top Tag */}
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md border border-white/20">
              <span className="h-2 w-2 rounded-full bg-brand-accent animate-pulse" />
              Alumni Connect Administration Portal
            </span>
          </div>

          {/* Central Governance Narrative */}
          <div className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-primary bg-white/10 rounded-full backdrop-blur-sm border border-white/15">
                Centralized University Governance
              </span>
              <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight text-white leading-tight">
                Alumni Network & Community Management
              </h2>
              <p className="text-xs text-white/80 leading-relaxed">
                Empowering university coordinators, faculty boards, and administrative staff to verify alumni credentials, oversee community spaces, and track career outcomes across FPT campuses.
              </p>
            </div>

            {/* Trust-Focused Administrative Gateway Card */}
            <div className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md shadow-sm space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-accent">
                <IconShieldCheck size={18} stroke={1.8} className="shrink-0" />
                <span>Institutional Governance Standards</span>
              </div>
              <p className="text-[11px] text-white/85 leading-relaxed">
                Direct integration with FPT Academic Registry for automated verification of bachelor diplomas, student cohorts, and campus chapters.
              </p>
            </div>

            {/* Streamlined Operational Metrics */}
            <div className="grid grid-cols-3 gap-3 border-t border-white/15 pt-3">
              <div>
                <div className="text-lg font-bold text-white flex items-center gap-1.5">
                  <IconSchool size={16} stroke={1.8} className="text-brand-accent shrink-0" />
                  <span>5</span>
                </div>
                <div className="text-[11px] font-medium text-white/70">Campuses</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white flex items-center gap-1.5">
                  <IconUsers size={16} stroke={1.8} className="text-brand-primary shrink-0" />
                  <span>40k+</span>
                </div>
                <div className="text-[11px] font-medium text-white/70">Governed Users</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white flex items-center gap-1.5">
                  <IconAward size={16} stroke={1.8} className="text-amber-300 shrink-0" />
                  <span>85.4%</span>
                </div>
                <div className="text-[11px] font-medium text-white/70">Verified Alumni</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout

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
          className="absolute inset-0 h-full w-full object-cover opacity-75"
        />
        {/* Controlled FPT Dark Blue Overlay for optimal text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#071d36]/92 via-[#003869]/85 to-[#0066B2]/75" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-8 lg:p-14 text-white">
          {/* Top Tag */}
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md border border-white/20">
              <span className="h-2 w-2 rounded-full bg-brand-accent animate-pulse" />
              Alumni Connect Administration Portal
            </span>
          </div>

          {/* Central Governance Narrative */}
          <div className="space-y-5 max-w-lg">
            <div className="space-y-2.5">
              <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-primary bg-white/10 rounded-full backdrop-blur-sm border border-white/15">
                Centralized University Governance
              </span>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Alumni Network & Community Management
              </h2>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                Empowering university coordinators, faculty boards, and administrative staff to verify alumni credentials, oversee community spaces, and track career outcomes across FPT campuses.
              </p>
            </div>

            {/* Trust-Focused Administrative Gateway Card */}
            <div className="rounded-xl border border-white/15 bg-white/10 p-4.5 backdrop-blur-md shadow-lg space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-accent">
                <IconShieldCheck size={18} stroke={1.8} className="shrink-0" />
                <span>Institutional Governance Standards</span>
              </div>
              <p className="text-xs text-white/85 leading-relaxed">
                Direct integration with FPT Academic Registry for automated verification of bachelor diplomas, student cohorts, and campus chapters.
              </p>
            </div>

            {/* Streamlined Operational Metrics */}
            <div className="grid grid-cols-3 gap-4 border-t border-white/15 pt-4">
              <div>
                <div className="text-xl font-bold text-white flex items-center gap-1.5">
                  <IconSchool size={18} stroke={1.8} className="text-brand-accent shrink-0" />
                  <span>5</span>
                </div>
                <div className="mt-0.5 text-[11px] font-medium text-white/70">Campuses</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white flex items-center gap-1.5">
                  <IconUsers size={18} stroke={1.8} className="text-brand-primary shrink-0" />
                  <span>40k+</span>
                </div>
                <div className="mt-0.5 text-[11px] font-medium text-white/70">Governed Users</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white flex items-center gap-1.5">
                  <IconAward size={18} stroke={1.8} className="text-amber-300 shrink-0" />
                  <span>85.4%</span>
                </div>
                <div className="mt-0.5 text-[11px] font-medium text-white/70">Verified Alumni</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout

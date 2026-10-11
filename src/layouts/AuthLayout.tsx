import type { FC } from 'react'
import { Outlet } from 'react-router-dom'

/**
 * Layout container for authentication workflows.
 * Implements a Split-Screen design tailored for the FPT Alumni Network.
 */
export const AuthLayout: FC = () => {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Column: Form Area */}
      <div className="flex w-full flex-col justify-center px-8 py-12 md:w-1/2 lg:px-24 xl:px-32">
        <main className="mx-auto w-full max-w-lg">
          <Outlet />
        </main>
      </div>

      {/* Right Column: Premium Visual & Testimonial */}
      <div className="relative hidden w-1/2 overflow-hidden bg-slate-900 md:block">
        <img
          src="/images/auth-bg.jpg"
          alt="Modern university alumni connecting"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary/90 via-brand-secondary/40 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-12 lg:p-20 text-white">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md ring-1 ring-white/30">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse" />
              1.4k+ Alumni & Mentors Online
            </span>
            <div className="hidden lg:flex gap-2 text-xs font-medium text-white/60">
              <span className="px-2 py-1 rounded-full bg-white/10">All Campuses</span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-primary bg-white/10 rounded-full backdrop-blur-sm">
                Career Mentorship & FPT Experience
              </span>
              <h2 className="text-4xl font-bold tracking-tight text-white lg:text-5xl leading-tight">
                Global Alumni Network
              </h2>
              <p className="text-lg text-white/80 max-w-lg">
                Join 40,000+ FPT professionals connecting, sharing knowledge, and creating career opportunities worldwide.
              </p>
            </div>

            {/* Testimonial Card */}
            <div className="max-w-xl rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md shadow-2xl">
              <blockquote className="space-y-4">
                <p className="text-base font-medium leading-relaxed text-white/95">
                  "Connecting with the right FPT alumni mentor unlocked OJT opportunities and a Silicon Valley job offer for me."
                </p>
                <footer className="flex items-center space-x-4">
                  <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-brand-primary">
                    <img
                      src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                      alt="Alumni"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-white">Minh Hoang</div>
                    <div className="text-sm text-white/70">K12 SE • Senior AI Engineer</div>
                  </div>
                </footer>
              </blockquote>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-8 border-t border-white/20 pt-8">
              <div>
                <div className="text-3xl font-bold text-white">98.2%</div>
                <div className="mt-1 text-sm font-medium text-white/70">Employment Rate Post-Grad</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">1,250+</div>
                <div className="mt-1 text-sm font-medium text-white/70">OJT & Referral Opportunities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}




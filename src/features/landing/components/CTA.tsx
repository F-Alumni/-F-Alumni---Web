import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { IconArrowRight } from '@tabler/icons-react'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/authStore'
import { ROLES } from '@/constants/roles'

export const CTA: FC = () => {
  const { isAuthenticated, role } = useAuthStore()

  const destinationPath = isAuthenticated
    ? role === ROLES.ADMIN || role === ROLES.MODERATOR
      ? ROUTES.ADMIN.DASHBOARD
      : ROUTES.APP.HOME
    : ROUTES.AUTH.REGISTER

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#081B33] px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20 shadow-2xl">
          {/* Subtle decorative circles & gradients */}
          <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 top-0 -translate-y-1/2 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -right-10 -bottom-10 w-72 h-72 border border-white/5 rounded-full pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 w-96 h-96 border border-white/5 rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white backdrop-blur-sm border border-white/15 uppercase tracking-wider mb-4">
                CÙNG NHAU PHÁT TRIỂN
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Hành trình của bạn không cần phải đi một mình.
              </h2>
              <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                Gia nhập cộng đồng FPT Alumni Connect và bắt đầu một kết nối ý nghĩa ngay hôm nay.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                to={destinationPath}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-[#F27024] hover:bg-[#d95d16] rounded-xl shadow-lg shadow-orange-950/50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>{isAuthenticated ? 'Vào cộng đồng ngay' : 'Tham gia cộng đồng'}</span>
                <IconArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

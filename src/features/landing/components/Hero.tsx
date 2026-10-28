import type { FC } from 'react'
import { Link } from 'react-router-dom'
import {
  IconArrowRight,
  IconCircleCheckFilled,
  IconCompass,
  IconSparkles,
} from '@tabler/icons-react'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/authStore'
import { ROLES } from '@/constants/roles'

export const Hero: FC = () => {
  const { isAuthenticated, role } = useAuthStore()

  const destinationPath = isAuthenticated
    ? role === ROLES.ADMIN || role === ROLES.MODERATOR
      ? ROUTES.ADMIN.DASHBOARD
      : ROUTES.APP.HOME
    : ROUTES.AUTH.REGISTER

  return (
    <section id="hero" className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-24">
      {/* Background subtle decoration */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-orange-50/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 rounded-full bg-blue-50/40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline and Call-to-actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-[#F27024] text-xs font-bold tracking-wider uppercase">
              <IconSparkles className="w-3.5 h-3.5 text-[#F27024]" />
              <span>CỘNG ĐỒNG ALUMNI FPT</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-slate-900 tracking-tight leading-[1.12]">
              Kết nối hôm nay.
              <br />
              <span className="text-[#F27024]">Bứt phá</span> ngày mai.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Cầu nối giữa sinh viên và cựu sinh viên FPT — nơi chia sẻ kinh nghiệm, tìm người
              dẫn đường và mở ra cơ hội nghề nghiệp.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to={destinationPath}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-bold text-white bg-[#F27024] hover:bg-[#d95d16] rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{isAuthenticated ? 'Vào cộng đồng ngay' : 'Khám phá cộng đồng'}</span>
                <IconArrowRight className="w-5 h-5" />
              </Link>

              <a
                href="#mentoring"
                className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200/70 transition-colors"
              >
                Tìm hiểu thêm
              </a>
            </div>

            <p className="text-xs sm:text-sm font-medium text-slate-400 pt-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>Dành cho sinh viên · Alumni · Mentor</span>
            </p>
          </div>

          {/* Right Column: Visual Community Interactive Graphic (Matching Figma Frame) */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Peach Backdrop Container */}
              <div className="rounded-3xl bg-[#FFF6EE] border border-orange-100/80 p-6 sm:p-10 shadow-sm relative overflow-hidden">
                {/* Decorative background shape */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-200/30 to-amber-100/10 rounded-full blur-2xl" />

                {/* Sub-header inside graphic card */}
                <div className="relative z-10 mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F27024] block mb-1">
                    CỘNG ĐỒNG CỦA BẠN
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
                    Những kết nối
                    <br />
                    tạo nên khác biệt
                  </h3>
                </div>

                {/* Card 1: Alumni Mentor (Linh Nguyễn) */}
                <div className="relative z-10 bg-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-200/50 border border-slate-100/90 transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#0B2545] text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-sm shrink-0">
                      LN
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-base truncate">
                          Linh Nguyễn
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 truncate">
                        Senior Engineer · FPT Software
                      </p>
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <IconCircleCheckFilled className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Alumni xác minh</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connecting Node & Pulse Line */}
                <div className="relative z-10 my-3 flex items-center justify-center">
                  <div className="w-px h-8 bg-gradient-to-b from-slate-300 via-orange-400 to-orange-500 relative flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-orange-100 border-2 border-[#F27024] flex items-center justify-center shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-[#F27024] animate-ping" />
                    </div>
                  </div>
                </div>

                {/* Card 2: Student Mentee (Minh Khôi) */}
                <div className="relative z-10 sm:ml-8 bg-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-200/50 border border-slate-100/90 transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#F27024] text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-sm shrink-0">
                      MK
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-base truncate">
                          Minh Khôi
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 truncate">
                        Software Engineering Student
                      </p>
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-[#F27024] border border-orange-200/60">
                          <IconCompass className="w-3.5 h-3.5 text-[#F27024]" />
                          <span>Đang tìm mentor</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import type { FC } from 'react'
import { Link } from 'react-router-dom'
import {
  IconArrowRight,
  IconShieldCheck,
  IconCircleCheckFilled,
  IconBriefcase,
  IconAward,
  IconSchool,
  IconCompass,
} from '@tabler/icons-react'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/authStore'

export const Hero: FC = () => {
  const { isAuthenticated } = useAuthStore()
  const destinationPath = isAuthenticated ? ROUTES.ADMIN.DASHBOARD : ROUTES.AUTH.LOGIN

  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-orange-50/30 via-white to-white py-12 sm:py-16 lg:py-20">
      {/* Background Decorative Gradients & Mesh */}
      <div className="absolute top-0 right-0 -mr-28 -mt-28 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-orange-200/40 to-amber-100/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 -ml-28 w-[380px] h-[380px] rounded-full bg-blue-100/30 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline and Call-to-actions */}
          <div className="lg:col-span-6 space-y-6">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-bold tracking-wider text-[#F27024] uppercase">
                FPT University Alumni Governance
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-slate-900 tracking-tight leading-[1.12]">
              Quản trị thông minh.
              <br />
              <span className="bg-gradient-to-r from-[#F27024] via-[#FF7828] to-[#E05D13] bg-clip-text text-transparent">
                Bứt phá
              </span>{' '}
              ngày mai.
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
              Cổng điều hành tập trung kết nối dữ liệu mạng lưới cựu sinh viên, sinh viên và giảng viên toàn bộ 5 cơ sở Đại học FPT. Giám sát an toàn cộng đồng, chuẩn hóa danh bạ và kết nối cơ hội nghề nghiệp.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to={destinationPath}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-bold text-white bg-[#F27024] hover:bg-[#d95d16] active:bg-[#c24f0e] rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] group"
              >
                <span>{isAuthenticated ? 'Vào Bảng Quản Trị ngay' : 'Đăng nhập Cổng Quản Trị'}</span>
                <IconArrowRight size={18} stroke={2.5} className="transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#mentoring"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-xl border border-slate-200/90 shadow-2xs transition-all hover:border-slate-300"
              >
                <IconCompass size={18} stroke={1.8} className="text-slate-500" />
                <span>Xem tính năng quản trị</span>
              </a>
            </div>

            {/* Institutional Stat Badges */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">5</div>
                <div className="text-xs font-semibold text-slate-500">Cơ sở toàn quốc</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">40.000+</div>
                <div className="text-xs font-semibold text-slate-500">Thành viên kết nối</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#F27024]">100%</div>
                <div className="text-xs font-semibold text-slate-500">Xác minh bằng cấp</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Operational Preview Bento Graphic */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Main Bento Container */}
              <div className="rounded-3xl bg-gradient-to-br from-[#FFF8F3] via-[#FFF3EB] to-[#FFEFE3] border border-orange-200/70 p-6 sm:p-8 shadow-xl shadow-orange-950/5 relative overflow-hidden space-y-4">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />

                {/* Top Bar: Operational Pulse */}
                <div className="relative z-10 flex items-center justify-between pb-3 border-b border-orange-200/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                      HỆ THỐNG ĐIỀU HÀNH THỜI GIAN THỰC
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white/80 px-2.5 py-0.5 rounded-full border border-orange-100">
                    FPT Identity Sync
                  </span>
                </div>

                {/* Highlight Card 1: Verified Alumni Mentor */}
                <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-4.5 shadow-md shadow-slate-200/40 border border-slate-100 transition-all hover:scale-[1.01]">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B365D] to-[#254B82] text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-sm shrink-0">
                      LN
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                          Linh Nguyễn
                        </h4>
                        <IconCircleCheckFilled size={16} className="text-[#F27024] shrink-0" />
                        <span className="text-[10px] font-bold text-orange-700 bg-orange-100/70 px-1.5 py-0.2 rounded-sm uppercase tracking-wider">
                          Verified Alumni
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        Senior Software Engineer · FPT Software HCM
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          <IconSchool size={12} className="text-slate-500" />
                          K12 · Kỹ thuật Phần mềm
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          Sẵn sàng làm Mentor
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-grid: 2 Micro-cards */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Micro-card A: Verification Queue Status */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3.5 border border-orange-100/90 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-700">Thẩm định Văn bằng</span>
                      <IconAward size={15} className="text-emerald-600" />
                    </div>
                    <div className="text-lg font-black text-slate-900">100% Khớp</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Tự động đối chiếu phòng Đào tạo FPT
                    </p>
                  </div>

                  {/* Micro-card B: OJT / Career Linkage */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3.5 border border-orange-100/90 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-700">Cơ hội OJT & Đồ án</span>
                      <IconBriefcase size={15} className="text-[#F27024]" />
                    </div>
                    <div className="text-lg font-black text-[#F27024]">1.280+</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Vị trí tuyển dụng từ mạng lưới Alumni
                    </p>
                  </div>
                </div>

                {/* Security & Moderation Footer Pill */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-600 bg-white/70 rounded-xl px-3.5 py-2 border border-orange-100">
                  <div className="flex items-center gap-2">
                    <IconShieldCheck size={16} className="text-emerald-600" />
                    <span className="font-semibold text-slate-800">Kiểm duyệt An toàn & Bảo mật:</span>
                    <span className="text-slate-500">0 vi phạm tồn đọng</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Đã kiểm toán
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

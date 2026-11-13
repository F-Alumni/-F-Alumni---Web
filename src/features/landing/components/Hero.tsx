import type { FC } from 'react'
import { Link } from 'react-router-dom'
import {
  IconArrowRight,
  IconShieldCheck,
  IconCircleCheckFilled,
  IconAward,
  IconSchool,
  IconCompass,
  IconUsers,
} from '@tabler/icons-react'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'
import { useAuthStore } from '@/stores/authStore'

export const Hero: FC = () => {
  const { isAuthenticated, role } = useAuthStore()
  const isAdminOrMod = role === ROLES.ADMIN || role === ROLES.MODERATOR
  const destinationPath = !isAuthenticated
    ? ROUTES.AUTH.LOGIN
    : isAdminOrMod
      ? ROUTES.ADMIN.DASHBOARD
      : ROUTES.APP.HOME

  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-orange-50/40 via-white to-slate-50/50 py-12 sm:py-16 lg:py-20 border-b border-slate-200/70">
      {/* Background Decorative Gradients & Subtle Dot Matrix */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-50 pointer-events-none" />
      <div className="absolute top-0 right-0 -mr-28 -mt-28 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-orange-200/35 to-amber-100/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 -ml-28 w-[400px] h-[400px] rounded-full bg-blue-100/35 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Headline, Value Proposition and Call-to-actions */}
          <div className="lg:col-span-6 space-y-6">
            {/* Live Operational Status Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-orange-200/90 shadow-sm backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-bold tracking-wider text-[#F27024] uppercase">
                FPT University Alumni Governance
              </span>
              <span className="h-3 w-[1px] bg-slate-200" />
              <span className="text-[10px] font-semibold text-slate-500">
                Toàn quốc 5 Cơ sở
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.12]">
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
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-bold text-white bg-gradient-to-r from-[#F27024] to-[#E05D13] hover:from-[#E05D13] hover:to-[#C84F0E] rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] group"
              >
                <span>
                  {!isAuthenticated
                    ? 'Tham gia / Đăng nhập ngay'
                    : isAdminOrMod
                      ? 'Vào Bảng Quản Trị ngay'
                      : 'Khám phá Cộng đồng FPT'}
                </span>
                <IconArrowRight size={18} stroke={2.5} className="transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#mentoring"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-xl border border-slate-200/90 shadow-sm transition-all hover:border-slate-300"
              >
                <IconCompass size={18} stroke={1.8} className="text-slate-500" />
                <span>Xem tính năng quản trị</span>
              </a>
            </div>

            {/* Institutional Stat Badges */}
            <div className="pt-4 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-lg">
              <div className="bg-white/80 rounded-xl p-3 border border-slate-100 shadow-sm">
                <div className="text-xl sm:text-2xl font-black text-slate-900">5</div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">Cơ sở toàn quốc</div>
              </div>
              <div className="bg-white/80 rounded-xl p-3 border border-slate-100 shadow-sm">
                <div className="text-xl sm:text-2xl font-black text-slate-900">40.000+</div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">Thành viên kết nối</div>
              </div>
              <div className="bg-white/80 rounded-xl p-3 border border-slate-100 shadow-sm">
                <div className="text-xl sm:text-2xl font-black text-[#F27024]">100%</div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">Xác minh bằng cấp</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              * Dữ liệu mô phỏng quy mô đồng bộ mạng lưới cựu sinh viên toàn hệ thống Đại học FPT.
            </p>
          </div>

          {/* Right Column: Layered Composition (Dashboard UI + Real FPT Alumni Event Photography) */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Outer Glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-orange-400/20 via-blue-500/10 to-orange-500/20 rounded-3xl blur-xl opacity-75 pointer-events-none" />

              {/* Main Container Card: Admin Dashboard UI Preview */}
              <div className="relative rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden">
                {/* Browser-style Top Bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/90 border-b border-slate-200/80 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-2 font-mono text-[11px] text-slate-500 hidden sm:inline">
                      admin.falumni.fpt.edu.vn/dashboard
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live System Active
                  </div>
                </div>

                {/* Dashboard Screenshot Preview */}
                <div className="relative bg-slate-50 border-b border-slate-200/80 overflow-hidden group">
                  <img
                    src="/images/admin-previews/dashboard-overview.png"
                    alt="F-Alumni Connect Admin Dashboard Overview"
                    className="w-full h-auto object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Bottom Section: Supporting Real Alumni Photography Card (Homecoming 2025) */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-white via-orange-50/30 to-white">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Real Photograph Thumbnail with Caption */}
                    <div className="relative w-full sm:w-44 h-28 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-sm group">
                      <img
                        src="/images/fpt-photos/alumni-homecoming-2025.jpg"
                        alt="FPT University Alumni Homecoming 2025 Gathering"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                      <span className="absolute bottom-1.5 left-2 right-2 text-[10px] font-bold text-white truncate">
                        Homecoming 2025 · FPTU
                      </span>
                    </div>

                    {/* Integrated Information */}
                    <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5">
                        <IconCircleCheckFilled size={15} className="text-[#F27024] shrink-0" />
                        <span className="text-xs font-bold text-slate-900 truncate">
                          Đại hội Hội ngộ Cựu Sinh viên Toàn quốc
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                        Hình ảnh thực tế từ sự kiện Homecoming 2025 kết nối hàng trăm cựu sinh viên nhiều thế hệ, được đồng bộ danh bạ định danh trên cổng F-Alumni.
                      </p>
                      <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1B365D] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          <IconUsers size={12} />
                          400+ Đại diện Cựu SV
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          <IconShieldCheck size={12} />
                          Hồ sơ Đã xác thực
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Verified Badge (Top Right) */}
              <div className="absolute -top-4 -right-3 hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-200/90 text-xs font-bold text-slate-800">
                <span className="w-7 h-7 rounded-lg bg-orange-50 text-[#F27024] flex items-center justify-center shrink-0">
                  <IconAward size={16} stroke={2.2} />
                </span>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Thẩm định Văn bằng</div>
                  <div className="text-xs font-extrabold text-[#F27024]">100% Khớp MSSV</div>
                </div>
              </div>

              {/* Floating Mentor Ready Badge (Bottom Left) */}
              <div className="absolute -bottom-4 -left-3 hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-200/90 text-xs font-bold text-slate-800">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1B365D] flex items-center justify-center shrink-0">
                  <IconSchool size={16} stroke={2.2} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Mạng lưới Cố vấn</div>
                  <div className="text-xs font-extrabold text-[#1B365D]">Sẵn sàng làm Mentor</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

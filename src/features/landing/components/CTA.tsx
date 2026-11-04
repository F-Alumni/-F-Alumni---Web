import type { FC } from 'react'
import { Link } from 'react-router-dom'
import {
  IconArrowRight,
  IconShieldCheck,
  IconLock,
  IconSparkles,
} from '@tabler/icons-react'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/authStore'

export const CTA: FC = () => {
  const { isAuthenticated } = useAuthStore()
  const destinationPath = isAuthenticated ? ROUTES.ADMIN.DASHBOARD : ROUTES.AUTH.LOGIN

  return (
    <section className="bg-slate-50 py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1B365D] via-[#152B4B] to-[#0D1C30] p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
          
          {/* Authentic FPT Campus Photography as subtle textured background */}
          <img
            src="/images/fpt-photos/fpt-university-campus.jpg"
            alt="FPT University Campus Environment"
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay pointer-events-none"
            loading="lazy"
          />

          {/* Ambient Lighting Accents */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#F27024]/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white mb-6">
              <IconSparkles size={14} className="text-[#F27024]" />
              <span>CỔNG ĐIỀU HÀNH TẬP TRUNG TOÀN QUỐC</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Sẵn sàng điều phối & phát triển mạng lưới FPT Alumni?
            </h2>

            <p className="mt-5 text-base sm:text-lg text-white/80 leading-relaxed max-w-2xl">
              Đăng nhập với tài khoản cán bộ quản trị hoặc ban điều phối để tiếp nhận công tác thẩm định hồ sơ, kiểm duyệt nội dung và hỗ trợ sự nghiệp sinh viên.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to={destinationPath}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 text-base font-bold text-white bg-gradient-to-r from-[#F27024] to-[#E05D13] hover:from-[#E05D13] hover:to-[#C84F0E] rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] group"
              >
                <span>{isAuthenticated ? 'Vào Bảng Quản Trị' : 'Đăng nhập Quản trị viên'}</span>
                <IconArrowRight size={18} stroke={2.5} className="transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#networking"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-white bg-white/10 hover:bg-white/15 rounded-xl border border-white/20 backdrop-blur-sm transition-all"
              >
                <span>Tìm hiểu thêm về phân quyền</span>
              </a>
            </div>

            {/* Security Guarantee List */}
            <div className="mt-10 pt-8 border-t border-white/15 flex flex-wrap items-center gap-6 text-xs text-white/75 font-medium">
              <div className="flex items-center gap-2">
                <IconShieldCheck size={16} className="text-emerald-400" />
                <span>Xác thực 2 lớp (@fpt.edu.vn)</span>
              </div>
              <div className="flex items-center gap-2">
                <IconLock size={16} className="text-orange-400" />
                <span>Audit Trail bất biến</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>5 Cơ sở đồng bộ thời gian thực</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

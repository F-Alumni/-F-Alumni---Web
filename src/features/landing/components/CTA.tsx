import type { FC } from 'react'
import { Link } from 'react-router-dom'
import {
  IconArrowRight,
  IconShieldCheck,
} from '@tabler/icons-react'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/authStore'

export const CTA: FC = () => {
  const { isAuthenticated } = useAuthStore()
  const destinationPath = isAuthenticated ? ROUTES.ADMIN.DASHBOARD : ROUTES.AUTH.LOGIN

  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B365D] via-[#1B365D] to-[#11233D] px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20 shadow-2xl shadow-slate-900/10">
          {/* Subtle decorative circles & glowing accents */}
          <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
          <div className="absolute left-1/4 top-0 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
          <div className="absolute -right-12 -bottom-12 w-80 h-80 border border-white/5 rounded-full pointer-events-none" />
          <div className="absolute -right-24 -bottom-24 w-96 h-96 border border-white/5 rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 text-orange-300 backdrop-blur-sm border border-white/15 uppercase tracking-wider">
                <IconShieldCheck size={14} stroke={2.2} />
                <span>CỔNG ĐIỀU HÀNH TẬP TRUNG</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Sẵn sàng điều phối & phát triển mạng lưới FPT Alumni?
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Đăng nhập với tài khoản cán bộ quản trị hoặc ban điều phối để tiếp nhận công tác thẩm định hồ sơ, kiểm duyệt nội dung và hỗ trợ sự nghiệp sinh viên.
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Xác thực 2 lớp (@fpt.edu.vn)
                </span>
                <span>•</span>
                <span>Audit Trail bất biến</span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to={destinationPath}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-bold text-white bg-[#F27024] hover:bg-[#d95d16] active:bg-[#c24f0e] rounded-xl shadow-lg shadow-orange-950/40 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
              >
                <span>{isAuthenticated ? 'Vào Bảng Quản Trị' : 'Đăng nhập Quản trị viên'}</span>
                <IconArrowRight size={18} stroke={2.5} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { IconShieldCheck } from '@tabler/icons-react'
import { ROUTES } from '@/constants/routes'
import fptLogo from '@/assets/fpt-logo.svg'

export const Footer: FC = () => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="bg-slate-50 border-t border-slate-200/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 pb-12 border-b border-slate-200/80">
          {/* Brand & Slogan */}
          <div className="max-w-sm space-y-3">
            <Link to={ROUTES.LANDING} className="flex items-center gap-3 group">
              <img
                src={fptLogo}
                alt="FPT Education Logo"
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div className="h-6 w-[1px] bg-slate-300" />
              <span className="font-extrabold text-slate-900 text-base tracking-tight">
                Alumni Connect
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Cổng Điều Hành & Quản Trị Mạng Lưới Cựu Sinh Viên Đại Học FPT toàn quốc.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              <IconShieldCheck size={14} className="text-emerald-600" />
              <span>Institutional Governance Standards</span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs sm:text-sm">
            <a
              href="#hero"
              onClick={(e) => handleNavClick(e, 'hero')}
              className="font-medium text-slate-600 hover:text-[#F27024] transition-colors"
            >
              Tổng quan
            </a>
            <a
              href="#networking"
              onClick={(e) => handleNavClick(e, 'networking')}
              className="font-medium text-slate-600 hover:text-[#F27024] transition-colors"
            >
              Trụ cột quản trị
            </a>
            <a
              href="#mentoring"
              onClick={(e) => handleNavClick(e, 'mentoring')}
              className="font-medium text-slate-600 hover:text-[#F27024] transition-colors"
            >
              Chức năng hệ thống
            </a>
            <a
              href="#features"
              onClick={(e) => handleNavClick(e, 'features')}
              className="font-medium text-slate-600 hover:text-[#F27024] transition-colors"
            >
              Quy trình vận hành
            </a>
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="font-semibold text-[#F27024] hover:underline"
            >
              Đăng nhập Quản trị
            </Link>
          </div>
        </div>

        {/* Bottom Section: Copyright & Compliance */}
        <div className="pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-slate-400">
          <p>
            © 2026 FPT Alumni Connect · Governance Portal · Trường Đại học FPT.
          </p>

          <div className="flex items-center gap-6">
            <span>Bảo mật & An toàn dữ liệu</span>
            <span>•</span>
            <span>Chính sách kiểm toán</span>
            <span>•</span>
            <span>FPT Education</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

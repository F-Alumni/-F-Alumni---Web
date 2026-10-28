import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export const Footer: FC = () => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Brand & Slogan */}
          <div className="max-w-sm">
            <Link to={ROUTES.ROOT} className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-[#F27024] flex items-center justify-center text-white font-black text-lg shadow-sm shadow-orange-500/20 group-hover:scale-105 transition-transform">
                F
              </div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">
                FPT Alumni Connect
              </span>
            </Link>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              Kết nối thế hệ hôm nay với kinh nghiệm của ngày mai.
            </p>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <a
              href="#hero"
              onClick={(e) => handleNavClick(e, 'hero')}
              className="text-sm font-medium text-slate-600 hover:text-[#F27024] transition-colors"
            >
              Giới thiệu
            </a>
            <a
              href="#features"
              onClick={(e) => handleNavClick(e, 'features')}
              className="text-sm font-medium text-slate-600 hover:text-[#F27024] transition-colors"
            >
              Tính năng
            </a>
            <a
              href="#networking"
              onClick={(e) => handleNavClick(e, 'networking')}
              className="text-sm font-medium text-slate-600 hover:text-[#F27024] transition-colors"
            >
              Cộng đồng
            </a>
            <a
              href="mailto:alumni@fpt.edu.vn"
              className="text-sm font-medium text-slate-600 hover:text-[#F27024] transition-colors"
            >
              Liên hệ
            </a>
          </div>
        </div>

        {/* Bottom Section: Divider, Copyright & Policies */}
        <div className="border-t border-slate-100 mt-12 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-slate-400">
            © 2026 FPT Alumni Connect · Made for the FPT community
          </p>

          <div className="flex items-center gap-6">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Quyền riêng tư
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Điều khoản sử dụng
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

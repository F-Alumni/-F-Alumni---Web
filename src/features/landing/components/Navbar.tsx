import { useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import {
  IconMenu2,
  IconX,
  IconArrowRight,
  IconShieldCheck,
  IconLayoutDashboard,
} from '@tabler/icons-react'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'
import fAlumniLogo from '@/assets/f-alumni-logo.png'

export const Navbar: FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, currentUser } = useAuthStore()

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const destinationPath = isAuthenticated ? ROUTES.ADMIN.DASHBOARD : ROUTES.AUTH.LOGIN

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Authority Badge */}
        <Link to={ROUTES.LANDING} className="flex items-center gap-3 group">
          <img
            src={fAlumniLogo}
            alt="F-Alumni Connect Logo"
            className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="hidden sm:block h-7 w-[1px] bg-slate-200" />
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-[#F27024] tracking-wider uppercase bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200/80">
            <IconShieldCheck size={13} stroke={2.2} />
            Admin Portal
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, 'hero')}
            className="text-sm font-semibold text-slate-600 hover:text-[#F27024] transition-colors"
          >
            Tổng quan
          </a>
          <a
            href="#networking"
            onClick={(e) => handleNavClick(e, 'networking')}
            className="text-sm font-semibold text-slate-600 hover:text-[#F27024] transition-colors"
          >
            Trụ cột quản trị
          </a>
          <a
            href="#mentoring"
            onClick={(e) => handleNavClick(e, 'mentoring')}
            className="text-sm font-semibold text-slate-600 hover:text-[#F27024] transition-colors"
          >
            Chức năng hệ thống
          </a>
          <a
            href="#features"
            onClick={(e) => handleNavClick(e, 'features')}
            className="text-sm font-semibold text-slate-600 hover:text-[#F27024] transition-colors"
          >
            Quy trình vận hành
          </a>
        </nav>

        {/* CTA Button */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to={ROUTES.ADMIN.DASHBOARD}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs lg:text-sm font-bold text-white bg-[#1B365D] hover:bg-[#132644] rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <IconLayoutDashboard size={16} stroke={2} />
              <span>Bảng Quản Trị ({currentUser?.name?.split(' ').pop() || 'Admin'})</span>
            </Link>
          ) : (
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs lg:text-sm font-bold text-white bg-[#F27024] hover:bg-[#d95d16] rounded-xl shadow-xs shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Đăng nhập Quản trị</span>
              <IconArrowRight size={15} stroke={2.2} />
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/98 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, 'hero')}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#F27024]"
          >
            Tổng quan
          </a>
          <a
            href="#networking"
            onClick={(e) => handleNavClick(e, 'networking')}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#F27024]"
          >
            Trụ cột quản trị
          </a>
          <a
            href="#mentoring"
            onClick={(e) => handleNavClick(e, 'mentoring')}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#F27024]"
          >
            Chức năng hệ thống
          </a>
          <a
            href="#features"
            onClick={(e) => handleNavClick(e, 'features')}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#F27024]"
          >
            Quy trình vận hành
          </a>

          <div className="pt-2 border-t border-slate-100">
            <Link
              to={destinationPath}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-bold text-white bg-[#F27024] rounded-xl shadow-xs"
            >
              <span>{isAuthenticated ? 'Vào Bảng Quản Trị' : 'Đăng nhập Quản trị viên'}</span>
              <IconArrowRight size={16} stroke={2} />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

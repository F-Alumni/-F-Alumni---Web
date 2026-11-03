import { useState } from 'react'
import type { FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconMenu2, IconX, IconArrowRight, IconDashboard } from '@tabler/icons-react'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'

export const Navbar: FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, currentUser } = useAuthStore()
  const navigate = useNavigate()

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={ROUTES.ROOT} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#F27024] flex items-center justify-center text-white font-black text-xl shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            F
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-lg tracking-tight leading-none">
              FPT Alumni Connect
            </span>
            <span className="text-[10px] font-semibold text-[#F27024] tracking-wider uppercase mt-1">
              Admin & Governance Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, 'hero')}
            className="text-sm font-medium text-slate-600 hover:text-[#F27024] transition-colors"
          >
            Tổng quan
          </a>
          <a
            href="#networking"
            onClick={(e) => handleNavClick(e, 'networking')}
            className="text-sm font-medium text-slate-600 hover:text-[#F27024] transition-colors"
          >
            Trụ cột quản trị
          </a>
          <a
            href="#mentoring"
            onClick={(e) => handleNavClick(e, 'mentoring')}
            className="text-sm font-medium text-slate-600 hover:text-[#F27024] transition-colors"
          >
            Chức năng hệ thống
          </a>
          <a
            href="#features"
            onClick={(e) => handleNavClick(e, 'features')}
            className="text-sm font-medium text-slate-600 hover:text-[#F27024] transition-colors"
          >
            Quy trình vận hành
          </a>
        </nav>

        {/* Action Buttons (Exclusively Admin oriented) */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => navigate(ROUTES.ADMIN.DASHBOARD)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#F27024] hover:bg-[#d95d16] rounded-xl shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <IconDashboard className="w-4 h-4" />
              <span>Vào Bảng Quản Trị ({currentUser?.name || 'Admin'})</span>
            </button>
          ) : (
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#F27024] hover:bg-[#d95d16] rounded-xl shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02]"
            >
              <span>Đăng nhập Quản trị viên</span>
              <IconArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Mobile menu hamburger button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <IconX className="w-6 h-6" /> : <IconMenu2 className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2">
            <a
              href="#hero"
              onClick={(e) => handleNavClick(e, 'hero')}
              className="px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-[#F27024]"
            >
              Tổng quan
            </a>
            <a
              href="#networking"
              onClick={(e) => handleNavClick(e, 'networking')}
              className="px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-[#F27024]"
            >
              Trụ cột quản trị
            </a>
            <a
              href="#mentoring"
              onClick={(e) => handleNavClick(e, 'mentoring')}
              className="px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-[#F27024]"
            >
              Chức năng hệ thống
            </a>
            <a
              href="#features"
              onClick={(e) => handleNavClick(e, 'features')}
              className="px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-[#F27024]"
            >
              Quy trình vận hành
            </a>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  navigate(ROUTES.ADMIN.DASHBOARD)
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-[#F27024] hover:bg-[#d95d16] rounded-xl shadow-md"
              >
                <IconDashboard className="w-4 h-4" />
                <span>Vào Bảng Quản Trị ({currentUser?.name || 'Admin'})</span>
              </button>
            ) : (
              <Link
                to={ROUTES.AUTH.LOGIN}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-[#F27024] hover:bg-[#d95d16] rounded-xl shadow-md"
              >
                <span>Đăng nhập Quản trị viên</span>
                <IconArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

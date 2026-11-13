import type { FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconHome, IconCompassOff } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import fAlumniLogo from '@/assets/f-alumni-logo.png'

/**
 * Standard Web 404 Not Found View.
 * Provides intuitive navigation recovery, contextual FPT branding,
 * and quick shortcuts back to safety.
 */
export const NotFoundPage: FC = () => {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased selection:bg-orange-100 selection:text-orange-900">
      {/* Top Simple Brand Bar */}
      <header className="border-b border-slate-200/80 bg-white/95 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to={ROUTES.ROOT} className="flex items-center gap-2">
            <img src={fAlumniLogo} alt="F-Alumni Connect" className="h-9 w-auto object-contain" />
          </Link>
          <div className="text-xs font-medium text-slate-500">
            FPT University Alumni & Student Platform
          </div>
        </div>
      </header>

      {/* Main 404 Visual Content */}
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="mx-auto w-full max-w-xl text-center">
          {/* Visual Icon Badge */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-50 text-brand-primary shadow-inner ring-8 ring-orange-50/50">
            <IconCompassOff className="h-12 w-12" stroke={1.75} />
          </div>

          {/* Error Tag & Code */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-primary">
            <span className="h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
            Lỗi 404 • Không tìm thấy trang
          </div>

          {/* Heading */}
          <h1 className="font-heading mb-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Trang bạn tìm kiếm không tồn tại
          </h1>

          {/* Descriptive Prose */}
          <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
            Đường dẫn có thể đã bị thay đổi, bị gỡ bỏ hoặc bạn đã nhập sai địa chỉ URL trên thanh địa chỉ.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border-slate-300 px-5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-900"
            >
              <IconArrowLeft className="h-4 w-4" stroke={2} />
              Quay lại trang trước
            </Button>

            <Link to={ROUTES.ROOT}>
              <Button className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-primary px-6 text-sm font-semibold text-white shadow-md shadow-brand-primary/20 transition-all hover:bg-brand-primary-hover hover:shadow-lg hover:shadow-brand-primary/25">
                <IconHome className="h-4 w-4" stroke={2} />
                Về trang chủ
              </Button>
            </Link>
          </div>

          {/* Helpful Shortcuts */}
          <div className="mt-12 border-t border-slate-200/80 pt-6">
            <p className="text-xs font-medium text-slate-500">Các lối tắt phổ biến:</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-brand-primary">
              <Link to={ROUTES.APP.HOME} className="hover:underline">
                Bảng tin cộng đồng
              </Link>
              <span className="text-slate-300">•</span>
              <Link to={ROUTES.APP.ALUMNI} className="hover:underline">
                Danh bạ cựu sinh viên
              </Link>
              <span className="text-slate-300">•</span>
              <Link to={ROUTES.APP.JOBS} className="hover:underline">
                Cơ hội việc làm & Mentor
              </Link>
              <span className="text-slate-300">•</span>
              <Link to={ROUTES.AUTH.LOGIN} className="hover:underline">
                Đăng nhập hệ thống
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} FPT University Alumni Connect. Mọi quyền được bảo lưu.
      </footer>
    </div>
  )
}

export default NotFoundPage

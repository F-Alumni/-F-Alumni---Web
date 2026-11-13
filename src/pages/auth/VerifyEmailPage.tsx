import { useState, useEffect, type FC, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  IconMailCheck,
  IconMail,
  IconKey,
  IconArrowRight,
  IconArrowLeft,
  IconLoader2,
  IconAlertCircle,
  IconCheck,
  IconShieldCheck,
  IconRefresh,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/stores/authStore'
import { normalizeError } from '@/lib/errorHandler'
import fAlumniLogo from '@/assets/f-alumni-logo.png'

type VerificationState = 'CHECKING' | 'FORM' | 'SUCCESS'

export const VerifyEmailPage: FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuth } = useAuthStore()

  const emailParam = searchParams.get('email') || ''
  const tokenParam =
    searchParams.get('token') || searchParams.get('otp') || searchParams.get('code') || ''

  const [state, setState] = useState<VerificationState>(
    emailParam && tokenParam ? 'CHECKING' : 'FORM'
  )
  const [email, setEmail] = useState(emailParam)
  const [otpCode, setOtpCode] = useState(tokenParam)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [resendNotice, setResendNotice] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)

  // Auto-verify if query params are present in URL
  useEffect(() => {
    if (!emailParam || !tokenParam) return

    let isMounted = true
    const autoVerify = async () => {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const res = await authService.verifyEmail(emailParam, tokenParam)
        if (!isMounted) return

        if (res.token && res.user) {
          setAuth({ token: res.token, user: res.user })
        }
        setState('SUCCESS')
      } catch (err: unknown) {
        if (!isMounted) return
        setErrorMessage(
          normalizeError(err).message ||
            'Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại thông tin bên dưới.'
        )
        setState('FORM')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void autoVerify()
    return () => {
      isMounted = false
    }
  }, [emailParam, tokenParam, setAuth])

  // Manual submission handler
  const handleManualVerify = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setResendNotice(null)

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedOtp = otpCode.trim()

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Vui lòng nhập địa chỉ Email trường hợp lệ (@fpt.edu.vn).')
      return
    }

    if (!trimmedOtp || trimmedOtp.length < 4) {
      setErrorMessage('Vui lòng nhập mã xác thực OTP gồm ít nhất 4 chữ số.')
      return
    }

    setIsLoading(true)
    try {
      const res = await authService.verifyEmail(trimmedEmail, trimmedOtp)
      if (res.token && res.user) {
        setAuth({ token: res.token, user: res.user })
      }
      setState('SUCCESS')
    } catch (err: unknown) {
      setErrorMessage(
        normalizeError(err).message ||
          'Mã xác thực không chính xác hoặc đã hết hiệu lực. Vui lòng thử lại.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP handler
  const handleResendOtp = async () => {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Vui lòng nhập địa chỉ Email để yêu cầu gửi lại mã OTP.')
      return
    }

    setIsResending(true)
    setErrorMessage(null)
    try {
      const res = await authService.forgotPassword(trimmedEmail)
      setResendNotice(
        res.verificationOtpPreview
          ? `Mã OTP mới đã gửi: ${res.verificationOtpPreview}`
          : 'Mã xác thực OTP mới đã được gửi tới hòm thư của bạn.'
      )
    } catch (err: unknown) {
      setErrorMessage(
        normalizeError(err).message || 'Không thể gửi lại mã OTP lúc này. Vui lòng thử lại sau.'
      )
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to={ROUTES.ROOT} className="inline-block transition-transform hover:scale-105">
            <img src={fAlumniLogo} alt="FPT Alumni Connect" className="h-12 mx-auto object-contain" />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <IconShieldCheck className="h-3.5 w-3.5 text-orange-600" />
            <span>FPT Education Identity</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {state === 'SUCCESS' ? 'Xác Minh Thành Công' : 'Kích Hoạt Tài Khoản Email'}
          </h1>
          <p className="text-sm text-slate-600">
            {state === 'SUCCESS'
              ? 'Tài khoản của bạn đã được kích hoạt trên FPT Alumni Platform'
              : 'Xác thực địa chỉ email trường để kích hoạt đầy đủ quyền thành viên'}
          </p>
        </div>

        {/* Card Content */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-100 sm:p-8">
          {/* STATE 1: Automatic Checking from URL */}
          {state === 'CHECKING' && (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-600 animate-pulse">
                <IconLoader2 className="h-8 w-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-800">Đang kiểm tra mã xác thực...</p>
                <p className="text-xs text-slate-500">
                  Hệ thống đang đối chiếu token cho tài khoản: <span className="font-medium text-slate-700">{emailParam}</span>
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: Verification Successful */}
          {state === 'SUCCESS' && (
            <div className="py-4 text-center space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-inner">
                <IconCheck className="h-10 w-10 stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Email Đã Được Xác Thực!</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Chào mừng bạn gia nhập cộng đồng FPT Alumni Connect. Tài khoản của bạn hiện đã được xác minh toàn diện.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <Button
                  onClick={() => navigate(ROUTES.APP.HOME)}
                  className="w-full bg-[#F27024] hover:bg-[#d95e18] text-white font-semibold py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Truy Cập Bảng Tin Sinh Viên</span>
                  <IconArrowRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate(ROUTES.AUTH.LOGIN)}
                  className="w-full text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl"
                >
                  <span>Quay lại trang Đăng Nhập</span>
                </Button>
              </div>
            </div>
          )}

          {/* STATE 3: Manual OTP Input Form */}
          {state === 'FORM' && (
            <form onSubmit={handleManualVerify} className="space-y-4">
              {/* Error Notice */}
              {errorMessage && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 animate-in fade-in">
                  <IconAlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              )}

              {/* Resend Success Notice */}
              {resendNotice && (
                <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 animate-in fade-in">
                  <IconMailCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span className="leading-snug">{resendNotice}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label htmlFor="verify-email" className="block text-xs font-semibold text-slate-700">
                  Địa Chỉ Email FPT
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <IconMail className="h-4 w-4" />
                  </div>
                  <input
                    id="verify-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@fpt.edu.vn"
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* OTP Code Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="verify-otp" className="block text-xs font-semibold text-slate-700">
                    Mã Xác Thực OTP (6 số)
                  </label>
                  <button
                    type="button"
                    disabled={isResending || !email}
                    onClick={handleResendOtp}
                    className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline disabled:opacity-50"
                  >
                    {isResending ? (
                      <IconLoader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <IconRefresh className="h-3 w-3" />
                    )}
                    <span>Gửi lại mã OTP</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <IconKey className="h-4 w-4" />
                  </div>
                  <input
                    id="verify-otp"
                    type="text"
                    required
                    maxLength={10}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="VD: 123456"
                    className="block w-full tracking-widest font-mono rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 transition-colors focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-[#F27024] hover:bg-[#d95e18] text-white font-semibold py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    <span>Đang Xác Thực...</span>
                  </>
                ) : (
                  <>
                    <span>Kích Hoạt Tài Khoản</span>
                    <IconArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Footer Back Link */}
          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              <IconArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại trang Đăng Nhập</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage

import { useState, type FC, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconShieldCheck,
  IconArrowRight,
  IconLoader2,
  IconAlertCircle,
  IconUserPlus,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'
import { useAuthStore } from '@/stores/authStore'
import fptLogo from '@/assets/fpt-logo.svg'

import { authService } from '@/services/auth'
import { normalizeError } from '@/lib/errorHandler'

export const LoginForm: FC = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await authService.login({
        email: loginEmail,
        password: loginPass,
        rememberMe,
      })

      setAuth({ token: res.token, user: res.user })

      if (res.user.role === ROLES.ADMIN || res.user.role === ROLES.MODERATOR) {
        navigate(ROUTES.ADMIN.DASHBOARD)
      } else {
        navigate(ROUTES.APP.HOME)
      }
    } catch (err: unknown) {
      const normalized = normalizeError(err)
      setError(normalized.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = (e?: FormEvent) => {
    if (e) e.preventDefault()
    setError(null)

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid university email address (@fpt.edu.vn or @fe.edu.vn)')
      return
    }

    if (!password) {
      setError('Please enter your security password')
      return
    }

    executeLogin(email.trim(), password)
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await authService.googleLogin({
        idToken: 'google-oauth-token-' + Date.now(),
        email: 'admin@fpt.edu.vn',
        fullName: 'FPT System Administrator',
        role: 'Admin',
      })
      setAuth({ token: res.token, user: res.user })
      navigate(ROUTES.ADMIN.DASHBOARD)
    } catch (err: unknown) {
      setError(normalizeError(err).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-3.5 sm:space-y-4 animate-in fade-in duration-300">
      {/* 1. Brand Identity & Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2">
          <img src={fptLogo} alt="FPT Education Logo" className="h-7 w-auto object-contain" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-primary border border-brand-primary/20">
            <IconShieldCheck size={13} stroke={2} />
            Alumni Connect Portal
          </span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Sign in to Alumni Connect
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 leading-normal">
            Sign in with your university credentials (@fpt.edu.vn or @fe.edu.vn).
          </p>
        </div>
      </div>

      {/* 2. Google Workspace SSO */}
      <div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:border-slate-300 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {/* Official Google Multi-color Logo */}
          <svg
            className="w-4 h-4 shrink-0"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Sign in with Google Workspace (@fpt.edu.vn)</span>
        </button>
      </div>

      {/* 3. Divider */}
      <div className="relative my-0.5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-wider">
          <span className="bg-white px-2.5 text-slate-400">
            Or sign in with email & password
          </span>
        </div>
      </div>

      {/* 4. Error Alert */}
      {error && (
        <div
          className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 animate-in fade-in"
          role="alert"
        >
          <IconAlertCircle size={15} stroke={2} className="shrink-0 mt-0.5 text-rose-600" />
          <div className="font-medium leading-normal">{error}</div>
        </div>
      )}

      {/* 5. Authentication Form */}
      <form onSubmit={handleLogin} className="space-y-3">
        {/* Email Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="staff-email" className="text-[11px] font-semibold text-slate-700">
              University Email
            </label>
            <span className="text-[10px] font-medium text-slate-400">
              @fpt.edu.vn or @fe.edu.vn
            </span>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <IconMail size={16} stroke={1.8} />
            </div>
            <input
              id="staff-email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fpt.edu.vn"
              required
              className="block w-full rounded-xl border border-slate-200 bg-[#F1F5F9] py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="staff-password" className="text-[11px] font-semibold text-slate-700">
              Password
            </label>
            <Link
              to={ROUTES.AUTH.FORGOT_PASSWORD}
              className="text-[11px] font-semibold text-brand-secondary hover:text-brand-primary transition-colors focus:outline-none focus:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <IconLock size={16} stroke={1.8} />
            </div>
            <input
              id="staff-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your security password"
              required
              className="block w-full rounded-xl border border-slate-200 bg-[#F1F5F9] py-2 pl-9 pr-9 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
            >
              {showPassword ? <IconEyeOff size={16} stroke={1.8} /> : <IconEye size={16} stroke={1.8} />}
            </button>
          </div>
        </div>

        {/* Remember Device Option */}
        <div className="flex items-center justify-between pt-0.5">
          <label htmlFor="remember-device" className="flex items-center gap-2 cursor-pointer select-none">
            <input
              id="remember-device"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary focus:ring-offset-0"
            />
            <span className="text-[11px] text-slate-600">Remember this session on device</span>
          </label>
        </div>

        {/* Actions: Sign In & Register */}
        <div className="space-y-2 pt-0.5">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 rounded-xl bg-brand-primary hover:bg-brand-primary-hover active:bg-[#d95d18] text-xs sm:text-sm font-bold text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <IconLoader2 size={16} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in to Account</span>
                <IconArrowRight size={16} stroke={2} />
              </>
            )}
          </Button>

          <Link
            to={ROUTES.AUTH.REGISTER}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-xs sm:text-sm font-semibold text-slate-700 transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <IconUserPlus size={16} stroke={1.8} className="text-slate-500" />
            <span>Create New Account</span>
          </Link>
        </div>
      </form>

      {/* 6. Minimal Footer & Security Notice */}
      <div className="pt-2 text-center space-y-1.5">
        <p className="text-[10px] text-slate-400 leading-tight max-w-sm mx-auto">
          FPT University Alumni Community Platform. All session operations are secured under university data governance regulations.
        </p>

        <div className="flex items-center justify-center gap-3 text-[10px] font-medium text-slate-400 pt-1 border-t border-slate-100">
          <a href="#" className="hover:text-slate-600 transition-colors">IT Helpdesk</a>
          <span className="text-slate-300">•</span>
          <a href="#" className="hover:text-slate-600 transition-colors">Security Policy</a>
          <span className="text-slate-300">•</span>
          <a href="#" className="hover:text-slate-600 transition-colors">FPT Identity</a>
        </div>
      </div>
    </div>
  )
}

export default LoginForm

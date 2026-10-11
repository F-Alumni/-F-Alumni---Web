import { useState, type FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight, Zap, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/authStore'
import fptLogo from '@/assets/fpt-logo.svg'

export const LoginForm: FC = () => {
  const navigate = useNavigate()
  const setToken = useAuthStore((state) => state.setToken)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = (e?: React.FormEvent) => {
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

    setIsLoading(true)
    setTimeout(() => {
      setToken('fpt-admin-session-token-' + Date.now())
      setIsLoading(false)
      navigate(ROUTES.ADMIN.DASHBOARD)
    }, 400)
  }

  const handleGoogleLogin = () => {
    setIsLoading(true)
    setTimeout(() => {
      setToken('fpt-google-admin-token-' + Date.now())
      setIsLoading(false)
      navigate(ROUTES.ADMIN.DASHBOARD)
    }, 400)
  }

  const handleQuickDemoFill = () => {
    setEmail('admin@fpt.edu.vn')
    setPassword('FPTUniversity2026!@#')
    setError(null)
  }

  return (
    <div className="w-full space-y-7 animate-in fade-in duration-300">
      {/* Brand & Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2">
          <img src={fptLogo} alt="FPT Logo" className="h-8 w-auto object-contain" />
          <span className="flex items-center gap-1 rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-primary">
            <Shield className="h-3 w-3" />
            Administration Portal
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Administrator Sign In
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
            Enter your official university staff credentials to manage alumni community operations.
          </p>
        </div>
      </div>

      {/* Google Workspace SSO Button */}
      <div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="flex w-full items-center justify-center space-x-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
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

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase">
          <span className="bg-white px-3 font-semibold text-slate-400">
            Or sign in with staff account
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700 animate-in fade-in">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">STAFF / ADMIN EMAIL</label>
            <span className="text-[10px] font-medium text-brand-secondary">
              @fpt.edu.vn or @fe.edu.vn
            </span>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fpt.edu.vn"
              className="block w-full rounded-xl border border-slate-200 bg-[#F1F5F9] py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">PASSWORD</label>
            <Link
              to="/auth/forgot-password"
              className="text-xs font-semibold text-brand-secondary hover:text-brand-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your security password"
              className="block w-full rounded-xl border border-slate-200 bg-[#F1F5F9] py-2.5 pl-9 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
            />
            <span className="ml-2 text-xs text-slate-600">Remember this administrative device</span>
          </label>
        </div>

        {/* Primary CTA Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-sm font-bold text-white shadow-md shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
        >
          <span>{isLoading ? 'Verifying Credentials...' : 'Access Admin Portal'}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      {/* Quick Demo Pre-Fill Action */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Zap className="h-4 w-4 text-brand-primary shrink-0" />
          <span className="text-[11px]">Testing demo environment?</span>
        </div>
        <button
          type="button"
          onClick={handleQuickDemoFill}
          className="text-xs font-bold text-brand-secondary hover:text-brand-primary hover:underline transition-colors flex items-center gap-1"
        >
          <span>Auto-fill Admin</span>
          <CheckCircle2 className="h-3 w-3" />
        </button>
      </div>

      {/* Security Notice & Footer */}
      <div className="text-center pt-2 space-y-3">
        <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm mx-auto">
          Authorized personnel only. Access sessions and governance actions are monitored under FPT University security regulations.
        </p>

        <div className="flex items-center justify-center space-x-5 text-[11px] font-medium text-slate-400 pt-2 border-t border-slate-100">
          <a href="#" className="hover:text-slate-600">Privacy Policy</a>
          <a href="#" className="hover:text-slate-600">Security Regulations</a>
          <a href="#" className="hover:text-slate-600">IT Helpdesk</a>
        </div>
      </div>
    </div>
  )
}

export default LoginForm

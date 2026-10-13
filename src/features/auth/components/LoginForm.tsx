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
  IconSparkles,
  IconCheck,
  IconSchool,
  IconUserCheck,
  IconBook,
  IconShield,
  IconFlag,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'
import { useAuthStore } from '@/stores/authStore'
import { DEMO_USERS, getDemoUserByEmail, type DemoUserConfig } from '@/constants/demoUsers'
import fptLogo from '@/assets/fpt-logo.svg'

export const LoginForm: FC = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDemoKey, setSelectedDemoKey] = useState<string | null>(null)

  const completeLoginWithUser = (user: DemoUserConfig) => {
    setIsLoading(true)
    setError(null)
    setTimeout(() => {
      const token = `fpt-auth-token-${user.role.toLowerCase()}-${user.userType.toLowerCase()}-${Date.now()}`
      setAuth({ token, user })
      setIsLoading(false)

      if (user.role === ROLES.ADMIN || user.role === ROLES.MODERATOR) {
        navigate(ROUTES.ADMIN.DASHBOARD)
      } else {
        navigate(ROUTES.APP.HOME)
      }
    }, 350)
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

    // Match with known demo account or determine best role
    const matchedUser = getDemoUserByEmail(email)
    if (matchedUser) {
      completeLoginWithUser(matchedUser)
      return
    }

    // Default heuristic for custom email login
    const isMod = email.toLowerCase().includes('mod')
    const isFaculty = email.toLowerCase().includes('faculty') || email.toLowerCase().includes('fe.edu.vn')
    const isAlumni = email.toLowerCase().includes('alumni')

    let resolvedUser: DemoUserConfig = DEMO_USERS.STUDENT
    if (email.toLowerCase().includes('admin')) {
      resolvedUser = DEMO_USERS.ADMIN
    } else if (isMod) {
      resolvedUser = DEMO_USERS.MODERATOR
    } else if (isFaculty) {
      resolvedUser = DEMO_USERS.FACULTY
    } else if (isAlumni) {
      resolvedUser = DEMO_USERS.ALUMNI
    }

    completeLoginWithUser({
      ...resolvedUser,
      id: `USR-CUSTOM-${Date.now()}`,
      name: email.split('@')[0] || 'User',
      email: email.trim(),
    })
  }

  const handleGoogleLogin = () => {
    completeLoginWithUser(DEMO_USERS.ADMIN)
  }

  const handleSelectDemoActor = (key: keyof typeof DEMO_USERS, autoLogin: boolean = true) => {
    const demoUser = DEMO_USERS[key]
    setSelectedDemoKey(key)
    setEmail(demoUser.email)
    setPassword('FPTUniversity2026!@#')
    setError(null)

    if (autoLogin) {
      completeLoginWithUser(demoUser)
    }
  }

  const demoRolesList: {
    key: keyof typeof DEMO_USERS
    title: string
    subtitle: string
    email: string
    icon: typeof IconShield
    badgeColor: string
    targetPath: string
  }[] = [
    {
      key: 'ADMIN',
      title: 'Admin',
      subtitle: 'System Admin',
      email: DEMO_USERS.ADMIN.email,
      icon: IconShield,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      targetPath: '/admin/dashboard',
    },
    {
      key: 'MODERATOR',
      title: 'Moderator',
      subtitle: 'Content & Safety',
      email: DEMO_USERS.MODERATOR.email,
      icon: IconFlag,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      targetPath: '/admin/dashboard',
    },
    {
      key: 'FACULTY',
      title: 'Faculty',
      subtitle: 'Academic Staff',
      email: DEMO_USERS.FACULTY.email,
      icon: IconBook,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      targetPath: '/app/home',
    },
    {
      key: 'STUDENT',
      title: 'Student',
      subtitle: 'K17 Enrolled',
      email: DEMO_USERS.STUDENT.email,
      icon: IconSchool,
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      targetPath: '/app/home',
    },
    {
      key: 'ALUMNI',
      title: 'Alumni',
      subtitle: 'K14 Verified',
      email: DEMO_USERS.ALUMNI.email,
      icon: IconUserCheck,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      targetPath: '/app/home',
    },
  ]

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* 1. Brand Identity & Header */}
      <div className="space-y-2.5">
        <div className="inline-flex items-center gap-2">
          <img src={fptLogo} alt="FPT Education Logo" className="h-8 w-auto object-contain" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-primary border border-brand-primary/20">
            <IconShieldCheck size={14} stroke={2} />
            Alumni Connect Portal
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign in to Alumni Connect
          </h1>
          <p className="mt-1 text-xs text-slate-500 leading-normal">
            Select a role below for fast demo testing, or sign in with your official university credentials.
          </p>
        </div>
      </div>

      {/* 2. Quick Demo Role Selection (All 5 Platform Actors) */}
      <div className="rounded-2xl border border-brand-primary/20 bg-gradient-to-br from-orange-50/60 to-slate-50 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconSparkles size={16} stroke={2} className="text-brand-primary shrink-0" />
            <span className="text-xs font-bold text-slate-800">
              Quick Demo Role Testing
            </span>
          </div>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            1-Click Sign In
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {demoRolesList.map((demo) => {
            const Icon = demo.icon
            const isSelected = selectedDemoKey === demo.key
            return (
              <button
                key={demo.key}
                type="button"
                onClick={() => handleSelectDemoActor(demo.key, true)}
                disabled={isLoading}
                title={`Sign in immediately as ${demo.title} (${demo.email})`}
                className={`flex flex-col items-start p-2 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-brand-primary bg-white shadow-xs ring-2 ring-brand-primary/20'
                    : 'border-slate-200 bg-white/90 hover:border-brand-primary/40 hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${demo.badgeColor}`}>
                    <Icon size={12} stroke={2} />
                    {demo.title}
                  </span>
                  {isSelected && <IconCheck size={14} className="text-brand-primary" stroke={2.5} />}
                </div>
                <span className="mt-1 text-[11px] font-semibold text-slate-900 leading-tight">
                  {demo.subtitle}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-full">
                  {demo.email.split('@')[0]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Google Workspace SSO */}
      <div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {/* Official Google Multi-color Logo */}
          <svg
            className="w-5 h-5 shrink-0"
            width="20"
            height="20"
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

      {/* 4. Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
          <span className="bg-white px-3 text-slate-400">
            Or sign in with email & password
          </span>
        </div>
      </div>

      {/* 5. Error Alert */}
      {error && (
        <div
          className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 animate-in fade-in"
          role="alert"
        >
          <IconAlertCircle size={16} stroke={2} className="shrink-0 mt-0.5 text-rose-600" />
          <div className="font-medium leading-normal">{error}</div>
        </div>
      )}

      {/* 6. Authentication Form */}
      <form onSubmit={handleLogin} className="space-y-3.5">
        {/* Email Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="staff-email" className="text-xs font-semibold text-slate-700">
              University Email
            </label>
            <span className="text-[11px] font-medium text-slate-400">
              @fpt.edu.vn or @fe.edu.vn
            </span>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <IconMail size={18} stroke={1.8} />
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
              className="block w-full rounded-xl border border-slate-200 bg-[#F1F5F9] py-2.5 pl-10 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="staff-password" className="text-xs font-semibold text-slate-700">
              Password
            </label>
            <Link
              to={ROUTES.AUTH.FORGOT_PASSWORD}
              className="text-xs font-semibold text-brand-secondary hover:text-brand-primary transition-colors focus:outline-none focus:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <IconLock size={18} stroke={1.8} />
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
              className="block w-full rounded-xl border border-slate-200 bg-[#F1F5F9] py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
            >
              {showPassword ? <IconEyeOff size={18} stroke={1.8} /> : <IconEye size={18} stroke={1.8} />}
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
              className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary focus:ring-offset-0"
            />
            <span className="text-xs text-slate-600">Remember this session on device</span>
          </label>
        </div>

        {/* Primary CTA */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl bg-brand-primary hover:bg-brand-primary-hover active:bg-[#d95d18] text-xs sm:text-sm font-bold text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <IconLoader2 size={18} className="animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in to Account</span>
              <IconArrowRight size={18} stroke={2} />
            </>
          )}
        </Button>
      </form>

      {/* 7. Minimal Footer & Security Notice */}
      <div className="pt-2 text-center space-y-2.5">
        <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm mx-auto">
          FPT University Alumni Community Platform. All session operations are secured under university data governance regulations.
        </p>

        <div className="flex items-center justify-center gap-4 text-[11px] font-medium text-slate-400 pt-1.5 border-t border-slate-100">
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

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import fptLogo from '@/assets/fpt-logo.svg'

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(ROUTES.APP.HOME)
  }

  const handleGoogleLogin = () => {
    navigate(ROUTES.APP.HOME)
  }

  return (
    <div className="w-full space-y-8">
      {/* Logo & Heading */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2">
          <img src={fptLogo} alt="FPT Logo" className="h-8 w-auto object-contain" />
          <span className="text-sm font-semibold tracking-wider text-slate-500">
            ALUMNI & STUDENT NETWORK
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome back, FPTers!
        </h1>
        <p className="text-sm text-slate-500">
          Sign in with your @fpt.edu.vn or @fe.edu.vn email to connect with 40,000+ alumni and students.
        </p>
      </div>

      {/* Google SSO */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center space-x-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
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
          <span>Sign in with Google</span>
          <span className="ml-2 inline-flex items-center rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-semibold text-brand-primary">
            Recommended
          </span>
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-500 font-semibold">
            Or sign in with password
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">ALUMNI / STUDENT EMAIL</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Mail className="h-5 w-5" />
            </div>
            <input
              type="email"
              placeholder="mssv@fpt.edu.vn"
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">PASSWORD</label>
            <Link to="/forgot-password" className="text-xs font-medium text-brand-secondary hover:text-brand-primary transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-900 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
            Remember me on this device
          </label>
        </div>

        <Button type="submit" className="w-full py-6 rounded-xl bg-gradient-to-r from-brand-primary to-orange-400 hover:from-orange-500 hover:to-orange-400 text-base font-semibold shadow-md shadow-brand-primary/20">
          Sign in to network &rarr;
        </Button>

        <div className="pt-1">
          <Link
            to={ROUTES.AUTH.REGISTER}
            className="flex w-full items-center justify-center py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
          >
            Create new account
          </Link>
        </div>
      </form>

      {/* Footer Links */}
      <div className="text-center pt-2 space-y-2">
        <p className="text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.AUTH.REGISTER} className="font-semibold text-brand-primary hover:underline">
            Register here &rarr;
          </Link>
        </p>
      </div>

      <div className="flex items-center justify-center space-x-6 pt-8 text-xs font-medium text-slate-400">
        <Link to="#" className="hover:text-slate-600">Privacy</Link>
        <Link to="#" className="hover:text-slate-600">Network Terms</Link>
        <Link to="#" className="hover:text-slate-600">Support</Link>
      </div>
    </div>
  )
}


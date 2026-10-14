import { useState, type FC, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowLeft,
  IconArrowRight,
  IconShieldCheck,
  IconSparkles,
  IconKey,
  IconLoader2,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { authService } from '@/services/auth'
import { normalizeError } from '@/lib/errorHandler'
import fptLogo from '@/assets/fpt-logo.svg'

type RecoveryStep = 'REQUEST' | 'RESET' | 'SUCCESS'

export const ForgotPasswordForm: FC = () => {
  const navigate = useNavigate()

  const [step, setStep] = useState<RecoveryStep>('REQUEST')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  // Request reset token
  const handleRequestToken = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid university email address')
      return
    }

    setIsLoading(true)
    try {
      const res = await authService.forgotPassword(email.trim())
      setSuccessNotice(res.message || 'Reset token generated successfully.')
      if (res.token) {
        setToken(res.token)
      }
      setStep('RESET')
    } catch (err: unknown) {
      setError(normalizeError(err).message || 'Failed to request reset token.')
    } finally {
      setIsLoading(false)
    }
  }

  // Submit password reset with token
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!token.trim()) {
      setError('Please enter the security reset token')
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      await authService.resetPassword(email.trim(), token.trim(), newPassword)
      setStep('SUCCESS')
    } catch (err: unknown) {
      setError(normalizeError(err).message || 'Password reset failed.')
    } finally {
      setIsLoading(false)
    }
  }

  // Password strength
  const getStrength = () => {
    if (!newPassword) return { score: 0, label: 'Empty', color: 'bg-slate-200' }
    let s = 0
    if (newPassword.length >= 6) s += 1
    if (newPassword.length >= 10) s += 1
    if (/[A-Z]/.test(newPassword)) s += 1
    if (/[0-9]/.test(newPassword)) s += 1
    if (/[^A-Za-z0-9]/.test(newPassword)) s += 1
    if (s <= 2) return { score: 33, label: 'Weak', color: 'bg-rose-500' }
    if (s <= 4) return { score: 66, label: 'Medium', color: 'bg-amber-500' }
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' }
  }

  const strength = getStrength()

  // SUCCESS STEP VIEW
  if (step === 'SUCCESS') {
    return (
      <div className="w-full space-y-4 py-2 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-md animate-pulse" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/25">
            <IconShieldCheck size={30} stroke={2} />
          </div>
          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow-xs ring-2 ring-white">
            <IconSparkles size={11} stroke={2.5} />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
            <IconCheck size={12} stroke={2.5} />
            Password Successfully Updated
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Security Credentials Reset
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Your university security password has been changed. You can now use your new password to sign in to Alumni Connect.
          </p>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            onClick={() => navigate(ROUTES.AUTH.LOGIN)}
            className="w-full h-10.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover active:bg-[#d95d18] text-xs sm:text-sm font-bold text-white shadow-md shadow-brand-primary/20 flex items-center justify-center gap-2 transition-all"
          >
            <span>Sign in to Account</span>
            <IconArrowRight size={16} stroke={2} />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-3.5 sm:space-y-4 animate-in fade-in duration-300">
      {/* 1. Header & Identity */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Link to={ROUTES.AUTH.LOGIN} className="inline-flex items-center gap-2">
            <img src={fptLogo} alt="FPT Education Logo" className="h-7 w-auto object-contain" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-primary border border-brand-primary/20">
              <IconShieldCheck size={13} stroke={2} />
              Security Gateway
            </span>
          </Link>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">
            {step === 'REQUEST' ? 'Step 1 of 2' : 'Step 2 of 2'}
          </span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {step === 'REQUEST' ? 'Forgot your password?' : 'Reset your password'}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 leading-normal">
            {step === 'REQUEST'
              ? 'Enter your institutional email address to generate a security reset token.'
              : 'Enter the verification token and choose your new security password.'}
          </p>
        </div>
      </div>

      {/* 2. Success Notification (when token generated) */}
      {successNotice && step === 'RESET' && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 text-xs text-emerald-800 space-y-1 animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold">
            <IconCheck size={14} stroke={2.5} className="text-emerald-600 shrink-0" />
            <span>Reset Token Generated</span>
          </div>
          <p className="text-[11px] text-emerald-700 leading-tight">
            Token has been automatically attached below for fast testing verification.
          </p>
        </div>
      )}

      {/* 3. Error Alert */}
      {error && (
        <div
          className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 animate-in fade-in"
          role="alert"
        >
          <IconAlertCircle size={15} stroke={2} className="shrink-0 mt-0.5 text-rose-600" />
          <div className="font-medium leading-normal">{error}</div>
        </div>
      )}

      {/* STEP 1: REQUEST TOKEN */}
      {step === 'REQUEST' && (
        <form onSubmit={handleRequestToken} className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="recovery-email" className="text-[11px] font-semibold text-slate-700">
                Registered University Email
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
                id="recovery-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fpt.edu.vn"
                required
                className="block w-full rounded-xl border border-slate-200 bg-[#F1F5F9] py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-xl bg-brand-primary hover:bg-brand-primary-hover active:bg-[#d95d18] text-xs sm:text-sm font-bold text-white shadow-xs focus:outline-none transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  <span>Requesting Token...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Token</span>
                  <IconKey size={16} stroke={2} />
                </>
              )}
            </Button>

            <Link
              to={ROUTES.AUTH.LOGIN}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <IconArrowLeft size={16} stroke={2} className="text-slate-500" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}

      {/* STEP 2: ENTER TOKEN & NEW PASSWORD */}
      {step === 'RESET' && (
        <form onSubmit={handleResetPassword} className="space-y-2.5">
          {/* Target Email */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700">Account Email</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <IconMail size={16} stroke={1.8} />
              </div>
              <input
                type="email"
                value={email}
                disabled
                className="block w-full rounded-xl border border-slate-200 bg-slate-100 py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Security Token Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="reset-token" className="text-[11px] font-semibold text-slate-700">
                Security Reset Token
              </label>
              <span className="text-[10px] font-medium text-slate-400">From email / server</span>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <IconKey size={16} stroke={1.8} />
              </div>
              <input
                id="reset-token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your reset token"
                required
                className="block w-full rounded-xl border border-slate-200 bg-[#F1F5F9] py-2 pl-9 pr-3 text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-all"
              />
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label htmlFor="new-pass" className="text-[11px] font-semibold text-slate-700">
              New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <IconLock size={16} stroke={1.8} />
              </div>
              <input
                id="new-pass"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="block w-full rounded-xl border border-slate-200 bg-[#F1F5F9] py-2 pl-9 pr-9 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <IconEyeOff size={16} stroke={1.8} /> : <IconEye size={16} stroke={1.8} />}
              </button>
            </div>

            {/* Strength meter */}
            {newPassword && (
              <div className="space-y-0.5 pt-0.5">
                <div className="flex h-1 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>Strength: {strength.label}</span>
                  <span>Min 6 chars</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label htmlFor="confirm-pass" className="text-[11px] font-semibold text-slate-700">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <IconLock size={16} stroke={1.8} />
              </div>
              <input
                id="confirm-pass"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="block w-full rounded-xl border border-slate-200 bg-[#F1F5F9] py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('REQUEST')}
              className="w-1/3 h-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1 text-xs sm:text-sm font-semibold"
            >
              <IconArrowLeft size={16} stroke={2} />
              <span>Back</span>
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-2/3 h-10 rounded-xl bg-brand-primary hover:bg-brand-primary-hover active:bg-[#d95d18] text-xs sm:text-sm font-bold text-white shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <IconShieldCheck size={16} stroke={2} />
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* 4. Minimal Footer */}
      <div className="pt-2 text-center">
        <p className="text-[10px] text-slate-400 leading-tight">
          Institutional Security Gateway • FPT University Alumni Community Platform
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordForm

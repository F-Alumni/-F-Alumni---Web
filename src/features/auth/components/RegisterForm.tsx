import { useState, type FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  IconEye as Eye,
  IconEyeOff as EyeOff,
  IconMail as Mail,
  IconLock as Lock,
  IconUser as User,
  IconSchool as GraduationCap,
  IconBriefcase as Briefcase,
  IconChevronLeft as ChevronLeft,
  IconArrowRight as ArrowRight,
  IconCircleCheck as CheckCircle2,
  IconBuildingCommunity as Building2,
  IconBook as BookOpen,
  IconCalendar as Calendar,
  IconSparkles as Sparkles,
  IconShieldCheck as ShieldCheck,
  IconLoader2,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/auth'
import { normalizeError } from '@/lib/errorHandler'
import fptLogo from '@/assets/fpt-logo.svg'

type Step = 1 | 2 | 3 | 4
type AccountType = 'STUDENT' | 'ALUMNI'

export const RegisterForm: FC = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [step, setStep] = useState<Step>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form Fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [campus, setCampus] = useState('FPT Hoa Lac (Hanoi)')
  const [major, setMajor] = useState('Software Engineering (SE)')
  const [gradYear, setGradYear] = useState('2025')
  const [studentId, setStudentId] = useState('')
  const [accountType, setAccountType] = useState<AccountType>('STUDENT')
  const [agreedTerms, setAgreedTerms] = useState(true)

  // Validation / errors
  const [error, setError] = useState<string | null>(null)

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', score: 0, color: 'bg-slate-200' }
    let score = 0
    if (password.length >= 6) score += 1
    if (password.length >= 10) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score <= 2) return { label: 'Weak', score: 33, color: 'bg-rose-500' }
    if (score <= 4) return { label: 'Good', score: 66, color: 'bg-amber-500' }
    return { label: 'Strong', score: 100, color: 'bg-emerald-500' }
  }

  const strength = getPasswordStrength()

  // Step 1 validation
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!fullName.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setStep(2)
  }

  // Step 2 validation
  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!campus) {
      setError('Please select your campus')
      return
    }
    if (!major) {
      setError('Please select your major')
      return
    }
    setStep(3)
  }

  // Step 3 submission to real backend UserService
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!agreedTerms) {
      setError('Please agree to the Community Guidelines & Terms')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await authService.register({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: accountType === 'STUDENT' ? 'Student' : 'Alumni',
        campus,
        department: major,
        cohort: gradYear,
      })

      setAuth({ token: res.token, user: res.user })
      setStep(4)
    } catch (err: unknown) {
      setError(normalizeError(err).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const campuses = [
    'FPT Hoa Lac (Hanoi)',
    'FPT Da Nang',
    'FPT TP. Ho Chi Minh',
    'FPT Can Tho',
    'FPT Quy Nhon',
  ]

  const majors = [
    'Software Engineering (SE)',
    'Artificial Intelligence (AI)',
    'Information Assurance (IA)',
    'Information Systems (IS)',
    'Business Administration (BA)',
    'Digital Marketing (DM)',
    'International Business (IB)',
    'Graphic Design (GD)',
    'Multimedia Communications (MC)',
  ]

  const gradYears = [
    '2029 (Expected)',
    '2028 (Expected)',
    '2027 (Expected)',
    '2026 (Expected)',
    '2025',
    '2024',
    '2023',
    '2022',
    '2021',
    '2020 or earlier',
  ]

  // Success view (Step 4)
  if (step === 4) {
    return (
      <div className="w-full space-y-8 py-4 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-bounce" />
        </div>

        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-accent/10 px-3.5 py-1 text-xs font-semibold text-brand-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Registration Successful!
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome to the Network, {fullName.split(' ')[0] || 'FPTer'}!
          </h1>
          <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            Your {accountType === 'STUDENT' ? 'Student' : 'Alumni'} profile has been initialized for{' '}
            <span className="font-semibold text-slate-800">{major.split(' (')[0]}</span> at{' '}
            <span className="font-semibold text-slate-800">{campus}</span>.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left space-y-2.5 text-xs text-slate-600">
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-400">Account Type</span>
            <span className="font-semibold text-slate-800">
              {accountType === 'STUDENT' ? 'Current Student' : 'Verified Alumni'}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-400">Campus</span>
            <span className="font-semibold text-slate-800">{campus}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Email</span>
            <span className="font-semibold text-slate-800">{email}</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            onClick={() => {
              navigate(ROUTES.APP.HOME)
            }}
            className="w-full py-6 rounded-xl bg-gradient-to-r from-brand-secondary to-[#004e8a] hover:from-[#004e8a] hover:to-brand-secondary text-base font-semibold text-white shadow-md shadow-brand-secondary/20"
          >
            Enter Community Feed &rarr;
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.AUTH.LOGIN)}
            className="w-full py-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Sign In with new credentials
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Brand Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Link to={ROUTES.AUTH.LOGIN} className="inline-flex items-center space-x-2">
            <img src={fptLogo} alt="FPT Logo" className="h-8 w-auto object-contain" />
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Alumni Network
            </span>
          </Link>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Step {step} of 3
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {step === 1 && 'Create your account'}
          {step === 2 && 'Academic profile'}
          {step === 3 && 'Choose your role'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {step === 1 && 'Join 40,000+ FPT students and alumni connecting worldwide.'}
          {step === 2 && 'Tell us your campus and field of study to personalize your network.'}
          {step === 3 && 'Select whether you are a currently enrolled student or graduated alumni.'}
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center justify-center gap-1.5 py-1.5 border-b-2 transition-all ${
              step >= 1
                ? 'border-brand-secondary font-bold text-brand-secondary'
                : 'border-slate-200 text-slate-400'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-secondary text-[10px] text-white">
              1
            </span>
            <span className="hidden sm:inline">Basic Info</span>
          </button>

          <button
            type="button"
            onClick={() => fullName && email && password && setStep(2)}
            disabled={step < 2}
            className={`flex items-center justify-center gap-1.5 py-1.5 border-b-2 transition-all ${
              step >= 2
                ? 'border-brand-secondary font-bold text-brand-secondary'
                : 'border-slate-200 text-slate-400'
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                step >= 2 ? 'bg-brand-secondary text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </span>
            <span className="hidden sm:inline">University</span>
          </button>

          <button
            type="button"
            disabled={step < 3}
            className={`flex items-center justify-center gap-1.5 py-1.5 border-b-2 transition-all ${
              step >= 3
                ? 'border-brand-secondary font-bold text-brand-secondary'
                : 'border-slate-200 text-slate-400'
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                step >= 3 ? 'bg-brand-secondary text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </span>
            <span className="hidden sm:inline">Account Type</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 animate-in fade-in">
          {error}
        </div>
      )}

      {/* STEP 1: Basic Information */}
      {step === 1 && (
        <form onSubmit={handleStep1Next} className="space-y-4">
          {/* Google Quick Registration */}
          <button
            type="button"
            onClick={() => {
              setFullName('Nguyen Van A')
              setEmail('anguyen@fpt.edu.vn')
              setPassword('FPTalumni2026!')
              setConfirmPassword('FPTalumni2026!')
            }}
            className="flex w-full items-center justify-center space-x-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2"
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
            <span>Auto-fill with Google SSO</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-3 font-semibold text-slate-400">
                Or fill details below
              </span>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">FULL NAME</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="e.g. Nguyen Van An"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 focus:border-brand-secondary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-secondary transition-colors"
                required
              />
            </div>
          </div>

          {/* Institutional Email */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">EMAIL ADDRESS</label>
              <span className="text-[11px] font-medium text-brand-secondary">
                @fpt.edu.vn recommended
              </span>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                placeholder="student@fpt.edu.vn or personal email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 focus:border-brand-secondary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-secondary transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">CREATE PASSWORD</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-900 focus:border-brand-secondary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-secondary transition-colors"
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

            {/* Strength meter */}
            {password && (
              <div className="space-y-1 pt-1">
                <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Strength: {strength.label}</span>
                  <span>Use letters, numbers & symbols</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">CONFIRM PASSWORD</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 focus:border-brand-secondary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-secondary transition-colors"
              />
            </div>
          </div>

          {/* Step 1 Actions */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full py-6 rounded-xl bg-brand-secondary hover:bg-[#004e8a] text-base font-semibold text-white shadow-md shadow-brand-secondary/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Continue to Academic Info</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* STEP 2: University Information */}
      {step === 2 && (
        <form onSubmit={handleStep2Next} className="space-y-4">
          {/* Campus */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-brand-secondary" />
              CAMPUS
            </label>
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm text-slate-900 focus:border-brand-secondary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-secondary transition-colors"
            >
              {campuses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Major */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-brand-secondary" />
              MAJOR / FIELD OF STUDY
            </label>
            <select
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm text-slate-900 focus:border-brand-secondary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-secondary transition-colors"
            >
              {majors.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Graduation Year */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-secondary" />
              GRADUATION YEAR (OR EXPECTED)
            </label>
            <select
              value={gradYear}
              onChange={(e) => setGradYear(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm text-slate-900 focus:border-brand-secondary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-secondary transition-colors"
            >
              {gradYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Student ID / Alumni Code */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">STUDENT ID (OPTIONAL)</label>
              <span className="text-[11px] text-slate-400">For fast-track verification</span>
            </div>
            <input
              type="text"
              placeholder="e.g. SE160123"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm text-slate-900 focus:border-brand-secondary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-secondary transition-colors"
            />
          </div>

          {/* Step 2 Actions */}
          <div className="flex items-center gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="w-1/3 py-6 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <Button
              type="submit"
              className="w-2/3 py-6 rounded-xl bg-brand-secondary hover:bg-[#004e8a] text-base font-semibold text-white shadow-md shadow-brand-secondary/20 flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* STEP 3: Account Type & Finalize */}
      {step === 3 && (
        <form onSubmit={handleCompleteRegistration} className="space-y-5">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700">SELECT YOUR ROLE</label>

            <div className="grid grid-cols-1 gap-3">
              {/* Option A: Current Student */}
              <div
                onClick={() => setAccountType('STUDENT')}
                className={`relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all ${
                  accountType === 'STUDENT'
                    ? 'border-brand-secondary bg-brand-secondary/5 ring-2 ring-brand-secondary/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    accountType === 'STUDENT'
                      ? 'bg-brand-secondary text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">Current Student</span>
                    <span
                      className={`inline-block h-4 w-4 rounded-full border-2 ${
                        accountType === 'STUDENT'
                          ? 'border-brand-secondary bg-brand-secondary ring-2 ring-brand-secondary/20'
                          : 'border-slate-300'
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Currently enrolled at FPT University. Access verified alumni mentors, discover
                    OJT & internships, and join student clubs.
                  </p>
                </div>
              </div>

              {/* Option B: FPT Alumni */}
              <div
                onClick={() => setAccountType('ALUMNI')}
                className={`relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all ${
                  accountType === 'ALUMNI'
                    ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    accountType === 'ALUMNI'
                      ? 'bg-brand-primary text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">FPT Alumni</span>
                    <span
                      className={`inline-block h-4 w-4 rounded-full border-2 ${
                        accountType === 'ALUMNI'
                          ? 'border-brand-primary bg-brand-primary ring-2 ring-brand-primary/20'
                          : 'border-slate-300'
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Graduated from FPT University. Mentor junior students, post job openings, and
                    network with fellow alumni across global chapters.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 flex items-start gap-3">
            <input
              id="agree-terms"
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-secondary focus:ring-brand-secondary"
            />
            <label htmlFor="agree-terms" className="text-xs text-slate-600 leading-relaxed">
              I agree to the{' '}
              <a href="#" className="font-semibold text-brand-secondary hover:underline">
                Code of Academic Conduct
              </a>{' '}
              and FPT Alumni Network Terms of Service.
            </label>
          </div>

          {/* Step 3 Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(2)}
              className="w-1/3 py-6 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 py-6 rounded-xl bg-gradient-to-r from-brand-secondary to-[#004e8a] hover:from-[#004e8a] hover:to-brand-secondary text-base font-semibold text-white shadow-md shadow-brand-secondary/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className="h-5 w-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  <span>Complete Registration</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Footer Navigation link back to Login */}
      <div className="text-center pt-3 border-t border-slate-100">
        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <Link to={ROUTES.AUTH.LOGIN} className="font-semibold text-brand-secondary hover:underline">
            Sign In &rarr;
          </Link>
        </p>
      </div>

      <div className="flex items-center justify-center space-x-6 pt-2 text-xs font-medium text-slate-400">
        <Link to="#" className="hover:text-slate-600">
          Privacy Policy
        </Link>
        <Link to="#" className="hover:text-slate-600">
          Campus Rules
        </Link>
        <Link to="#" className="hover:text-slate-600">
          Support FAQ
        </Link>
      </div>
    </div>
  )
}

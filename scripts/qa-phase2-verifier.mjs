/**
 * QA Phase 2 Verification Suite
 * Verifies:
 * 1. VerifyEmailPage implementation & UI States (URL auto-checking, manual OTP, success state)
 * 2. Route wiring for /auth/verify-email
 * 3. alumniService boundary methods & contracts
 * 4. AlumniPage integration with alumniService
 * 5. authService.verifyEmail API parameter contract
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`✔ PASS: ${name}`)
    passed++
  } catch (err) {
    console.error(`✖ FAIL: ${name}`)
    console.error(`  -> ${err.message}`)
    failed++
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

console.log('\n========================================')
console.log('🧪 PHASE 2 QA VERIFICATION SUITE')
console.log('========================================\n')

// 1. Verify VerifyEmailPage exists and has required UI features
test('VerifyEmailPage exists and implements auto-verification & manual OTP', () => {
  const filePath = path.join(rootDir, 'src/pages/auth/VerifyEmailPage.tsx')
  assert(fs.existsSync(filePath), 'VerifyEmailPage.tsx does not exist')
  const content = fs.readFileSync(filePath, 'utf-8')

  assert(content.includes('useSearchParams'), 'Missing useSearchParams hook')
  assert(content.includes('emailParam'), 'Missing email query param reading')
  assert(content.includes('tokenParam'), 'Missing token query param reading')
  assert(content.includes('authService.verifyEmail'), 'Missing call to authService.verifyEmail')
  assert(content.includes('CHECKING'), 'Missing CHECKING auto-verification state')
  assert(content.includes('SUCCESS'), 'Missing SUCCESS state')
  assert(content.includes('FORM'), 'Missing manual OTP FORM state')
  assert(content.includes('handleResendOtp'), 'Missing resend OTP functionality')
})

// 2. Verify auth page index exports VerifyEmailPage
test('src/pages/auth/index.ts exports VerifyEmailPage', () => {
  const filePath = path.join(rootDir, 'src/pages/auth/index.ts')
  const content = fs.readFileSync(filePath, 'utf-8')
  assert(content.includes("export * from './VerifyEmailPage'"), 'Missing VerifyEmailPage export in auth index')
})

// 3. Verify route configuration in routes.tsx
test('routes.tsx mounts VerifyEmailPage to /auth/verify-email without Outlet fallback', () => {
  const filePath = path.join(rootDir, 'src/app/router/routes.tsx')
  const content = fs.readFileSync(filePath, 'utf-8')
  assert(content.includes('VerifyEmailPage'), 'VerifyEmailPage not imported in routes.tsx')
  assert(content.includes("path: 'verify-email'"), "Missing path: 'verify-email' in routes.tsx")
  assert(
    content.includes('element: <VerifyEmailPage />'),
    'path: verify-email is not mapped to <VerifyEmailPage />'
  )
  assert(!content.includes("path: 'verify-email',\n            element: <Outlet />"), 'Old Outlet fallback still present')
})

// 4. Verify alumniService boundary
test('alumniService defines full directory and member operations', () => {
  const filePath = path.join(rootDir, 'src/services/alumni/index.ts')
  const content = fs.readFileSync(filePath, 'utf-8')
  assert(content.includes('getAlumniDirectory'), 'Missing getAlumniDirectory method')
  assert(content.includes('getAlumniProfile'), 'Missing getAlumniProfile method')
  assert(content.includes('blockMember'), 'Missing blockMember method')
  assert(content.includes('unblockMember'), 'Missing unblockMember method')
  assert(content.includes('getBlockedMembers'), 'Missing getBlockedMembers method')
  assert(content.includes("role: params?.role || 'Alumni'"), 'Missing default Alumni role filter')
})

// 5. Verify AlumniPage integration
test('AlumniPage utilizes alumniService for directory querying and blocking', () => {
  const filePath = path.join(rootDir, 'src/pages/user/AlumniPage.tsx')
  const content = fs.readFileSync(filePath, 'utf-8')
  assert(content.includes("import { alumniService } from '@/services/alumni'"), 'AlumniPage does not import alumniService')
  assert(content.includes('alumniService.getAlumniDirectory'), 'AlumniPage does not call alumniService.getAlumniDirectory')
  assert(content.includes('alumniService.blockMember'), 'AlumniPage does not call alumniService.blockMember')
})

// 6. Verify authService.verifyEmail flexibility
test('authService.verifyEmail supports dual call signature (string pair and object)', () => {
  const filePath = path.join(rootDir, 'src/services/auth/index.ts')
  const content = fs.readFileSync(filePath, 'utf-8')
  assert(content.includes("async verifyEmail("), 'Missing verifyEmail function in authService')
  assert(content.includes("emailOrPayload"), 'verifyEmail does not handle flexible emailOrPayload')
  assert(content.includes("otpCode: code"), 'verifyEmail does not format otpCode in request body')
})

console.log('\n========================================')
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`)
console.log('========================================\n')

if (failed > 0) {
  process.exit(1)
}

/**
 * QA Phase 4 Verification Suite
 * Verifies:
 * 1. AI Mentorship Matching Hub in OpportunitiesPage
 * 2. Diagnostic RAG & Intent Booster in SettingsPage
 * 3. SignalR automatic reconnection resilience in chat & notifications
 * 4. Gemini 2.5 Flash branding & FPT Citations in AiChatWindow
 * 5. aiService boundary contract verification
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
console.log('🧪 PHASE 4 QA VERIFICATION SUITE')
console.log('========================================\n')

// 1. Verify AI Mentorship Matching Hub
test('OpportunitiesPage implements AI Mentorship Matching Hub with recommendMentors', () => {
  const filePath = path.join(rootDir, 'src/pages/user/OpportunitiesPage.tsx')
  const content = fs.readFileSync(filePath, 'utf-8')
  assert(content.includes("'mentors'"), "OpportunitiesPage lacks 'mentors' tab option")
  assert(content.includes('aiService.recommendMentors'), 'OpportunitiesPage does not call aiService.recommendMentors')
  assert(content.includes('Semantic Vector Matching'), 'OpportunitiesPage lacks Semantic Vector Matching badge')
  assert(content.includes('selectedSkills'), 'OpportunitiesPage lacks selectedSkills state')
  assert(content.includes('careerGoal'), 'OpportunitiesPage lacks careerGoal state')
  assert(content.includes('handleChatWithMentor'), 'OpportunitiesPage lacks handleChatWithMentor direct chat routing')
  assert(content.includes('PublicProfileModal'), 'OpportunitiesPage lacks PublicProfileModal for mentors')
})

// 2. Verify Diagnostic RAG & Intent Booster
test('SettingsPage implements Diagnostic RAG & Intent Booster with testBoost', () => {
  const filePath = path.join(rootDir, 'src/pages/admin/SettingsPage.tsx')
  const content = fs.readFileSync(filePath, 'utf-8')
  assert(content.includes('aiService.testBoost'), 'SettingsPage does not call aiService.testBoost')
  assert(content.includes('handleTestBoost'), 'SettingsPage lacks handleTestBoost form submission')
  assert(content.includes('boostQuery'), 'SettingsPage lacks boostQuery state')
  assert(content.includes('Gemini 2.5 Flash /boost'), 'SettingsPage lacks Gemini 2.5 Flash /boost diagnostic title')
})

// 3. Verify SignalR Chat Hub Automatic Reconnection
test('chatHubClient implements resilient automatic reconnect policy [0, 2000, 5000, 10000, 30000]', () => {
  const filePath = path.join(rootDir, 'src/services/chat/signalr.ts')
  const content = fs.readFileSync(filePath, 'utf-8')
  assert(
    content.includes('.withAutomaticReconnect([0, 2000, 5000, 10000, 30000])'),
    'chatHubClient does not configure explicit reconnection retry intervals'
  )
})

// 4. Verify SignalR Notification Hub Automatic Reconnection
test('notificationHubClient implements resilient automatic reconnect policy [0, 2000, 5000, 10000, 30000]', () => {
  const filePath = path.join(rootDir, 'src/services/notifications/index.ts')
  const content = fs.readFileSync(filePath, 'utf-8')
  assert(
    content.includes('.withAutomaticReconnect([0, 2000, 5000, 10000, 30000])'),
    'notificationHubClient does not configure explicit reconnection retry intervals'
  )
})

// 5. Verify Gemini 2.5 Flash branding in AiChatWindow
test('AiChatWindow features Gemini 2.5 Flash • RAG Boost badge and Citations', () => {
  const filePath = path.join(rootDir, 'src/features/ai/components/AiChatWindow.tsx')
  const content = fs.readFileSync(filePath, 'utf-8')
  assert(content.includes('Gemini 2.5 Flash • RAG Boost'), 'AiChatWindow lacks Gemini 2.5 Flash badge')
  assert(content.includes('citations'), 'AiChatWindow does not handle citations')
  assert(content.includes('aiService.ask'), 'AiChatWindow does not call aiService.ask')
})

// 6. Verify aiService boundary exports
test('aiService defines testBoost and recommendMentors contracts', () => {
  const filePath = path.join(rootDir, 'src/services/ai/index.ts')
  const content = fs.readFileSync(filePath, 'utf-8')
  assert(content.includes('testBoost('), 'aiService lacks testBoost method')
  assert(content.includes('recommendMentors('), 'aiService lacks recommendMentors method')
  assert(content.includes('/ai/boost'), 'aiService testBoost does not call /ai/boost')
  assert(content.includes('/ai/mentors/recommend'), 'aiService recommendMentors does not call /ai/mentors/recommend')
})

console.log('\n========================================')
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`)
console.log('========================================\n')

if (failed > 0) {
  process.exit(1)
}

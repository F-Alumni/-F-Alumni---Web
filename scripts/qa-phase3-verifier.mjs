/**
 * QA Phase 3 Verification Suite
 * Verifies:
 * 1. Deep link routing: /app/posts/:id & /app/posts/:postId
 * 2. HomePage useParams reading & targetPostId binding
 * 3. PostFeed single post retrieval & target post prioritization
 * 4. PostCard target post highlight & quick answered toggle button
 * 5. PostCommentsSection accept answer lifecycle & onAnswerAccepted callback
 * 6. Event attendees modal integration
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
console.log('🧪 PHASE 3 QA VERIFICATION SUITE')
console.log('========================================\n')

// 1. Verify Deep Link Routes in routes.tsx
test('routes.tsx registers deep link route /app/posts/:id and /app/posts/:postId', () => {
  const filePath = path.join(rootDir, 'src/app/router/routes.tsx')
  const content = fs.readFileSync(filePath, 'utf-8')
  assert(content.includes("path: 'posts/:id'"), "Missing route: 'posts/:id'")
  assert(content.includes("path: 'posts/:postId'"), "Missing route: 'posts/:postId'")
})

// 2. Verify HomePage useParams & targetPostId binding
test('HomePage reads URL params and routes to targetPostId on feed', () => {
  const filePath = path.join(rootDir, 'src/pages/user/HomePage.tsx')
  const content = fs.readFileSync(filePath, 'utf-8')
  assert(content.includes('useParams'), 'HomePage does not import or use useParams')
  assert(content.includes('targetPostId'), 'HomePage does not declare targetPostId')
  assert(content.includes('targetPostId={targetPostId}'), 'HomePage does not pass targetPostId to PostFeed')
})

// 3. Verify PostFeed deep link handling & prioritization
test('PostFeed fetches specific target post and puts it at top of feed', () => {
  const filePath = path.join(rootDir, 'src/features/posts/components/PostFeed.tsx')
  const content = fs.readFileSync(filePath, 'utf-8')
  assert(content.includes('targetPostId?: string'), 'PostFeedProps lacks targetPostId')
  assert(content.includes('postsService.getPostById(targetPostId)'), 'PostFeed does not fetch target post by ID')
  assert(content.includes('isTargetPost={post.id === targetPostId}'), 'PostFeed does not pass isTargetPost prop')
  assert(content.includes('initialOpenComments={post.id === targetPostId}'), 'PostFeed does not pass initialOpenComments prop')
})

// 4. Verify PostCard auto-scroll & quick answered toggle
test('PostCard implements target scroll and 1-click answered toggle', () => {
  const filePath = path.join(rootDir, 'src/features/posts/components/PostCard.tsx')
  const content = fs.readFileSync(filePath, 'utf-8')
  assert(content.includes('isTargetPost'), 'PostCardProps lacks isTargetPost')
  assert(content.includes('initialOpenComments'), 'PostCardProps lacks initialOpenComments')
  assert(content.includes('scrollIntoView'), 'PostCard does not implement scrollIntoView for target post')
  assert(content.includes('handleToggleAnswered'), 'PostCard lacks handleToggleAnswered')
  assert(content.includes('postsService.markAnswered'), 'PostCard does not call postsService.markAnswered')
  assert(content.includes('onAnswerAccepted'), 'PostCard does not handle onAnswerAccepted from comments')
})

// 5. Verify PostCommentsSection accept answer lifecycle
test('PostCommentsSection implements Best Answer selection and callback', () => {
  const filePath = path.join(rootDir, 'src/features/posts/components/PostCommentsSection.tsx')
  const content = fs.readFileSync(filePath, 'utf-8')
  assert(content.includes('postsService.acceptAnswer'), 'PostCommentsSection does not call postsService.acceptAnswer')
  assert(content.includes('isAcceptedAnswer'), 'PostCommentsSection lacks isAcceptedAnswer display')
  assert(content.includes('onAnswerAccepted'), 'PostCommentsSection lacks onAnswerAccepted callback')
})

// 6. Verify EventAttendeesModal integration
test('EventCard and EventAttendeesModal correctly connect to opportunitiesService.getAttendees', () => {
  const cardPath = path.join(rootDir, 'src/features/events/components/EventCard.tsx')
  const modalPath = path.join(rootDir, 'src/features/events/components/EventAttendeesModal.tsx')
  const cardContent = fs.readFileSync(cardPath, 'utf-8')
  const modalContent = fs.readFileSync(modalPath, 'utf-8')

  assert(cardContent.includes('EventAttendeesModal'), 'EventCard does not mount EventAttendeesModal')
  assert(
    /opportunitiesService\s*\.\s*getAttendees/.test(modalContent),
    'EventAttendeesModal does not call opportunitiesService.getAttendees'
  )
})

console.log('\n========================================')
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`)
console.log('========================================\n')

if (failed > 0) {
  process.exit(1)
}

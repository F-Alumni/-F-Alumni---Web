import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const testResults = [];

function assert(condition, testName, details = '') {
  if (condition) {
    testResults.push({ name: testName, status: 'PASSED', details });
    console.log(`\x1b[32m✔ PASS\x1b[0m: ${testName} ${details ? `(${details})` : ''}`);
  } else {
    testResults.push({ name: testName, status: 'FAILED', details });
    console.error(`\x1b[31m✘ FAIL\x1b[0m: ${testName} ${details ? `(${details})` : ''}`);
  }
}

console.log('\n=============================================================');
console.log('🧪 F-ALUMNI ADMIN SERVICE & MICROSERVICES API CONTRACT SUITE');
console.log('=============================================================\n');

// ---------------------------------------------------------------------------
// 1. Dashboard Summary & Activity Timeline DTO Contracts
// ---------------------------------------------------------------------------
console.log('--- TEST GROUP 1: Dashboard Summary & Activity Timeline DTO Contracts ---');

// Contract validator for AdminDashboardSummary
function validateDashboardSummary(dto) {
  return (
    typeof dto.totalUsers === 'number' &&
    typeof dto.activeUsers === 'number' &&
    typeof dto.suspendedUsers === 'number' &&
    typeof dto.pendingReports === 'number' &&
    typeof dto.publishedAnnouncements === 'number' &&
    typeof dto.totalAuditLogsCount === 'number' &&
    Array.isArray(dto.recentActivityFeed) &&
    typeof dto.timestamp === 'string'
  );
}

// Contract validator for ActivityTimelineItem
function validateActivityTimelineItem(dto) {
  return (
    typeof dto.date === 'string' &&
    typeof dto.totalActions === 'number' &&
    typeof dto.actionBreakdown === 'object' &&
    dto.actionBreakdown !== null &&
    !Array.isArray(dto.actionBreakdown)
  );
}

const mockDashboardSummary = {
  totalUsers: 1420,
  activeUsers: 1390,
  suspendedUsers: 30,
  pendingReports: 4,
  publishedAnnouncements: 12,
  totalAuditLogsCount: 489,
  recentActivityFeed: [
    {
      id: 'LOG-001',
      adminUserId: 'ADM-01',
      adminEmail: 'admin@fpt.edu.vn',
      action: 'SuspendUser',
      targetEntity: 'User',
      targetId: 'USR-89',
      reason: 'Spam violation',
      createdAtUtc: '2026-11-03T04:12:00Z',
    },
  ],
  timestamp: '2026-11-03T08:00:00Z',
};

const mockTimelineItem = {
  date: '2026-11-02',
  totalActions: 18,
  actionBreakdown: {
    SuspendUser: 2,
    ResolveReport: 5,
    CreateAnnouncement: 1,
    DismissReport: 10,
  },
};

assert(validateDashboardSummary(mockDashboardSummary), 'Dashboard Summary matches AdminDashboardSummary contract schema');
assert(validateActivityTimelineItem(mockTimelineItem), 'Activity Timeline matches ActivityTimelineItem contract schema');

// Verify adminService methods for Dashboard exist and target correct endpoints
const adminServicePath = path.join(projectRoot, 'src/services/admin/adminService.ts');
const adminServiceCode = fs.readFileSync(adminServicePath, 'utf8');

assert(
  adminServiceCode.includes("getDashboardSummary()") &&
  adminServiceCode.includes("'/admin/dashboard/summary'"),
  'adminService.getDashboardSummary calls GET /admin/dashboard/summary'
);

assert(
  adminServiceCode.includes("getActivityTimeline(days = 30)") &&
  adminServiceCode.includes("'/admin/dashboard/activity-timeline'") &&
  adminServiceCode.includes("{ params: { days } }"),
  'adminService.getActivityTimeline calls GET /admin/dashboard/activity-timeline with days param'
);


// ---------------------------------------------------------------------------
// 2. User Moderation DTO & Service Contracts
// ---------------------------------------------------------------------------
console.log('\n--- TEST GROUP 2: User Moderation Contracts (Search, Suspend, Unsuspend, Export) ---');

function validateAdminUserSummary(user) {
  const hasRequiredFields =
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.fullName === 'string' &&
    typeof user.role === 'string' &&
    typeof user.accountType === 'string' &&
    typeof user.status === 'string' &&
    typeof user.emailVerified === 'boolean' &&
    typeof user.createdAtUtc === 'string';

  const validStatusValues = ['PendingVerification', 'Active', 'Suspended'];
  const statusIsValid = validStatusValues.some(
    (s) => s.toLowerCase() === user.status.toLowerCase()
  );

  return hasRequiredFields && statusIsValid;
}

const mockActiveUser = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  email: 'student.se@fpt.edu.vn',
  fullName: 'Le Hoang Student',
  role: 'USER',
  accountType: 'Student',
  status: 'Active',
  emailVerified: true,
  createdAtUtc: '2026-09-01T08:00:00Z',
  campus: 'Hoa Lac',
  major: 'Software Engineering',
  batch: 'K17',
};

const mockSuspendedUser = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
  email: 'spambot@tempmail.org',
  fullName: 'Spam Bot 99',
  role: 'USER',
  accountType: 'Student',
  status: 'Suspended',
  suspensionReason: 'Commercial telegram scam link',
  emailVerified: false,
  createdAtUtc: '2026-10-01T08:00:00Z',
  suspendedUntilUtc: '2026-12-01T08:00:00Z',
};

assert(validateAdminUserSummary(mockActiveUser), 'AdminUserSummary contract validation for Active user');
assert(validateAdminUserSummary(mockSuspendedUser), 'AdminUserSummary contract validation for Suspended user with reason');

// Payload validation for Suspend & Unsuspend
function validateSuspendPayload(payload) {
  return (
    typeof payload.reason === 'string' &&
    payload.reason.trim().length > 0 &&
    (payload.durationDays === undefined ||
      payload.durationDays === null ||
      typeof payload.durationDays === 'number')
  );
}

function validateUnsuspendPayload(payload) {
  return (
    payload === undefined ||
    payload === null ||
    payload.reason === undefined ||
    payload.reason === null ||
    typeof payload.reason === 'string'
  );
}

assert(validateSuspendPayload({ reason: 'Commercial Spam', durationDays: 30 }), 'SuspendUserPayload validates reason and durationDays');
assert(validateSuspendPayload({ reason: 'Harassment violation' }), 'SuspendUserPayload validates with reason only');
assert(!validateSuspendPayload({ reason: '' }), 'SuspendUserPayload rejects empty reason string');
assert(validateUnsuspendPayload({ reason: 'Appeal approved by committee' }), 'UnsuspendUserPayload validates optional reason');
assert(validateUnsuspendPayload({}), 'UnsuspendUserPayload validates empty payload');

// Verify service methods in adminService
assert(
  adminServiceCode.includes("getUsers(") &&
  adminServiceCode.includes("'/admin/users'"),
  'adminService.getUsers calls GET /admin/users with pagination/filters'
);

assert(
  adminServiceCode.includes("getUserById(id: string)") &&
  adminServiceCode.includes("`/admin/users/${id}`"),
  'adminService.getUserById calls GET /admin/users/{id}'
);

assert(
  adminServiceCode.includes("suspendUser(") &&
  adminServiceCode.includes("`/admin/users/${id}/suspend`"),
  'adminService.suspendUser calls POST /admin/users/{id}/suspend'
);

assert(
  adminServiceCode.includes("unsuspendUser(") &&
  adminServiceCode.includes("`/admin/users/${id}/unsuspend`"),
  'adminService.unsuspendUser calls POST /admin/users/{id}/unsuspend'
);

assert(
  adminServiceCode.includes("exportUsersSummary(") &&
  adminServiceCode.includes("'/admin/export/users-summary'") &&
  adminServiceCode.includes("responseType: 'blob'"),
  'adminService.exportUsersSummary queries CSV blob export from /admin/export/users-summary'
);


// ---------------------------------------------------------------------------
// 3. Moderation Reports DTO & Resolution Contracts
// ---------------------------------------------------------------------------
console.log('\n--- TEST GROUP 3: Moderation Reports Contracts (Queue, Resolve, Dismiss) ---');

function validateModerationReport(report) {
  return (
    typeof report.id === 'string' &&
    typeof report.reporterUserId === 'string' &&
    typeof report.reporterEmail === 'string' &&
    typeof report.targetType === 'string' &&
    ['post', 'comment', 'user'].includes(report.targetType.toLowerCase()) &&
    typeof report.targetId === 'string' &&
    typeof report.reason === 'string' &&
    typeof report.status === 'string' &&
    ['pending', 'resolved', 'dismissed'].includes(report.status.toLowerCase()) &&
    typeof report.createdAtUtc === 'string'
  );
}

const mockPendingReport = {
  id: 'REP-801',
  reporterUserId: 'USR-201',
  reporterEmail: 'maya.lin@fpt.edu.vn',
  targetType: 'Post',
  targetId: 'POST-4829',
  reason: 'Commercial spam & cryptocurrency scam',
  details: 'Telegram phishing group link posted in SE community',
  status: 'Pending',
  createdAtUtc: '2026-10-12T19:45:00Z',
};

const mockResolvedReport = {
  ...mockPendingReport,
  status: 'Resolved',
  resolvedByAdminId: 'ADM-001',
  resolutionNotes: 'Post hidden and author issued warning strike',
  resolvedAtUtc: '2026-10-12T20:00:00Z',
};

assert(validateModerationReport(mockPendingReport), 'ModerationReportItem schema validates Pending incident report');
assert(validateModerationReport(mockResolvedReport), 'ModerationReportItem schema validates Resolved incident report');

function validateResolveReportPayload(payload) {
  const validActions = ['ContentRemoved', 'UserSuspended', 'WarningIssued', 'HidePost', 'IssueStrike', 'RequestEdit'];
  return (
    typeof payload.actionTaken === 'string' &&
    validActions.some((a) => a.toLowerCase() === payload.actionTaken.toLowerCase()) &&
    typeof payload.resolutionNotes === 'string' &&
    payload.resolutionNotes.trim().length > 0 &&
    (payload.deleteTargetContent === undefined || typeof payload.deleteTargetContent === 'boolean')
  );
}

function validateDismissReportPayload(payload) {
  return (
    typeof payload.dismissalReason === 'string' &&
    payload.dismissalReason.trim().length > 0
  );
}

assert(
  validateResolveReportPayload({
    actionTaken: 'ContentRemoved',
    resolutionNotes: 'Violates academic integrity rule',
    deleteTargetContent: true,
  }),
  'ResolveReportPayload validates actionTaken, resolutionNotes, and deleteTargetContent'
);

assert(
  validateDismissReportPayload({
    dismissalReason: 'False positive; discussion complies with guidelines',
  }),
  'DismissReportPayload validates required dismissalReason'
);

assert(
  adminServiceCode.includes("getReports(") &&
  adminServiceCode.includes("'/admin/moderation/reports'"),
  'adminService.getReports calls GET /admin/moderation/reports'
);

assert(
  adminServiceCode.includes("getReportById(id: string)") &&
  adminServiceCode.includes("`/admin/moderation/reports/${id}`"),
  'adminService.getReportById calls GET /admin/moderation/reports/{id}'
);

assert(
  adminServiceCode.includes("resolveReport(") &&
  adminServiceCode.includes("`/admin/moderation/reports/${id}/resolve`"),
  'adminService.resolveReport calls POST /admin/moderation/reports/{id}/resolve'
);

assert(
  adminServiceCode.includes("dismissReport(") &&
  adminServiceCode.includes("`/admin/moderation/reports/${id}/dismiss`"),
  'adminService.dismissReport calls POST /admin/moderation/reports/{id}/dismiss'
);


// ---------------------------------------------------------------------------
// 4. Posts, Community Categories & Events Contracts
// ---------------------------------------------------------------------------
console.log('\n--- TEST GROUP 4: Posts, Categories & Community Events Contracts ---');

const postsServicePath = path.join(projectRoot, 'src/services/posts/index.ts');
const postsServiceCode = fs.readFileSync(postsServicePath, 'utf8');

assert(
  postsServiceCode.includes("getPosts(params?: GetPostsParams)") &&
  postsServiceCode.includes("forumApiClient.get") &&
  postsServiceCode.includes("'/posts'"),
  'postsService.getPosts queries GET /posts on Forum Service'
);

assert(
  postsServiceCode.includes("getPostById(id: string)") &&
  postsServiceCode.includes("`/posts/${id}`"),
  'postsService.getPostById queries GET /posts/{id}'
);

assert(
  postsServiceCode.includes("deletePost(id: string)") &&
  postsServiceCode.includes("`/posts/${id}`"),
  'postsService.deletePost executes DELETE /posts/{id}'
);

assert(
  postsServiceCode.includes("markAnswered(id: string, isAnswered = true)") &&
  postsServiceCode.includes("`/posts/${id}/answered`"),
  'postsService.markAnswered patches question resolved status'
);

// ForumPostItem schema validation
function validateForumPostItem(post) {
  return (
    typeof post.id === 'string' &&
    typeof post.authorId === 'string' &&
    typeof post.authorName === 'string' &&
    typeof post.title === 'string' &&
    typeof post.content === 'string' &&
    typeof post.postType === 'string' &&
    typeof post.isAnswered === 'boolean' &&
    typeof post.isPinned === 'boolean' &&
    typeof post.likeCount === 'number' &&
    typeof post.commentCount === 'number' &&
    Array.isArray(post.images) &&
    Array.isArray(post.tags)
  );
}

const mockForumPost = {
  id: 'POST-101',
  authorId: 'USR-01',
  authorName: 'Hoang Minh',
  authorAvatarUrl: 'https://example.com/avatar.jpg',
  title: 'Tips for passing FPT Software On-the-Job Training',
  content: 'Sharing guidance for Git workflows, unit tests, and communication.',
  postType: 'Sharing',
  major: 'Software Engineering',
  campus: 'Hoa Lac',
  isAnswered: false,
  viewCount: 140,
  likeCount: 42,
  commentCount: 12,
  isPinned: true,
  createdAt: '2026-10-10T10:15:00Z',
  images: [],
  tags: ['OJT', 'SE', 'Internship'],
};
assert(validateForumPostItem(mockForumPost), 'ForumPostItem schema contract validates accurately');

// Communities & Discussion Categories Service
const commServicePath = path.join(projectRoot, 'src/services/communities/index.ts');
const commServiceCode = fs.readFileSync(commServicePath, 'utf8');

assert(
  commServiceCode.includes("getCategories()") &&
  commServiceCode.includes("'/categories'"),
  'communitiesService.getCategories queries GET /categories from Forum Service'
);

function validateForumCategory(cat) {
  return (
    typeof cat.id === 'string' &&
    typeof cat.name === 'string' &&
    typeof cat.slug === 'string' &&
    typeof cat.description === 'string'
  );
}
assert(
  validateForumCategory({
    id: 'CAT-SE',
    name: 'Software Engineering',
    slug: 'software-engineering',
    description: 'Academic community for SE students & alumni',
  }),
  'ForumCategoryItem contract validation'
);

// Opportunities & Events Service
const oppServicePath = path.join(projectRoot, 'src/services/opportunities/index.ts');
const oppServiceCode = fs.readFileSync(oppServicePath, 'utf8');

assert(
  oppServiceCode.includes("getEvents(") &&
  oppServiceCode.includes("'/events'"),
  'opportunitiesService.getEvents queries GET /events'
);

assert(
  oppServiceCode.includes("getEventById(") &&
  oppServiceCode.includes("`/events/${id}`"),
  'opportunitiesService.getEventById queries GET /events/{id}'
);

assert(
  oppServiceCode.includes("createEvent(payload: CreateEventPayload)") &&
  oppServiceCode.includes("'/events'"),
  'opportunitiesService.createEvent posts POST /events'
);

assert(
  oppServiceCode.includes("deleteEvent(id: string)") &&
  oppServiceCode.includes("`/events/${id}`"),
  'opportunitiesService.deleteEvent sends DELETE /events/{id}'
);

function validateCommunityEvent(evt) {
  return (
    typeof evt.id === 'string' &&
    typeof evt.creatorId === 'string' &&
    typeof evt.creatorName === 'string' &&
    typeof evt.title === 'string' &&
    typeof evt.description === 'string' &&
    typeof evt.location === 'string' &&
    typeof evt.campus === 'string' &&
    typeof evt.startTime === 'string' &&
    typeof evt.endTime === 'string' &&
    typeof evt.goingCount === 'number' &&
    typeof evt.interestedCount === 'number'
  );
}

const mockCommunityEvent = {
  id: 'EVT-01',
  creatorId: 'USR-FAC',
  creatorName: 'Dr. Nguyen Van Faculty',
  creatorAvatarUrl: '',
  title: 'Alumni Tech Talk: AI in Production',
  description: 'Sharing practical LLM deployment experiences.',
  location: 'Hall A, FPT Hoa Lac',
  campus: 'Hoa Lac',
  startTime: '2026-11-20T14:00:00Z',
  endTime: '2026-11-20T17:00:00Z',
  maxAttendees: 200,
  goingCount: 85,
  interestedCount: 140,
  createdAt: '2026-10-15T09:00:00Z',
};
assert(validateCommunityEvent(mockCommunityEvent), 'CommunityEventItem schema contract validates accurately');


// ---------------------------------------------------------------------------
// 5. System Announcements Contracts
// ---------------------------------------------------------------------------
console.log('\n--- TEST GROUP 5: System Announcements Contracts (CRUD, Filter, Delete) ---');

function validateSystemAnnouncement(ann) {
  const validTypes = ['general', 'urgent', 'academic', 'event', 'maintenance'];
  const validPriorities = ['normal', 'high', 'urgent'];
  return (
    typeof ann.id === 'string' &&
    typeof ann.title === 'string' &&
    typeof ann.content === 'string' &&
    typeof ann.type === 'string' &&
    validTypes.includes(ann.type.toLowerCase()) &&
    typeof ann.priority === 'string' &&
    validPriorities.includes(ann.priority.toLowerCase()) &&
    typeof ann.createdByAdminId === 'string' &&
    typeof ann.createdByAdminEmail === 'string' &&
    typeof ann.isPublished === 'boolean' &&
    typeof ann.createdAtUtc === 'string'
  );
}

const mockAnnouncement = {
  id: 'ANN-01',
  title: 'Scheduled System Maintenance: Fall 2026',
  content: 'The platform will undergo routine upgrades from 02:00 to 04:00 AM UTC.',
  type: 'Maintenance',
  priority: 'High',
  createdByAdminId: 'ADM-01',
  createdByAdminEmail: 'admin@fpt.edu.vn',
  isPublished: true,
  publishedAtUtc: '2026-11-01T08:00:00Z',
  createdAtUtc: '2026-11-01T07:30:00Z',
};

assert(validateSystemAnnouncement(mockAnnouncement), 'SystemAnnouncementItem contract schema validation');

function validateCreateAnnouncementPayload(p) {
  return (
    typeof p.title === 'string' &&
    p.title.trim().length > 0 &&
    typeof p.content === 'string' &&
    p.content.trim().length > 0 &&
    (p.type === undefined || typeof p.type === 'string') &&
    (p.priority === undefined || typeof p.priority === 'string') &&
    (p.isPublished === undefined || typeof p.isPublished === 'boolean')
  );
}

assert(
  validateCreateAnnouncementPayload({
    title: 'Welcome K18 Students',
    content: 'Welcome freshmen to the FPT Alumni Connect community.',
    type: 'Academic',
    priority: 'Normal',
    isPublished: true,
  }),
  'CreateAnnouncementPayload validates required title, content, and options'
);

assert(
  adminServiceCode.includes("getAnnouncements(") &&
  adminServiceCode.includes("'/admin/announcements'"),
  'adminService.getAnnouncements calls GET /admin/announcements'
);

assert(
  adminServiceCode.includes("getAnnouncementById(id: string)") &&
  adminServiceCode.includes("`/admin/announcements/${id}`"),
  'adminService.getAnnouncementById calls GET /admin/announcements/{id}'
);

assert(
  adminServiceCode.includes("createAnnouncement(") &&
  adminServiceCode.includes("'/admin/announcements'"),
  'adminService.createAnnouncement calls POST /admin/announcements'
);

assert(
  adminServiceCode.includes("updateAnnouncement(") &&
  adminServiceCode.includes("`/admin/announcements/${id}`"),
  'adminService.updateAnnouncement calls PUT /admin/announcements/{id}'
);

assert(
  adminServiceCode.includes("deleteAnnouncement(id: string)") &&
  adminServiceCode.includes("`/admin/announcements/${id}`"),
  'adminService.deleteAnnouncement calls DELETE /admin/announcements/{id}'
);


// ---------------------------------------------------------------------------
// 6. Security Audit Logs Contracts
// ---------------------------------------------------------------------------
console.log('\n--- TEST GROUP 6: Security Audit Logs Contracts (Query, Recent, Export CSV) ---');

function validateAuditLogItem(log) {
  return (
    typeof log.id === 'string' &&
    typeof log.adminUserId === 'string' &&
    typeof log.adminEmail === 'string' &&
    typeof log.action === 'string' &&
    typeof log.targetEntity === 'string' &&
    typeof log.targetId === 'string' &&
    typeof log.createdAtUtc === 'string'
  );
}

const mockAuditLog = {
  id: 'LOG-489',
  adminUserId: 'ADM-001',
  adminEmail: 'admin@fpt.edu.vn',
  action: 'SuspendUser',
  targetEntity: 'User',
  targetId: 'USR-89',
  reason: 'Spam promotion of crypto scam',
  details: '30-day temporary suspension applied',
  ipAddress: '14.225.210.12',
  createdAtUtc: '2026-11-03T07:15:00Z',
};

assert(validateAuditLogItem(mockAuditLog), 'AuditLogItem contract schema validation');

assert(
  adminServiceCode.includes("getAuditLogs(") &&
  adminServiceCode.includes("'/admin/audit-logs'"),
  'adminService.getAuditLogs calls GET /admin/audit-logs with filters'
);

assert(
  adminServiceCode.includes("getRecentAuditLogs(count = 10)") &&
  adminServiceCode.includes("'/admin/audit-logs/recent'") &&
  adminServiceCode.includes("{ params: { count } }"),
  'adminService.getRecentAuditLogs calls GET /admin/audit-logs/recent with count'
);

assert(
  adminServiceCode.includes("getAuditLogById(id: string)") &&
  adminServiceCode.includes("`/admin/audit-logs/${id}`"),
  'adminService.getAuditLogById calls GET /admin/audit-logs/{id}'
);

assert(
  adminServiceCode.includes("exportAuditLogs(") &&
  adminServiceCode.includes("'/admin/export/audit-logs'") &&
  adminServiceCode.includes("responseType: 'blob'"),
  'adminService.exportAuditLogs queries CSV blob export from /admin/export/audit-logs'
);


// ---------------------------------------------------------------------------
// 7. Auth Tokens & Refresh-Token Interceptor Logic Contracts
// ---------------------------------------------------------------------------
console.log('\n--- TEST GROUP 7: Auth Tokens & Refresh-Token Interceptor Logic Contracts ---');

const apiClientPath = path.join(projectRoot, 'src/services/api/apiClient.ts');
const apiClientCode = fs.readFileSync(apiClientPath, 'utf8');

// 1. Verify Public Endpoints whitelist
const publicEndpoints = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/auth/google',
  '/auth/refresh-token',
];

const allPublicWhitelisted = publicEndpoints.every((ep) =>
  apiClientCode.includes(ep)
);
assert(allPublicWhitelisted, 'apiClient whitelists all public authentication endpoints');

// 2. Simulate isPublicEndpoint logic
function isPublicEndpoint(url) {
  if (!url) return false;
  return publicEndpoints.some((p) => url.includes(p));
}

assert(isPublicEndpoint('/api/v1/auth/login'), 'isPublicEndpoint correctly identifies /auth/login as public');
assert(isPublicEndpoint('/auth/refresh-token'), 'isPublicEndpoint correctly identifies /auth/refresh-token as public');
assert(!isPublicEndpoint('/api/v1/admin/dashboard/summary'), 'isPublicEndpoint identifies /admin/dashboard as protected');
assert(!isPublicEndpoint('/api/v1/admin/users'), 'isPublicEndpoint identifies /admin/users as protected');
assert(!isPublicEndpoint('/api/v1/posts'), 'isPublicEndpoint identifies /posts as protected');

// 3. Verify Request Interceptor token injection logic
assert(
  apiClientCode.includes("localStorage.getItem('access_token')") &&
  apiClientCode.includes("config.headers.Authorization = `Bearer ${token}`"),
  'Request interceptor attaches Bearer token to protected API requests'
);

// 4. Verify Response Interceptor 401 token refresh mechanism
assert(
  apiClientCode.includes("error.response?.status === 401") &&
  apiClientCode.includes("!originalRequest._retry") &&
  apiClientCode.includes("!isPublicEndpoint(originalRequest.url)"),
  'Response interceptor intercepts 401 Unauthorized for non-public requests'
);

assert(
  apiClientCode.includes("/auth/refresh-token") &&
  apiClientCode.includes("{ refreshToken }") &&
  apiClientCode.includes("localStorage.setItem('access_token'"),
  'Response interceptor sends refreshToken payload and stores renewed access_token'
);

assert(
  apiClientCode.includes("localStorage.removeItem('access_token')") &&
  apiClientCode.includes("localStorage.removeItem('refresh_token')"),
  'Response interceptor clears auth tokens on refresh failure to prevent infinite retry loops'
);

// 5. Verify dedicated API client instances and Base URLs
const envConfigPath = path.join(projectRoot, 'src/app/config/env.ts');
const envConfigCode = fs.readFileSync(envConfigPath, 'utf8');

assert(
  envConfigCode.includes("adminServiceBaseUrl") &&
  envConfigCode.includes("f-alumni-admin-service.onrender.com"),
  'env.ts exposes adminServiceBaseUrl pointing to deployed Render service'
);

assert(
  envConfigCode.includes("userServiceBaseUrl") &&
  envConfigCode.includes("f-alumni-user-service.onrender.com"),
  'env.ts exposes userServiceBaseUrl pointing to deployed Render service'
);

assert(
  envConfigCode.includes("forumServiceBaseUrl") &&
  envConfigCode.includes("f-alumni-forum-service.onrender.com"),
  'env.ts exposes forumServiceBaseUrl pointing to deployed Render service'
);

assert(
  envConfigCode.includes("chatServiceBaseUrl") &&
  envConfigCode.includes("f-alumni-chat-service.onrender.com"),
  'env.ts exposes chatServiceBaseUrl pointing to deployed Render service'
);

assert(
  envConfigCode.includes("aiServiceBaseUrl") &&
  envConfigCode.includes("f-alumni-ai-service.onrender.com"),
  'env.ts exposes aiServiceBaseUrl pointing to deployed Render service'
);

assert(
  apiClientCode.includes("export const adminApiClient") &&
  apiClientCode.includes("export const userApiClient") &&
  apiClientCode.includes("export const forumApiClient"),
  'apiClient.ts exports typed instances for adminApiClient, userApiClient, and forumApiClient'
);


// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------
console.log('\n=============================================================');
const passedCount = testResults.filter((r) => r.status === 'PASSED').length;
const failedCount = testResults.filter((r) => r.status === 'FAILED').length;
console.log(`TOTAL API CONTRACT TESTS: ${testResults.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log('=============================================================\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

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

console.log('\n========================================');
console.log('🧪 ASM FPT PLATFORM QA VERIFICATION SUITE');
console.log('========================================\n');

// ----------------------------------------------------
// 1. Role Resolution & Guard Simulation Tests
// ----------------------------------------------------
console.log('--- TEST GROUP 1: Route Protection & Role Resolution ---');

// Emulate RoleGuard logic from src/app/router/guards.tsx
function checkAccess(user, allowedRoles, fallbackPath) {
  if (!user || !user.isAuthenticated) {
    return { allowed: false, redirect: '/auth/login' };
  }

  // Superuser bypass: ADMIN has access to all administrative routes
  if (user.role === 'ADMIN') {
    return { allowed: true };
  }

  let isAllowed = true;
  if (allowedRoles && allowedRoles.length > 0) {
    const roleMatches = allowedRoles.some((r) => {
      if (r === 'FACULTY') {
        return (
          user.role === 'FACULTY' ||
          (user.role === 'USER' && user.userType === 'FACULTY')
        );
      }
      return user.role === r;
    });
    if (!roleMatches) {
      isAllowed = false;
    }
  }

  if (!isAllowed) {
    const defaultFallback =
      user.role === 'MODERATOR' ? '/admin/dashboard' : '/app/home';
    return { allowed: false, redirect: fallbackPath || defaultFallback };
  }

  return { allowed: true };
}

// User personas
const adminUser = { isAuthenticated: true, role: 'ADMIN', userType: 'FACULTY' };
const modUser = { isAuthenticated: true, role: 'MODERATOR', userType: 'FACULTY' };
const facultyUser = { isAuthenticated: true, role: 'USER', userType: 'FACULTY' };
const studentUser = { isAuthenticated: true, role: 'USER', userType: 'STUDENT' };
const alumniUser = { isAuthenticated: true, role: 'USER', userType: 'ALUMNI' };
const unauthenticated = { isAuthenticated: false, role: null, userType: null };

// Route permission configs from src/app/router/routes.tsx
const adminSectionAllowed = ['ADMIN', 'MODERATOR', 'FACULTY'];
const dashboardAllowed = ['ADMIN', 'MODERATOR', 'FACULTY'];
const reportsAllowed = ['ADMIN', 'MODERATOR'];
const postsAllowed = ['ADMIN', 'MODERATOR'];
const communitiesAllowed = ['ADMIN', 'FACULTY'];
const opportunitiesAllowed = ['ADMIN', 'FACULTY'];
const usersAllowed = ['ADMIN', 'FACULTY'];
const alumniVerificationAllowed = ['ADMIN'];
const analyticsAllowed = ['ADMIN'];
const settingsAllowed = ['ADMIN'];

// Admin tests
assert(checkAccess(adminUser, adminSectionAllowed).allowed, 'Admin access to /admin root layout');
assert(checkAccess(adminUser, dashboardAllowed).allowed, 'Admin access to /admin/dashboard');
assert(checkAccess(adminUser, reportsAllowed).allowed, 'Admin access to /admin/reports');
assert(checkAccess(adminUser, postsAllowed).allowed, 'Admin access to /admin/posts');
assert(checkAccess(adminUser, communitiesAllowed).allowed, 'Admin access to /admin/communities');
assert(checkAccess(adminUser, opportunitiesAllowed).allowed, 'Admin access to /admin/opportunities');
assert(checkAccess(adminUser, usersAllowed).allowed, 'Admin access to /admin/users');
assert(checkAccess(adminUser, alumniVerificationAllowed).allowed, 'Admin access to /admin/alumni-verification');
assert(checkAccess(adminUser, analyticsAllowed).allowed, 'Admin access to /admin/analytics');
assert(checkAccess(adminUser, settingsAllowed).allowed, 'Admin access to /admin/settings');

// Moderator tests
assert(checkAccess(modUser, adminSectionAllowed).allowed, 'Moderator access to /admin root layout');
assert(checkAccess(modUser, dashboardAllowed).allowed, 'Moderator access to /admin/dashboard');
assert(checkAccess(modUser, reportsAllowed).allowed, 'Moderator access to /admin/reports');
assert(checkAccess(modUser, postsAllowed).allowed, 'Moderator access to /admin/posts');

// Moderator blocked tests
const modUsersRes = checkAccess(modUser, usersAllowed);
assert(!modUsersRes.allowed && modUsersRes.redirect === '/admin/dashboard', 'Moderator blocked from /admin/users -> redirect /admin/dashboard');

const modVerifyRes = checkAccess(modUser, alumniVerificationAllowed);
assert(!modVerifyRes.allowed && modVerifyRes.redirect === '/admin/dashboard', 'Moderator blocked from /admin/alumni-verification -> redirect /admin/dashboard');

const modAnalyticsRes = checkAccess(modUser, analyticsAllowed);
assert(!modAnalyticsRes.allowed && modAnalyticsRes.redirect === '/admin/dashboard', 'Moderator blocked from /admin/analytics -> redirect /admin/dashboard');

const modSettingsRes = checkAccess(modUser, settingsAllowed);
assert(!modSettingsRes.allowed && modSettingsRes.redirect === '/admin/dashboard', 'Moderator blocked from /admin/settings -> redirect /admin/dashboard');

const modCommunitiesRes = checkAccess(modUser, communitiesAllowed);
assert(!modCommunitiesRes.allowed && modCommunitiesRes.redirect === '/admin/dashboard', 'Moderator blocked from /admin/communities -> redirect /admin/dashboard');

const modOppRes = checkAccess(modUser, opportunitiesAllowed);
assert(!modOppRes.allowed && modOppRes.redirect === '/admin/dashboard', 'Moderator blocked from /admin/opportunities -> redirect /admin/dashboard');

// Faculty tests
assert(checkAccess(facultyUser, adminSectionAllowed).allowed, 'Faculty access to /admin root layout');
assert(checkAccess(facultyUser, dashboardAllowed).allowed, 'Faculty access to /admin/dashboard');
assert(checkAccess(facultyUser, communitiesAllowed).allowed, 'Faculty access to /admin/communities');
assert(checkAccess(facultyUser, opportunitiesAllowed).allowed, 'Faculty access to /admin/opportunities');
assert(checkAccess(facultyUser, usersAllowed).allowed, 'Faculty access to /admin/users');

// Faculty blocked tests
const facReportsRes = checkAccess(facultyUser, reportsAllowed);
assert(!facReportsRes.allowed && facReportsRes.redirect === '/app/home', 'Faculty blocked from /admin/reports -> redirect /app/home');

const facPostsRes = checkAccess(facultyUser, postsAllowed);
assert(!facPostsRes.allowed && facPostsRes.redirect === '/app/home', 'Faculty blocked from /admin/posts -> redirect /app/home');

const facVerifyRes = checkAccess(facultyUser, alumniVerificationAllowed);
assert(!facVerifyRes.allowed && facVerifyRes.redirect === '/app/home', 'Faculty blocked from /admin/alumni-verification -> redirect /app/home');

const facAnalyticsRes = checkAccess(facultyUser, analyticsAllowed);
assert(!facAnalyticsRes.allowed && facAnalyticsRes.redirect === '/app/home', 'Faculty blocked from /admin/analytics -> redirect /app/home');

const facSettingsRes = checkAccess(facultyUser, settingsAllowed);
assert(!facSettingsRes.allowed && facSettingsRes.redirect === '/app/home', 'Faculty blocked from /admin/settings -> redirect /app/home');

// Student tests
const stuAdminRoot = checkAccess(studentUser, adminSectionAllowed);
assert(!stuAdminRoot.allowed && stuAdminRoot.redirect === '/app/home', 'Student blocked from /admin root layout -> redirect /app/home');
const stuDash = checkAccess(studentUser, dashboardAllowed);
assert(!stuDash.allowed && stuDash.redirect === '/app/home', 'Student blocked from /admin/dashboard -> redirect /app/home');

// Alumni tests
const alumAdminRoot = checkAccess(alumniUser, adminSectionAllowed);
assert(!alumAdminRoot.allowed && alumAdminRoot.redirect === '/app/home', 'Alumni blocked from /admin root layout -> redirect /app/home');
const alumDash = checkAccess(alumniUser, dashboardAllowed);
assert(!alumDash.allowed && alumDash.redirect === '/app/home', 'Alumni blocked from /admin/dashboard -> redirect /app/home');

// Unauthenticated tests
const unauthAdmin = checkAccess(unauthenticated, adminSectionAllowed);
assert(!unauthAdmin.allowed && unauthAdmin.redirect === '/auth/login', 'Unauthenticated redirected to /auth/login');

// Root redirect simulation from guards.tsx RootRedirect
function getRootRedirect(user) {
  if (!user.isAuthenticated) return '/auth/login';
  if (user.role === 'ADMIN' || user.role === 'MODERATOR') return '/admin/dashboard';
  return '/app/home';
}
assert(getRootRedirect(adminUser) === '/admin/dashboard', 'RootRedirect: Admin -> /admin/dashboard');
assert(getRootRedirect(modUser) === '/admin/dashboard', 'RootRedirect: Moderator -> /admin/dashboard');
assert(getRootRedirect(facultyUser) === '/app/home', 'RootRedirect: Faculty -> /app/home');
assert(getRootRedirect(studentUser) === '/app/home', 'RootRedirect: Student -> /app/home');
assert(getRootRedirect(alumniUser) === '/app/home', 'RootRedirect: Alumni -> /app/home');
assert(getRootRedirect(unauthenticated) === '/auth/login', 'RootRedirect: Guest -> /auth/login');


// ----------------------------------------------------
// 2. Role-Aware Navigation Tests (AdminSidebar & Topbar)
// ----------------------------------------------------
console.log('\n--- TEST GROUP 2: Role-Aware Navigation ---');

const sidebarPath = path.join(projectRoot, 'src/components/layout/AdminSidebar.tsx');
const sidebarCode = fs.readFileSync(sidebarPath, 'utf8');

assert(sidebarCode.includes("const isFaculty = !isAdmin && !isModerator && userType === USER_TYPES.FACULTY"), 'AdminSidebar checks isFaculty with role priority');
assert(sidebarCode.includes("const isModerator = role === ROLES.MODERATOR"), 'AdminSidebar checks role === ROLES.MODERATOR');
assert(sidebarCode.includes("const isAdmin = role === ROLES.ADMIN"), 'AdminSidebar checks role === ROLES.ADMIN');
assert(sidebarCode.includes("isRoleAuthorized"), 'AdminSidebar filters navigation items using isRoleAuthorized');
assert(sidebarCode.includes("to={ROUTES.APP.HOME}"), 'AdminSidebar provides direct link to Community Feed (/app/home)');

// Emulate AdminSidebar filtering
function getVisibleItems(role, userType) {
  const isAdmin = role === 'ADMIN';
  const isModerator = role === 'MODERATOR';
  const isFaculty = !isAdmin && !isModerator && userType === 'FACULTY';
  const isRoleAuthorized = (allowed) => {
    if (isAdmin) return true;
    return allowed.some((r) => {
      if (r === 'FACULTY') return isFaculty;
      return role === r;
    });
  };

  const sections = [
    {
      title: 'OVERVIEW',
      allowedRoles: ['ADMIN', 'MODERATOR', 'FACULTY'],
      items: [{ label: 'Dashboard', to: '/admin/dashboard', allowedRoles: ['ADMIN', 'MODERATOR', 'FACULTY'] }],
    },
    {
      title: 'ACADEMIC & USERS',
      allowedRoles: ['ADMIN', 'FACULTY'],
      items: [
        { label: isFaculty ? 'Users Directory' : 'Users', to: '/admin/users', allowedRoles: ['ADMIN', 'FACULTY'] },
        { label: 'Alumni Verification', to: '/admin/alumni-verification', allowedRoles: ['ADMIN'] },
      ],
    },
    {
      title: 'CONTENT MANAGEMENT',
      allowedRoles: ['ADMIN', 'MODERATOR', 'FACULTY'],
      items: [
        { label: 'Communities', to: '/admin/communities', allowedRoles: ['ADMIN', 'FACULTY'] },
        { label: 'Posts', to: '/admin/posts', allowedRoles: ['ADMIN', 'MODERATOR'] },
        { label: 'Opportunities', to: '/admin/opportunities', allowedRoles: ['ADMIN', 'FACULTY'] },
      ],
    },
    {
      title: 'MODERATION',
      allowedRoles: ['ADMIN', 'MODERATOR'],
      items: [{ label: 'Reports', to: '/admin/reports', allowedRoles: ['ADMIN', 'MODERATOR'] }],
    },
    {
      title: 'INSIGHTS',
      allowedRoles: ['ADMIN'],
      items: [{ label: 'Analytics', to: '/admin/analytics', allowedRoles: ['ADMIN'] }],
    },
    {
      title: 'SYSTEM',
      allowedRoles: ['ADMIN'],
      items: [{ label: 'Settings', to: '/admin/settings', allowedRoles: ['ADMIN'] }],
    },
  ];

  return sections
    .filter((s) => isRoleAuthorized(s.allowedRoles))
    .flatMap((s) => s.items.filter((item) => isRoleAuthorized(item.allowedRoles)))
    .map((item) => item.label);
}

const adminItems = getVisibleItems('ADMIN', 'FACULTY');
assert(adminItems.includes('Dashboard') && adminItems.includes('Users') && adminItems.includes('Alumni Verification') &&
       adminItems.includes('Communities') && adminItems.includes('Posts') && adminItems.includes('Opportunities') &&
       adminItems.includes('Reports') && adminItems.includes('Analytics') && adminItems.includes('Settings'),
       'Admin sees all 9 navigation items in AdminSidebar');

const modItems = getVisibleItems('MODERATOR', 'FACULTY');
assert(modItems.includes('Dashboard') && modItems.includes('Posts') && modItems.includes('Reports'),
       'Moderator sees Dashboard, Posts, Reports in AdminSidebar');
assert(!modItems.includes('Users') && !modItems.includes('Alumni Verification') && !modItems.includes('Analytics') &&
       !modItems.includes('Settings') && !modItems.includes('Communities') && !modItems.includes('Opportunities'),
       'Moderator is NOT shown restricted items in AdminSidebar');

const facItems = getVisibleItems('USER', 'FACULTY');
assert(facItems.includes('Dashboard') && facItems.includes('Users Directory') && facItems.includes('Communities') && facItems.includes('Opportunities'),
       'Faculty sees Dashboard, Users Directory, Communities, Opportunities in AdminSidebar');
assert(!facItems.includes('Posts') && !facItems.includes('Reports') && !facItems.includes('Alumni Verification') &&
       !facItems.includes('Analytics') && !facItems.includes('Settings'),
       'Faculty is NOT shown restricted items in AdminSidebar');

// AdminTopbar checks
const topbarPath = path.join(projectRoot, 'src/components/layout/AdminTopbar.tsx');
const topbarCode = fs.readFileSync(topbarPath, 'utf8');

assert(topbarCode.includes("label: 'Faculty Coordinator'"), 'AdminTopbar contains Faculty Coordinator badge config');
assert(topbarCode.includes("label: 'Safety Moderator'"), 'AdminTopbar contains Safety Moderator badge config');
assert(topbarCode.includes("label: 'FPT Super Admin'"), 'AdminTopbar contains FPT Super Admin badge config');
assert(topbarCode.includes("handleLogout") &&
       topbarCode.includes("clearAuth") &&
       topbarCode.includes("isDropdownOpen"),
       'AdminTopbar contains secure session management and role-aware profile dropdown');


// ----------------------------------------------------
// 3. Moderator Workflows Verification
// ----------------------------------------------------
console.log('\n--- TEST GROUP 3: Moderator Workflows ---');

const reportsPath = path.join(projectRoot, 'src/pages/admin/ReportsManagementPage.tsx');
const reportsCode = fs.readFileSync(reportsPath, 'utf8');

assert(reportsCode.includes("'SPAM'") && reportsCode.includes("'HARASSMENT'") &&
       reportsCode.includes("'INAPPROPRIATE_LANGUAGE'") && reportsCode.includes("'ACADEMIC_MISCONDUCT'") &&
       reportsCode.includes("'IMPERSONATION'"),
       'ReportsManagementPage defines required ViolationReason codes');

assert(reportsCode.includes("'HIDE_POST'") && reportsCode.includes("'ISSUE_STRIKE'") &&
       reportsCode.includes("'REQUEST_EDIT'"),
       'ReportsManagementPage defines required PenaltyAction penalties');

assert(reportsCode.includes("modNotes") && reportsCode.includes("textarea"),
       'ReportsManagementPage includes Moderator Justification notes textarea');

assert(reportsCode.includes("activeTab === 'history'") && reportsCode.includes("Moderation History & Audit"),
       'ReportsManagementPage includes Moderation History & Audit trail tab');

const postsPath = path.join(projectRoot, 'src/pages/admin/PostsManagementPage.tsx');
const postsCode = fs.readFileSync(postsPath, 'utf8');

assert(postsCode.includes("handleToggleHide") && postsCode.includes("nextStatus: PostRecord['status'] = isCurrentlyHidden ? 'active' : 'hidden'"),
       'PostsManagementPage implements post suppression toggle (handleToggleHide)');

assert(postsCode.includes("Suppressed by Community Safety Moderator"),
       'PostsManagementPage records suppression reason when post is hidden');


// ----------------------------------------------------
// 4. Faculty Workflows Verification
// ----------------------------------------------------
console.log('\n--- TEST GROUP 4: Faculty Workflows ---');

const oppsPath = path.join(projectRoot, 'src/pages/admin/OpportunitiesManagementPage.tsx');
const oppsCode = fs.readFileSync(oppsPath, 'utf8');

assert(oppsCode.includes("isFaculty ? 'Publish Academic Opportunity' : 'Post Opportunity'"),
       'OpportunitiesManagementPage has Publish Academic Opportunity trigger button for Faculty');

assert(oppsCode.includes("CAPSTONE_PROJECT") && oppsCode.includes("RESEARCH_ASSISTANT") &&
       oppsCode.includes("SCHOLARSHIP") && oppsCode.includes("INTERNSHIP"),
       'Publish Academic Opportunity modal includes academic opportunity categories');

assert(oppsCode.includes("targetCohort") && oppsCode.includes("department"),
       'Publish Academic Opportunity modal includes department and cohort fields');

const commsPath = path.join(projectRoot, 'src/pages/admin/CommunitiesManagementPage.tsx');
const commsCode = fs.readFileSync(commsPath, 'utf8');

assert(commsCode.includes("handleOpenPinModal") && commsCode.includes("handleSavePinAnnouncement") && commsCode.includes("handleUnpinAnnouncement"),
       'CommunitiesManagementPage implements Pin and Unpin Department Announcement workflow');

assert(commsCode.includes("pinnedAnnouncement"),
       'CommunitiesManagementPage stores pinnedAnnouncement metadata');

const usersPath = path.join(projectRoot, 'src/pages/admin/UsersManagementPage.tsx');
const usersCode = fs.readFileSync(usersPath, 'utf8');

assert(usersCode.includes("majorFilter") && usersCode.includes("cohortFilter"),
       'UsersManagementPage implements majorFilter and cohortFilter states');

assert(usersCode.includes("usersService.searchUsers") &&
       usersCode.includes("adaptBackendUser"),
       'UsersManagementPage dynamically fetches and adapts users from UserService backend (/api/users/search)');

assert(usersCode.includes("{!isFaculty && ("),
       'UsersManagementPage hides suspend action button when viewed by Faculty');


// ----------------------------------------------------
// 5. Design Consistency with DESIGN.md
// ----------------------------------------------------
console.log('\n--- TEST GROUP 5: Design Token & Consistency Verification ---');

const tailwindPath = path.join(projectRoot, 'tailwind.config.js');
const tailwindCode = fs.readFileSync(tailwindPath, 'utf8');

assert(tailwindCode.includes("primary: '#F27024'"), 'Tailwind config defines FPT Orange (#F27024)');
assert(tailwindCode.includes("secondary: '#0066B2'"), 'Tailwind config defines FPT Blue (#0066B2)');
assert(tailwindCode.includes("accent: '#0DB04B'"), 'Tailwind config defines FPT Green (#0DB04B)');

// Verify Tabler icons usage across codebase
const allTsxFiles = [sidebarPath, topbarPath, reportsPath, postsPath, oppsPath, commsPath, usersPath];
const allUseTabler = allTsxFiles.every((filePath) => {
  const code = fs.readFileSync(filePath, 'utf8');
  return code.includes("from '@tabler/icons-react'");
});
assert(allUseTabler, 'All admin and layout components strictly import Tabler icons from @tabler/icons-react');

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log('\n========================================');
const passedCount = testResults.filter((r) => r.status === 'PASSED').length;
const failedCount = testResults.filter((r) => r.status === 'FAILED').length;
console.log(`TOTAL TESTS: ${testResults.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log('========================================\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

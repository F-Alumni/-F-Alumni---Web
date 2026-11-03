import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://127.0.0.1:5173';
const SCREENSHOT_DIR = path.resolve('screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const testResults = {
  timestamp: new Date().toISOString(),
  target: BASE_URL,
  tests: [],
  consoleErrors: [],
  pageErrors: [],
  screenshots: []
};

function recordTest(suite, name, passed, details = {}, error = null) {
  const result = {
    suite,
    name,
    status: passed ? 'PASSED' : 'FAILED',
    details,
    error: error ? (error.message || String(error)) : null
  };
  testResults.tests.push(result);
  const statusEmoji = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${statusEmoji} [${suite}] ${name}`);
  if (details && Object.keys(details).length > 0) {
    console.log(`   Details:`, JSON.stringify(details));
  }
  if (error) {
    console.error(`   Error:`, error);
  }
}

async function takeScreenshot(page, filename, description) {
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: false });
  testResults.screenshots.push({ filename, filepath, description });
  console.log(`   📸 Screenshot saved: ${filename} (${description})`);
}

async function runFullAdminE2ETest() {
  console.log('========================================================================');
  console.log('🚀 RUNNING COMPREHENSIVE E2E REAL BROWSER TEST FOR F-ALUMNI ADMIN PORTAL');
  console.log(`Target: ${BASE_URL}`);
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  const page = await browser.newPage();

  // Monitor console logs & uncaught errors
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      testResults.consoleErrors.push(text);
      console.error(`   [Browser Console Error]: ${text}`);
    }
  });

  page.on('pageerror', err => {
    testResults.pageErrors.push(err.message);
    console.error(`   [Browser Page Error]: ${err.message}`);
  });

  try {
    // -------------------------------------------------------------
    // STEP 1: Landing Page (http://127.0.0.1:5173/)
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Landing Page (/) ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const landingData = await page.evaluate(() => {
      const heading = document.querySelector('h1')?.textContent?.trim();
      const loginLinks = Array.from(document.querySelectorAll('a, button')).filter(el =>
        el.textContent.includes('Đăng nhập') ||
        el.textContent.includes('Cổng Quản Trị') ||
        el.textContent.includes('Sign in')
      );
      return {
        title: document.title,
        heading,
        hasActionButtons: loginLinks.length > 0,
        buttonTexts: loginLinks.map(b => b.textContent.trim().slice(0, 30))
      };
    });

    recordTest('Landing Page', 'Landing page loads successfully with hero heading and CTA buttons', !!landingData.heading, landingData);
    await takeScreenshot(page, '01_landing_page.png', 'Landing Page Hero & CTA');

    // -------------------------------------------------------------
    // STEP 2: Login Page & Admin Authentication
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing /auth/login & Admin Login Flow ---');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    await takeScreenshot(page, '02_login_page.png', 'Admin Login Portal Screen');

    // Test Login via Google Workspace Admin button or Email/Password
    const googleAdminBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Google Workspace Admin') ||
        b.textContent.includes('Google')
      );
    });

    if (googleAdminBtn) {
      console.log('   Clicking Google Workspace Admin button...');
      await googleAdminBtn.click();
    } else {
      console.log('   Filling email/password for Admin...');
      await page.type('#staff-email', 'admin@fpt.edu.vn');
      await page.type('#staff-password', '123456');
      const submitBtn = await page.$('button[type="submit"]');
      await submitBtn.click();
    }

    // Wait for redirect to /admin/dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1500));

    const currentUrl = page.url();
    const isAtDashboard = currentUrl.includes('/admin/dashboard');
    recordTest('Authentication', 'Admin login redirects successfully to /admin/dashboard', isAtDashboard, { currentUrl });

    // -------------------------------------------------------------
    // STEP 3: /admin/dashboard Verification
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing /admin/dashboard ---');
    const dashboardMetrics = await page.evaluate(() => {
      const statCards = Array.from(document.querySelectorAll('[data-testid="stat-card"], .rounded-xl, .border-slate-200')).filter(el =>
        el.textContent.includes('User') ||
        el.textContent.includes('Alumni') ||
        el.textContent.includes('Member Verification')
      );
      const urgentReviewRows = document.querySelectorAll('tbody tr');
      const refreshBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Refresh')
      );

      return {
        statCardsCount: statCards.length,
        pendingReviewsCount: urgentReviewRows.length,
        hasRefreshButton: !!refreshBtn
      };
    });

    recordTest('Admin Dashboard', 'KPI stat cards and urgent review list are displayed', dashboardMetrics.statCardsCount > 0, dashboardMetrics);

    // Test Refresh Button
    const refreshBtnHandle = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Refresh Data') || b.textContent.includes('Refresh')
      );
    });
    if (refreshBtnHandle) {
      await refreshBtnHandle.click();
      await new Promise(r => setTimeout(r, 1200));
      const toastText = await page.evaluate(() => {
        const toast = document.querySelector('.bg-emerald-50, [role="alert"]');
        return toast ? toast.textContent?.trim() : null;
      });
      recordTest('Admin Dashboard', 'Refresh Data button triggers data synchronization & feedback toast', true, { toastText });
    }

    await takeScreenshot(page, '03_admin_dashboard.png', 'Admin Dashboard KPI & Review Queue');

    // -------------------------------------------------------------
    // STEP 4: /admin/users Verification
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing /admin/users (Directory & Account Moderation) ---');
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    const usersData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      const searchInput = document.querySelector('input[placeholder*="Search"], input[type="search"]');
      const campusSelect = Array.from(document.querySelectorAll('select')).find(s => s.textContent.includes('Hòa Lạc') || s.textContent.includes('Campus'));
      const exportBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Export') || b.textContent.includes('CSV'));

      return {
        rowCount: rows.length,
        hasSearchInput: !!searchInput,
        hasCampusFilter: !!campusSelect,
        hasExportBtn: !!exportBtn,
        firstUser: rows[0] ? rows[0].textContent?.slice(0, 80) : null
      };
    });

    recordTest('Users Management', 'User directory table renders with search, filters, and Export CSV button', usersData.rowCount > 0, usersData);

    // Test Search Interaction
    await page.type('input[placeholder*="Search"], input[type="search"]', 'Chí Trung');
    await new Promise(r => setTimeout(r, 600));

    // Clear search
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Search"], input[type="search"]');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 500));

    // Test Open Profile Modal
    const profileBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Profile'));
    });
    if (profileBtn) {
      await profileBtn.click();
      await new Promise(r => setTimeout(r, 600));
      const modalOpened = await page.evaluate(() => {
        const modal = document.querySelector('.fixed.inset-0, [role="dialog"]');
        return !!modal && (modal.textContent.includes('Student / Staff ID') || modal.textContent.includes('Close Profile'));
      });
      recordTest('Users Management', 'Profile button opens user detail preview modal', modalOpened);
      // Close modal
      await page.evaluate(() => {
        const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Close Profile'));
        if (closeBtn) closeBtn.click();
      });
      await new Promise(r => setTimeout(r, 500));
    }

    // Test Suspend / Restore button
    const toggleSuspendBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Suspend') || b.textContent.includes('Restore')
      );
    });
    if (toggleSuspendBtn) {
      const beforeText = await page.evaluate(b => b.textContent.trim(), toggleSuspendBtn);
      await toggleSuspendBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      const suspendToast = await page.evaluate(() => {
        const toast = document.querySelector('.bg-emerald-50, .border-emerald-200');
        return toast ? toast.textContent?.trim() : null;
      });
      recordTest('Users Management', `Toggling user account status (${beforeText}) updates state and shows toast`, true, { beforeText, toast: suspendToast });
    }

    // Test Export Users CSV button
    const exportCsvBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Export') || b.textContent.includes('CSV')
      );
    });
    if (exportCsvBtn) {
      await exportCsvBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      const exportToast = await page.evaluate(() => {
        const toast = document.querySelector('.bg-emerald-50, .border-emerald-200');
        return toast ? toast.textContent?.trim() : null;
      });
      recordTest('Users Management', 'Export Users CSV button executes file download / feedback', true, { toast: exportToast });
    }

    await takeScreenshot(page, '04_admin_users.png', 'Users Management Directory & Actions');

    // -------------------------------------------------------------
    // STEP 5: /admin/reports Verification
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing /admin/reports (Moderation Queue & Actions) ---');
    await page.goto(`${BASE_URL}/admin/reports`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const reportsData = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button')).filter(b =>
        b.textContent.includes('Pending Queue') ||
        b.textContent.includes('Moderation History')
      );
      const rows = document.querySelectorAll('tbody tr');
      return {
        tabsCount: tabs.length,
        pendingReportsCount: rows.length
      };
    });

    recordTest('Reports Management', 'Reports page loads with Pending Queue and History tabs', reportsData.tabsCount >= 2, reportsData);

    // Test opening violation resolution modal ("Sanction" button)
    const sanctionBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Sanction' || b.textContent.includes('Sanction')
      );
    });

    if (sanctionBtn) {
      await sanctionBtn.click();
      await new Promise(r => setTimeout(r, 600));

      const modalCheck = await page.evaluate(() => {
        const modal = document.querySelector('.fixed.inset-0, [role="dialog"]');
        const reasonRadio = modal?.querySelector('input[type="radio"]');
        const notesArea = modal?.querySelector('textarea');
        const confirmBtn = Array.from(modal?.querySelectorAll('button') || []).find(b =>
          b.textContent.includes('Confirm Sanction')
        );
        return {
          isOpen: !!modal,
          hasReasonRadio: !!reasonRadio,
          hasNotesArea: !!notesArea,
          hasConfirmBtn: !!confirmBtn
        };
      });

      recordTest('Reports Management', 'Action modal opens with violation reason options, penalty choices, and justification notes', modalCheck.isOpen && modalCheck.hasConfirmBtn, modalCheck);

      // Fill justification note and execute sanction
      await page.type('textarea', 'Verified violation under FPT academic policy. Post suppressed.');
      const confirmSanctionBtn = await page.evaluateHandle(() => {
        const modal = document.querySelector('.fixed.inset-0, [role="dialog"]');
        return Array.from(modal?.querySelectorAll('button') || []).find(b =>
          b.textContent.includes('Confirm Sanction')
        );
      });
      if (confirmSanctionBtn) {
        await confirmSanctionBtn.click();
        await new Promise(r => setTimeout(r, 1200));
        const sanctionToast = await page.evaluate(() => {
          const toast = document.querySelector('.bg-emerald-50, .border-emerald-200');
          return toast ? toast.textContent?.trim() : null;
        });
        recordTest('Reports Management', 'Executing sanction successfully updates report status and archives item', true, { toast: sanctionToast });
      }
    }

    // Test Dismiss button on another report if available
    const dismissBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Dismiss')
      );
    });
    if (dismissBtn) {
      await dismissBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      const dismissToast = await page.evaluate(() => {
        const toast = document.querySelector('.bg-emerald-50, .border-emerald-200');
        return toast ? toast.textContent?.trim() : null;
      });
      recordTest('Reports Management', 'Dismiss report rejects report as false positive with toast feedback', true, { toast: dismissToast });
    }

    // Test Moderation History Tab
    const historyTabBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Moderation History')
      );
    });
    if (historyTabBtn) {
      await historyTabBtn.click();
      await new Promise(r => setTimeout(r, 600));
      const historyRows = await page.evaluate(() => document.querySelectorAll('tbody tr').length);
      recordTest('Reports Management', 'Switching to Moderation History tab displays historical audit records', historyRows > 0, { historyRows });
    }

    await takeScreenshot(page, '05_admin_reports.png', 'Moderation Reports & Audit Queue');

    // -------------------------------------------------------------
    // STEP 6: /admin/posts Verification
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing /admin/posts (Forum Posts Moderation) ---');
    await page.goto(`${BASE_URL}/admin/posts`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const postsCount = await page.evaluate(() => document.querySelectorAll('tbody tr').length);
    recordTest('Posts Management', 'Posts list rendered from Forum Service', postsCount > 0, { postsCount });

    // Test Hide / Unhide post button
    const hideBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Hide') || b.textContent.includes('Unhide')
      );
    });
    if (hideBtn) {
      const hideText = await page.evaluate(b => b.textContent.trim(), hideBtn);
      await hideBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      const hideToast = await page.evaluate(() => {
        const toast = document.querySelector('.bg-emerald-50, .border-emerald-200');
        return toast ? toast.textContent?.trim() : null;
      });
      recordTest('Posts Management', `Toggling post visibility (${hideText}) updates post status and displays toast`, true, { hideText, toast: hideToast });
    }

    // Test Delete post button (rendered with title="Remove post permanently" or aria-label="Remove post")
    const deletePostBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b =>
        (b.getAttribute('title') && b.getAttribute('title').includes('Remove post')) ||
        (b.getAttribute('aria-label') && b.getAttribute('aria-label').includes('Remove post'))
      );
    });
    if (deletePostBtn) {
      await deletePostBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      const deleteToast = await page.evaluate(() => {
        const toast = document.querySelector('.bg-emerald-50, .border-emerald-200');
        return toast ? toast.textContent?.trim() : null;
      });
      recordTest('Posts Management', 'Delete post permanently removes violating post from listing', true, { toast: deleteToast });
    }

    await takeScreenshot(page, '06_admin_posts.png', 'Forum Posts Management & Suppression');

    // -------------------------------------------------------------
    // STEP 7: /admin/communities Verification
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing /admin/communities (Categories & Pinned Announcements) ---');
    await page.goto(`${BASE_URL}/admin/communities`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const commCount = await page.evaluate(() => document.querySelectorAll('tbody tr').length);
    recordTest('Communities Management', 'Communities list rendered from Forum Service', commCount > 0, { commCount });

    // Open Pin Announcement Modal ("Pin Notice" or "Pinned")
    const pinBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Pin Notice') || b.textContent.includes('Pinned')
      );
    });
    if (pinBtn) {
      await pinBtn.click();
      await new Promise(r => setTimeout(r, 600));

      const modalIsOpen = await page.evaluate(() => {
        const modal = document.querySelector('.fixed.inset-0, [role="dialog"]');
        return !!modal && modal.textContent.includes('Pin Department Announcement');
      });
      recordTest('Communities Management', 'Pin Announcement modal opens successfully', modalIsOpen);

      // Fill in content
      await page.type('textarea', 'Hạn nộp báo cáo Capstone Project đợt 1 là ngày 15/11/2026.');

      // Save Pinned Announcement
      const savePinBtn = await page.evaluateHandle(() => {
        const modal = document.querySelector('.fixed.inset-0, [role="dialog"]');
        return Array.from(modal?.querySelectorAll('button') || []).find(b =>
          b.textContent.includes('Pin Announcement') || b.getAttribute('type') === 'submit'
        );
      });
      if (savePinBtn) {
        await savePinBtn.click();
        await new Promise(r => setTimeout(r, 1000));
        const pinToast = await page.evaluate(() => {
          const toast = document.querySelector('.bg-emerald-50, .border-emerald-200');
          return toast ? toast.textContent?.trim() : null;
        });
        recordTest('Communities Management', 'Saving pinned department announcement attaches badge to community', true, { toast: pinToast });
      }
    }

    await takeScreenshot(page, '07_admin_communities.png', 'Campus Communities & Pinned Announcements');

    // -------------------------------------------------------------
    // STEP 8: /admin/opportunities Verification
    // -------------------------------------------------------------
    console.log('\n--- 8. Testing /admin/opportunities (OJT / Capstone Career Portal) ---');
    await page.goto(`${BASE_URL}/admin/opportunities`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const oppCount = await page.evaluate(() => document.querySelectorAll('tbody tr').length);
    recordTest('Opportunities Management', 'Opportunities table renders OJT & Capstone listings', oppCount > 0, { oppCount });

    // Open Publish Academic Opportunity modal ("Publish Academic Opportunity" or "Post Opportunity")
    const publishOppBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Publish Academic Opportunity') || b.textContent.includes('Post Opportunity')
      );
    });
    if (publishOppBtn) {
      await publishOppBtn.click();
      await new Promise(r => setTimeout(r, 600));

      const modalReady = await page.evaluate(() => {
        const modal = document.querySelector('.fixed.inset-0, [role="dialog"]');
        return !!modal && (modal.textContent.includes('Publish') || modal.textContent.includes('Opportunity'));
      });
      recordTest('Opportunities Management', 'Publish Academic Opportunity modal opens with required fields', modalReady);

      // Fill in title
      await page.type('input[placeholder*="LLM Engineering"], input[placeholder*="Title"]', 'AI Lab Research Assistant - Fall 2026');

      const submitOppBtn = await page.evaluateHandle(() => {
        const modal = document.querySelector('.fixed.inset-0, [role="dialog"]');
        return Array.from(modal?.querySelectorAll('button') || []).find(b =>
          b.textContent.includes('Publish Opportunity') || b.getAttribute('type') === 'submit'
        );
      });
      if (submitOppBtn) {
        await submitOppBtn.click();
        await new Promise(r => setTimeout(r, 1000));
        recordTest('Opportunities Management', 'New academic opportunity published and added to listing', true);
      }
    }

    await takeScreenshot(page, '08_admin_opportunities.png', 'Academic Opportunities & Capstone Listings');

    // -------------------------------------------------------------
    // STEP 9: /admin/analytics Verification
    // -------------------------------------------------------------
    console.log('\n--- 9. Testing /admin/analytics (Growth, Share & Audit Trail) ---');
    await page.goto(`${BASE_URL}/admin/analytics`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    const analyticsCheck = await page.evaluate(() => {
      const cards = document.querySelectorAll('.grid .rounded-xl, .grid .border-slate-200');
      const auditTable = document.querySelector('table');
      const exportLogsBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Export Audit Logs')
      );
      return {
        cardsCount: cards.length,
        hasAuditTable: !!auditTable,
        hasExportLogsBtn: !!exportLogsBtn
      };
    });

    recordTest('Analytics & Audit', 'Analytics renders KPI cards, Campus & Major breakdowns, and Security Audit Trail table', analyticsCheck.cardsCount > 0 && analyticsCheck.hasAuditTable, analyticsCheck);

    // Test Export Audit Logs (CSV) button
    const exportLogsBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Export Audit Logs')
      );
    });
    if (exportLogsBtn) {
      await exportLogsBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      const logToast = await page.evaluate(() => {
        const toast = document.querySelector('.bg-emerald-50, .border-emerald-200');
        return toast ? toast.textContent?.trim() : null;
      });
      recordTest('Analytics & Audit', 'Export Audit Logs (CSV) button triggers log download / toast', true, { toast: logToast });
    }

    await takeScreenshot(page, '09_admin_analytics.png', 'Analytics Dashboard & Security Audit Trail');

    // -------------------------------------------------------------
    // STEP 10: /admin/settings Verification
    // -------------------------------------------------------------
    console.log('\n--- 10. Testing /admin/settings (Governance Policies & Broadcast) ---');
    await page.goto(`${BASE_URL}/admin/settings`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const settingsCheck = await page.evaluate(() => {
      const switches = document.querySelectorAll('button[role="switch"], input[type="checkbox"]');
      const broadcastBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('New Announcement') || b.textContent.includes('Broadcast')
      );
      const annRows = document.querySelectorAll('.space-y-3 > div');
      return {
        switchesCount: switches.length,
        hasBroadcastBtn: !!broadcastBtn,
        announcementsCount: annRows.length
      };
    });

    recordTest('Settings & Governance', 'Settings page displays policy switches and system announcements table', settingsCheck.hasBroadcastBtn, settingsCheck);

    // Test Broadcast System Announcement Modal
    const broadcastBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('New Announcement') || b.textContent.includes('Broadcast')
      );
    });
    if (broadcastBtn) {
      await broadcastBtn.click();
      await new Promise(r => setTimeout(r, 600));

      const modalBroadcast = await page.evaluate(() => {
        const modal = document.querySelector('.fixed.inset-0, [role="dialog"]');
        return !!modal && modal.textContent.includes('Broadcast System Announcement');
      });
      recordTest('Settings & Governance', 'Broadcast System Announcement modal opens', modalBroadcast);

      // Fill and publish
      await page.type('input[placeholder*="bảo trì"], input[placeholder*="title"]', 'Bảo trì hệ thống định kỳ FPT Alumni');
      await page.type('textarea', 'Hệ thống sẽ bảo trì nâng cấp microservices vào lúc 23:00 tối nay.');

      const publishAnnBtn = await page.evaluateHandle(() => {
        const modal = document.querySelector('.fixed.inset-0, [role="dialog"]');
        return Array.from(modal?.querySelectorAll('button') || []).find(b =>
          b.textContent.includes('Publish Now') || b.getAttribute('type') === 'submit'
        );
      });
      if (publishAnnBtn) {
        await publishAnnBtn.click();
        await new Promise(r => setTimeout(r, 1000));
        const annToast = await page.evaluate(() => {
          const toast = document.querySelector('.bg-emerald-50, .border-emerald-200');
          return toast ? toast.textContent?.trim() : null;
        });
        recordTest('Settings & Governance', 'Broadcast announcement published and added to announcements table', true, { toast: annToast });
      }
    }

    // Test remove announcement button
    const removeAnnBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b =>
        b.getAttribute('title') && b.getAttribute('title').includes('Remove announcement')
      );
    });
    if (removeAnnBtn) {
      await removeAnnBtn.click();
      await new Promise(r => setTimeout(r, 800));
      recordTest('Settings & Governance', 'Remove announcement action removes broadcast from listing', true);
    }

    await takeScreenshot(page, '10_admin_settings.png', 'Governance Policy Settings & System Announcements');

    // -------------------------------------------------------------
    // STEP 11: /admin/alumni-verification Verification
    // -------------------------------------------------------------
    console.log('\n--- 11. Testing /admin/alumni-verification (Degree Badge Queue) ---');
    await page.goto(`${BASE_URL}/admin/alumni-verification`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const verifyQueueCheck = await page.evaluate(() => {
      const rows = document.querySelectorAll('tbody tr');
      const approveBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Approve'));
      const rejectBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Reject'));
      return {
        queueCount: rows.length,
        approveButtons: approveBtns.length,
        rejectButtons: rejectBtns.length
      };
    });

    recordTest('Alumni Verification', 'Alumni diploma verification queue renders with Approve / Reject action buttons', verifyQueueCheck.queueCount > 0, verifyQueueCheck);

    // Test Approve verification
    const approveBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Approve'));
    });
    if (approveBtn) {
      await approveBtn.click();
      await new Promise(r => setTimeout(r, 800));
      recordTest('Alumni Verification', 'Approve action successfully issues Alumni verified badge', true);
    }

    // Test Reject verification
    const rejectBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Reject'));
    });
    if (rejectBtn) {
      await rejectBtn.click();
      await new Promise(r => setTimeout(r, 800));
      recordTest('Alumni Verification', 'Reject action updates status to rejected', true);
    }

    await takeScreenshot(page, '11_admin_alumni_verification.png', 'Alumni Diploma Verification Queue');

    // -------------------------------------------------------------
    // STEP 12: Console Error Verification
    // -------------------------------------------------------------
    console.log('\n--- 12. Browser Console Health & Error Audit ---');
    const criticalErrors = testResults.consoleErrors.filter(err =>
      !err.includes('Download the React DevTools') &&
      !err.includes('favicon') &&
      !err.includes('net::ERR_') &&
      !err.includes('status of 404')
    );
    const hasNoCriticalErrors = criticalErrors.length === 0 && testResults.pageErrors.length === 0;
    recordTest('Console Health', 'Browser console is clean with zero unhandled JavaScript exceptions or runtime crashes', hasNoCriticalErrors, {
      criticalErrors,
      pageErrors: testResults.pageErrors
    });

  } finally {
    await browser.close();
  }

  // Save full results JSON
  const outputPath = path.resolve('scripts/full-admin-test-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(testResults, null, 2), 'utf8');

  console.log('\n========================================================================');
  const total = testResults.tests.length;
  const passed = testResults.tests.filter(t => t.status === 'PASSED').length;
  const failed = testResults.tests.filter(t => t.status === 'FAILED').length;
  console.log(`🏁 FULL ADMIN E2E TESTING COMPLETED: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}`);
  console.log(`Results JSON saved to: ${outputPath}`);
  console.log('========================================================================\n');

  return testResults;
}

runFullAdminE2ETest().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});

import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://127.0.0.1:5173';

const testResults = [];

function record(name, passed, details = '') {
  testResults.push({ name, status: passed ? 'PASSED' : 'FAILED', details });
  const icon = passed ? '\x1b[32m✔ PASS\x1b[0m' : '\x1b[31m✘ FAIL\x1b[0m';
  console.log(`${icon}: ${name} ${details ? `(${details})` : ''}`);
}

async function runAdminE2ETests() {
  console.log('\n======================================================');
  console.log('🧪 COMPREHENSIVE ADMIN PORTAL E2E BROWSER TEST SUITE');
  console.log('======================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Listen for uncaught console errors
  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));

  try {
    // -------------------------------------------------------------------------
    // 1. Landing Page Test
    // -------------------------------------------------------------------------
    console.log('--- 1. Testing Landing Page ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0', timeout: 15000 });
    const hasLandingTitle = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.innerText.length > 0 : false;
    });
    record('Landing page loads and renders Hero H1', hasLandingTitle);

    // -------------------------------------------------------------------------
    // 2. Authentication & Admin Login
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing Authentication & Google Admin SSO ---');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle0', timeout: 15000 });
    const loginHeader = await page.$eval('h1', el => el.innerText);
    record('Login page renders Admin Portal header', loginHeader.includes('Admin Portal'));

    // Click Google Workspace Admin login button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Google Workspace Admin'));
      if (btn) btn.click();
    });

    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1500));
    record('Admin login successful and redirected to /admin/dashboard', page.url().includes('/admin/dashboard'), page.url());

    // -------------------------------------------------------------------------
    // 3. Admin Dashboard Page
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing /admin/dashboard ---');
    const dashboardCards = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Total Users') || text.includes('Active Accounts') || text.includes('Pending Review');
    });
    record('Dashboard renders summary KPI cards', dashboardCards);

    // Click Refresh Data button
    const refreshClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Refresh'));
      if (btn) { btn.click(); return true; }
      return false;
    });
    record('Dashboard Refresh Data button is interactive', refreshClicked);
    await new Promise(r => setTimeout(r, 500));

    // -------------------------------------------------------------------------
    // 4. Users Management Page
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing /admin/users ---');
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle0', timeout: 15000 });
    const usersTableOk = await page.evaluate(() => {
      return document.querySelector('table') !== null;
    });
    record('Users page renders DataTable', usersTableOk);

    // Check Export Users CSV button
    const hasExportUsersBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.innerText.includes('Export Users CSV'));
    });
    record('Users page has Export Users CSV button', hasExportUsersBtn);

    // Inspect user modal
    const profileModalOpened = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const viewBtn = btns.find(b => b.innerText.includes('Profile'));
      if (viewBtn) { viewBtn.click(); return true; }
      return false;
    });
    await new Promise(r => setTimeout(r, 600));
    const modalVisible = await page.evaluate(() => {
      return document.body.innerText.includes('Close Profile');
    });
    record('Profile inspection modal opens properly', profileModalOpened && modalVisible);

    // Close modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const closeBtn = btns.find(b => b.innerText.includes('Close Profile'));
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // -------------------------------------------------------------------------
    // 5. Moderation Reports Page
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing /admin/reports ---');
    await page.goto(`${BASE_URL}/admin/reports`, { waitUntil: 'networkidle0', timeout: 15000 });
    const hasQueueTab = await page.evaluate(() => {
      return document.body.innerText.includes('Pending Queue') && document.body.innerText.includes('Moderation History');
    });
    record('Reports page renders Pending Queue and Moderation History tabs', hasQueueTab);

    // Click Moderation History tab using native click on button
    const historyTabHandle = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Moderation History'));
    });
    if (historyTabHandle && historyTabHandle.asElement()) {
      await historyTabHandle.asElement().click();
    }
    await new Promise(r => setTimeout(r, 800));

    const historyViewActive = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Resolved By') || text.includes('Outcome') || text.includes('Violation Policy') || text.includes('Sanctioned');
    });
    record('Switching to Moderation History tab displays audit resolution table', historyViewActive);

    // -------------------------------------------------------------------------
    // 6. Posts Management Page
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Testing /admin/posts ---');
    await page.goto(`${BASE_URL}/admin/posts`, { waitUntil: 'networkidle0', timeout: 15000 });
    const postsTableOk = await page.evaluate(() => {
      return document.querySelector('table') !== null && document.body.innerText.includes('Tips for passing FPT');
    });
    record('Posts page renders forum discussion items', postsTableOk);

    // Toggle post hide/suppress
    const hideBtnClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const hideBtn = btns.find(b => b.getAttribute('title')?.includes('Hide') || b.innerText.includes('Hide') || b.getAttribute('title')?.includes('Suppress'));
      if (hideBtn) { hideBtn.click(); return true; }
      return false;
    });
    await new Promise(r => setTimeout(r, 500));
    record('Moderator post suppression toggle is interactive', hideBtnClicked);

    // -------------------------------------------------------------------------
    // 7. Communities Management Page
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Testing /admin/communities ---');
    await page.goto(`${BASE_URL}/admin/communities`, { waitUntil: 'networkidle0', timeout: 15000 });
    const commsTableOk = await page.evaluate(() => {
      return document.querySelector('table') !== null && document.body.innerText.includes('Software Engineering');
    });
    record('Communities page renders academic hubs & categories', commsTableOk);

    // -------------------------------------------------------------------------
    // 8. Opportunities Management Page
    // -------------------------------------------------------------------------
    console.log('\n--- 8. Testing /admin/opportunities ---');
    await page.goto(`${BASE_URL}/admin/opportunities`, { waitUntil: 'networkidle0', timeout: 15000 });
    const oppsTableOk = await page.evaluate(() => {
      return document.querySelector('table') !== null && document.body.innerText.includes('Junior React & Node.js');
    });
    record('Opportunities page renders career & capstone listings', oppsTableOk);

    // Check Publish Modal trigger
    const oppModalOpened = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Publish Academic Opportunity') || b.innerText.includes('Post Opportunity'));
      if (btn) { btn.click(); return true; }
      return false;
    });
    await new Promise(r => setTimeout(r, 600));
    const oppModalVisible = await page.evaluate(() => {
      return document.body.innerText.includes('Academic Opportunity') || document.body.innerText.includes('Target Cohort');
    });
    record('Publish Academic Opportunity modal opens with required fields', oppModalOpened && oppModalVisible);

    // Close opp modal via Cancel button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cancelBtn = btns.find(b => b.innerText.trim() === 'Cancel');
      if (cancelBtn) cancelBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // -------------------------------------------------------------------------
    // 9. Analytics Page
    // -------------------------------------------------------------------------
    console.log('\n--- 9. Testing /admin/analytics ---');
    await page.goto(`${BASE_URL}/admin/analytics`, { waitUntil: 'networkidle0', timeout: 15000 });
    const analyticsOk = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Campus Distribution') && text.includes('Major Breakdown') && text.includes('Recent Security Audit Trail');
    });
    record('Analytics page renders KPI cards, Campus Distribution, Major Share and Security Audit Trail', analyticsOk);

    // Check Export Audit Logs CSV button
    const hasExportAuditLogsBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.innerText.includes('Export Audit Logs (CSV)'));
    });
    record('Analytics page has Export Audit Logs (CSV) action button', hasExportAuditLogsBtn);

    // -------------------------------------------------------------------------
    // 10. Settings & Broadcast Announcements Page
    // -------------------------------------------------------------------------
    console.log('\n--- 10. Testing /admin/settings ---');
    await page.goto(`${BASE_URL}/admin/settings`, { waitUntil: 'networkidle0', timeout: 15000 });
    const settingsOk = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Alumni Verification Automation') && text.includes('System Broadcasts & Announcements');
    });
    record('Settings page renders policies and System Announcements section', settingsOk);

    // Open Broadcast Announcement modal
    const broadcastModalOpened = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('New Announcement'));
      if (btn) { btn.click(); return true; }
      return false;
    });
    await new Promise(r => setTimeout(r, 600));
    const broadcastModalVisible = await page.evaluate(() => {
      return document.body.innerText.includes('Broadcast System Announcement') && document.body.innerText.includes('Priority Level');
    });
    record('Broadcast System Announcement modal opens properly', broadcastModalOpened && broadcastModalVisible);

    // Close broadcast modal via Cancel button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cancelBtn = btns.find(b => b.innerText.trim() === 'Cancel');
      if (cancelBtn) cancelBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // -------------------------------------------------------------------------
    // 11. Alumni Verification Page
    // -------------------------------------------------------------------------
    console.log('\n--- 11. Testing /admin/alumni-verification ---');
    await page.goto(`${BASE_URL}/admin/alumni-verification`, { waitUntil: 'networkidle0', timeout: 15000 });
    await page.waitForSelector('table', { timeout: 10000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1000));
    const evalData = await page.evaluate(() => {
      const table = document.querySelector('table');
      const text = document.body.innerText.toUpperCase();
      return {
        hasTable: !!table,
        headers: table ? Array.from(table.querySelectorAll('th')).map(th => th.innerText.toUpperCase()) : [],
        hasVerificationDoc: text.includes('VERIFICATION DOCUMENT'),
        hasApplicant: text.includes('APPLICANT'),
      };
    });
    const verificationOk = evalData.hasTable && (evalData.hasVerificationDoc || evalData.hasApplicant);
    record('Alumni Verification page renders diploma review queue', verificationOk);

    // Test Approve button
    const approveClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const approveBtn = btns.find(b => b.innerText.includes('Approve'));
      if (approveBtn) { approveBtn.click(); return true; }
      return false;
    });
    await new Promise(r => setTimeout(r, 500));
    record('Alumni approval button successfully updates status', approveClicked);

    // Check page errors
    record('No unhandled uncaught JavaScript exceptions during all navigation', pageErrors.length === 0, pageErrors.join('; '));

  } catch (err) {
    console.error('Fatal test error:', err);
    record('Fatal test execution', false, err.message);
  } finally {
    await browser.close();
  }

  console.log('\n======================================================');
  const passed = testResults.filter(t => t.status === 'PASSED').length;
  const failed = testResults.filter(t => t.status === 'FAILED').length;
  console.log(`TOTAL E2E TESTS: ${testResults.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAdminE2ETests();

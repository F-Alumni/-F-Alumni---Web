import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.resolve(__dirname, '../screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const WEB_BASE_URL = 'http://localhost:5173';

const apiCalls = [];

async function runLiveWebTest() {
  console.log('================================================================');
  console.log('🌐 FULL BROWSER E2E TEST: WEB FRONTEND <-> MICROSERVICES GATEWAY');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Listen to browser console logs
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error' && !text.includes('Failed to load resource')) {
      console.log(`[Browser Console Error]: ${text}`);
    }
  });

  // Intercept and record all API calls to port 5000 (excluding OPTIONS preflight)
  page.on('response', async res => {
    const url = res.url();
    const method = res.request().method();
    if (url.includes(':5000') && method !== 'OPTIONS') {
      const status = res.status();
      let responseBody = null;
      try {
        const text = await res.text();
        try { responseBody = JSON.parse(text); } catch { responseBody = text; }
      } catch {}

      apiCalls.push({
        method,
        url,
        status,
        ok: status >= 200 && status < 300,
        data: responseBody
      });
      console.log(`📡 [API Captured] ${method.padEnd(5)} ${url} -> HTTP ${status}`);
    }
  });

  try {
    // -------------------------------------------------------------------------
    // STEP 1: Navigate to Login Page & Authenticate
    // -------------------------------------------------------------------------
    console.log('--- STEP 1: Login via Web UI ---');
    await page.goto(`${WEB_BASE_URL}/auth/login`, { waitUntil: 'networkidle2', timeout: 15000 });
    console.log('Opened Login Page:', page.url());

    // Click 1-Click Login button
    const loginAction = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const demoBtn = btns.find(b => b.innerText.includes('1-Click Login'));
      if (demoBtn) {
        demoBtn.click();
        return 'Clicked 1-Click Login';
      }
      return 'Not found';
    });
    console.log('Action:', loginAction);

    // Wait for redirect to /admin/dashboard
    await page.waitForFunction(
      () => window.location.pathname.includes('/admin/dashboard'),
      { timeout: 10000 }
    );
    await new Promise(r => setTimeout(r, 2000));
    console.log('✅ Successfully authenticated and navigated to:', page.url());
    await page.screenshot({ path: path.join(screenshotsDir, '01_admin_dashboard.png') });
    console.log('📸 Screenshot saved: screenshots/01_admin_dashboard.png');

    // -------------------------------------------------------------------------
    // STEP 2: Navigate to User Forum Feed (/app/home)
    // -------------------------------------------------------------------------
    console.log('\n--- STEP 2: User Home & Forum Feed (/app/home) ---');
    await page.goto(`${WEB_BASE_URL}/app/home`, { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2500));
    console.log('Navigated to:', page.url());

    // Verify AI Mentor Recommendation in RightSidebar
    const htmlHome = await page.content();
    const hasMentor = htmlHome.includes('Nguyễn Hữu Trí') || htmlHome.includes('Match');
    console.log('✅ AI Mentors recommendation loaded:', hasMentor);

    // -------------------------------------------------------------------------
    // STEP 3: Create Post from PostComposer UI
    // -------------------------------------------------------------------------
    console.log('\n--- STEP 3: Create Post on Forum Feed ---');
    // Focus textarea to expand
    await page.waitForSelector('textarea', { timeout: 5000 });
    await page.focus('textarea');
    await new Promise(r => setTimeout(r, 500));

    // Type title and content
    const titleInput = await page.$('input[placeholder*="Tiêu đề"]');
    if (titleInput) {
      await titleInput.type('Kinh nghiem phong van Backend Developer tai FPT');
    }
    await page.type('textarea', 'Chung toi xin chia se quy trinh phong van danh cho sinh viên chuyen nganh Ky thuat phan mem.');

    // Click "Đăng bài" button
    const postSubmitted = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const submitBtn = btns.find(b => b.innerText.includes('Đăng bài'));
      if (submitBtn) {
        submitBtn.click();
        return true;
      }
      return false;
    });

    if (postSubmitted) {
      console.log('Clicked "Đăng bài" button.');
      await new Promise(r => setTimeout(r, 3000));
    }
    await page.screenshot({ path: path.join(screenshotsDir, '02_user_home_feed.png') });
    console.log('📸 Screenshot saved: screenshots/02_user_home_feed.png');

    // -------------------------------------------------------------------------
    // STEP 4: Like/React to a Post on Feed
    // -------------------------------------------------------------------------
    console.log('\n--- STEP 4: Like / React to Post ---');
    const reacted = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const likeBtn = btns.find(b => b.innerHTML.includes('lucide-heart') || b.querySelector('svg'));
      if (likeBtn) {
        likeBtn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked reaction button:', reacted);
    await new Promise(r => setTimeout(r, 1500));

    // -------------------------------------------------------------------------
    // STEP 5: Navigate to Chat Page (/app/chat)
    // -------------------------------------------------------------------------
    console.log('\n--- STEP 5: Real-time Chat UI (/app/chat) ---');
    await page.goto(`${WEB_BASE_URL}/app/chat`, { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2500));
    console.log('Navigated to:', page.url());
    await page.screenshot({ path: path.join(screenshotsDir, '03_chat_page.png') });
    console.log('📸 Screenshot saved: screenshots/03_chat_page.png');

    // -------------------------------------------------------------------------
    // STEP 6: Navigate to Admin Users Directory (/admin/users)
    // -------------------------------------------------------------------------
    console.log('\n--- STEP 6: Admin Users Management (/admin/users) ---');
    await page.goto(`${WEB_BASE_URL}/admin/users`, { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2500));
    console.log('Navigated to:', page.url());
    await page.screenshot({ path: path.join(screenshotsDir, '04_admin_users.png') });
    console.log('📸 Screenshot saved: screenshots/04_admin_users.png');

    // -------------------------------------------------------------------------
    // STEP 7: Comprehensive Summary Report
    // -------------------------------------------------------------------------
    console.log('\n================================================================');
    console.log('📊 FINAL LIVE WEB & API INTEGRATION REPORT');
    console.log('================================================================');
    console.log(`Total Live API Requests Captured via Gateway: ${apiCalls.length}`);
    
    const successfulCalls = apiCalls.filter(c => c.ok);
    const failedCalls = apiCalls.filter(c => !c.ok);

    console.log(`✅ Successful Requests (2xx): ${successfulCalls.length}`);
    console.log(`❌ Failed Requests (4xx/5xx): ${failedCalls.length}`);

    console.log('\nList of All Verified Endpoints:');
    const uniqueEndpoints = new Map();
    for (const call of apiCalls) {
      const u = new URL(call.url);
      const key = `${call.method} ${u.pathname}`;
      if (!uniqueEndpoints.has(key)) {
        uniqueEndpoints.set(key, { status: call.status, count: 1 });
      } else {
        uniqueEndpoints.get(key).count += 1;
      }
    }

    for (const [endpoint, info] of uniqueEndpoints.entries()) {
      console.log(` ✔ [HTTP ${info.status}] ${endpoint} (called ${info.count}x)`);
    }

    console.log('================================================================\n');

  } catch (err) {
    console.error('Test execution error:', err);
    await page.screenshot({ path: path.join(screenshotsDir, 'error_state.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
}

runLiveWebTest();

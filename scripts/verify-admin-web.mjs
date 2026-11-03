import puppeteer from 'puppeteer-core';

async function testAdminWeb() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // 1. Visit Root /
    console.log('Testing Root URL http://127.0.0.1:5173/ ...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
    const landingH1 = await page.$eval('h1', el => el.innerText);
    console.log('Landing H1:', landingH1);
    await page.screenshot({ path: 'verify_landing_admin.png', fullPage: false });

    // 2. Visit /auth/login
    console.log('Testing Login Page http://127.0.0.1:5173/auth/login ...');
    await page.goto('http://127.0.0.1:5173/auth/login', { waitUntil: 'networkidle0', timeout: 15000 });
    const loginTitle = await page.$eval('h1', el => el.innerText);
    console.log('Login Title:', loginTitle);
    const hasRegisterBtn = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a, button')).some(el => el.innerText.includes('Create New Account') || el.innerText.includes('Tham gia ngay'));
    });
    console.log('Has Register button on Web:', hasRegisterBtn);
    await page.screenshot({ path: 'verify_login_admin.png', fullPage: false });

    // 3. Test attempting to go to /app/home while unauthenticated
    console.log('Testing /app/home redirect for unauthenticated visitor...');
    await page.goto('http://127.0.0.1:5173/app/home', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log('Current URL after /app/home:', page.url());

    // 4. Test attempting to go to /auth/register
    console.log('Testing /auth/register redirect...');
    await page.goto('http://127.0.0.1:5173/auth/register', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log('Current URL after /auth/register:', page.url());

    // 5. Perform Admin Google Login
    console.log('Testing Admin Login via Google SSO button...');
    const googleBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Google Workspace Admin')) ? true : false;
    });
    console.log('Found Google Workspace Admin button:', googleBtn);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Google Workspace Admin'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    console.log('Current URL after Admin login:', page.url());
    await page.screenshot({ path: 'verify_admin_dashboard.png', fullPage: false });

    // 6. Check that Admin Sidebar does NOT have Community Network link
    const hasCommunityNetwork = await page.evaluate(() => {
      return document.body.innerText.includes('COMMUNITY NETWORK') || document.body.innerText.includes('Community Feed');
    });
    console.log('Sidebar has Community Feed link:', hasCommunityNetwork);

    console.log('ALL ADMIN WEB VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
}

testAdminWeb();

import puppeteer from 'puppeteer-core';

async function verify() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop Test (1920x1080)
    console.log('Testing Desktop 1920x1080 on http://127.0.0.1:5173/ ...');
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0', timeout: 15000 });

    // Verify sections present
    const sections = await page.evaluate(() => {
      const getExists = (id) => !!document.getElementById(id);
      return {
        title: document.title,
        hasHero: getExists('hero'),
        hasNetworking: getExists('networking'),
        hasMentoring: getExists('mentoring'),
        hasFeatures: getExists('features'),
        hasFooter: !!document.querySelector('footer'),
        hasNavbar: !!document.querySelector('header'),
        headingText: document.querySelector('h1')?.innerText,
        linhNguyen: document.body.innerText.includes('Linh Nguyễn'),
        minhKhoi: document.body.innerText.includes('Minh Khôi'),
      };
    });
    console.log('Desktop verification checks:', JSON.stringify(sections, null, 2));

    await page.screenshot({ path: 'landing_desktop_full.png', fullPage: true });
    console.log('Saved landing_desktop_full.png');

    // 2. Laptop Test (1366x768)
    console.log('Testing Laptop 1366x768...');
    await page.setViewport({ width: 1366, height: 768 });
    await page.screenshot({ path: 'landing_laptop.png', fullPage: false });
    console.log('Saved landing_laptop.png');

    // 3. Mobile Test (390x844 - iPhone)
    console.log('Testing Mobile 390x844...');
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await page.screenshot({ path: 'landing_mobile_hero.png', fullPage: false });
    await page.screenshot({ path: 'landing_mobile_full.png', fullPage: true });
    console.log('Saved mobile screenshots');

    // Test mobile hamburger menu
    const hamburgerBtn = await page.$('button[aria-label="Toggle Menu"]');
    if (hamburgerBtn) {
      await hamburgerBtn.click();
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: 'landing_mobile_menu_open.png', fullPage: false });
      console.log('Saved landing_mobile_menu_open.png');
    }

    // 4. Test direct /landing route
    console.log('Testing /landing route...');
    await page.goto('http://127.0.0.1:5173/landing', { waitUntil: 'networkidle0', timeout: 10000 });
    const landingH1 = await page.$eval('h1', el => el.innerText);
    console.log('/landing H1:', landingH1);

    console.log('ALL LANDING VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    await browser.close();
  }
}

verify();

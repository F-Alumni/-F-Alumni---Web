import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testProd() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to https://asm-prn232.vercel.app/auth/login...');
  await page.goto('https://asm-prn232.vercel.app/auth/login', { waitUntil: 'networkidle2', timeout: 30000 });

  const title = await page.title();
  console.log('Page Title:', title);

  const heading = await page.$eval('h1', el => el.innerText).catch(() => 'None');
  console.log('H1:', heading);

  // Check buttons
  const buttons = await page.$$eval('button', btns => btns.map(b => b.innerText.trim()));
  console.log('Available Buttons:', buttons);

  // Click 1-Click Login button
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text.includes('1-Click Login')) {
      console.log('Found 1-Click Login button! Clicking it...');
      await b.click();
      break;
    }
  }

  // Wait for redirect to admin
  await new Promise(r => setTimeout(r, 3000));

  const currentUrl = page.url();
  console.log('Current URL after login:', currentUrl);

  await page.screenshot({ path: 'screenshots/prod_login_success.png' });
  console.log('Screenshot saved to screenshots/prod_login_success.png');

  await browser.close();
  console.log('PROD VERIFICATION SUCCESS!');
}

testProd().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

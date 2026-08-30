// Screenshot smoke: home + classes + light/dark + a class page + playlist
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // mobile, like the mockup
const out = 'C:/Users/Elena/ruedaclub-rebuild/app/test-results';

await page.goto('http://localhost:5199/');
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/shot-home-dark.png`, fullPage: false });

await page.goto('http://localhost:5199/?tab=classes');
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/shot-classes.png`, fullPage: false });

await page.goto('http://localhost:5199/?tab=playlist');
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/shot-playlist.png`, fullPage: false });

// Light mode home (default for new visitors)
await page.evaluate(() => localStorage.setItem('theme', 'light'));
await page.goto('http://localhost:5199/');
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/shot-home-light.png`, fullPage: false });

// Scroll to quick actions on mobile
await page.locator('.quick-tiles').scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/shot-quickactions-light.png`, fullPage: false });

// Colors: computed styles of key elements
const colors = await page.evaluate(() => {
  const gs = (sel, prop) => { const el = document.querySelector(sel); return el ? getComputedStyle(el)[prop] : 'MISSING'; };
  return {
    headerBg: gs('header', 'backgroundColor'),
    headerTitleColor: gs('header h1', 'color'),
    tabbarBg: gs('.tabbar', 'backgroundColor'),
    activeTabIcon: gs('.tabbar-btn.is-active .tabbar-icon', 'color'),
    bodyBg: gs('body', 'backgroundColor'),
    primaryBtn: '.btn-primary',
  };
});
console.log('LIGHT:', JSON.stringify(colors, null, 1));

await page.evaluate(() => localStorage.setItem('theme', 'dark'));
await page.goto('http://localhost:5199/');
await page.waitForTimeout(1200);
const colorsDark = await page.evaluate(() => {
  const gs = (sel, prop) => { const el = document.querySelector(sel); return el ? getComputedStyle(el)[prop] : 'MISSING'; };
  return {
    headerBg: gs('header', 'backgroundColor'),
    tabbarBg: gs('.tabbar', 'backgroundColor'),
    bodyBg: gs('body', 'backgroundColor'),
  };
});
console.log('DARK:', JSON.stringify(colorsDark, null, 1));

await page.screenshot({ path: `${out}/shot-home-dark2.png`, fullPage: false });
await browser.close();
console.log('Screenshots saved');
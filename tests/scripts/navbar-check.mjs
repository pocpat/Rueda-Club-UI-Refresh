// Navbar-only check: screenshot + layout asserts + drawer interaction
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:5199/');
await page.waitForTimeout(1200);

const m = await page.evaluate(() => {
  const r = (sel) => { const el = document.querySelector(sel); if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), w: Math.round(b.width), cx: Math.round(b.x + b.width / 2), bg: getComputedStyle(el).backgroundColor || getComputedStyle(el).backgroundImage.slice(0, 60) }; };
  return {
    header: r('header'),
    hamburger: r('.hamburger-btn'),
    logo: r('.sign-img'),
    toggle: r('.navbar-theme-btn'),
    lines: document.querySelectorAll('.hamburger-line').length,
  };
});
console.log(JSON.stringify(m, null, 1));

const vw = 390;
const centered = Math.abs(m.logo.cx - vw / 2) < 20;
const hamLeft = m.hamburger.x < 40;
const toggleRight = m.toggle.x + m.toggle.w > vw - 60;
console.log(`centered=${centered} hamLeft=${hamLeft} toggleRight=${toggleRight} lines=${m.lines}`);

// open drawer, screenshot, click Classes
await page.click('.hamburger-btn');
await page.waitForTimeout(500);
await page.screenshot({ path: 'C:/Users/Elena/ruedaclub-rebuild/app/test-results/shot-navbar-drawer.png' });
await page.click('.drawer >> text=Classes');
await page.waitForTimeout(500);
console.log('url after drawer click:', page.url());

await page.goto('http://localhost:5199/');
await page.evaluate(() => localStorage.setItem('theme', 'light'));
await page.goto('http://localhost:5199/');
await page.waitForTimeout(1000);
await page.screenshot({ path: 'C:/Users/Elena/ruedaclub-rebuild/app/test-results/shot-navbar-light.png' });
await browser.close();
console.log('done');
// Navbar swap check: mobile = theme left + hamburger right, drawer slides from right; desktop unchanged
import { chromium } from '@playwright/test';

const browser = await chromium.launch();

// Mobile
let p = await browser.newPage({ viewport: { width: 390, height: 844 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/');
await p.waitForTimeout(1100);
let m = await p.evaluate(() => {
  const t = document.querySelector('.navbar-theme-btn').getBoundingClientRect();
  const h = document.querySelector('.hamburger-btn').getBoundingClientRect();
  const logo = document.querySelector('.sign-img').getBoundingClientRect();
  return {
    themeLeft: t.x < 60,
    hamburgerRight: h.x + h.width > 390 - 60,
    logoCentered: Math.abs((logo.x + logo.width / 2) - 195) < 12,
  };
});
console.log('MOBILE positions:', JSON.stringify(m));

// open drawer, check it slides from RIGHT
await p.click('.hamburger-btn');
await p.waitForTimeout(500);
m = await p.evaluate(() => {
  const d = document.querySelector('.drawer').getBoundingClientRect();
  return { drawerAtRight: Math.abs(d.x + d.width - 390) < 2, drawerLeft: d.x };
});
console.log('MOBILE drawer:', JSON.stringify(m));
await p.screenshot({ path: 'C:/Users/Elena/ruedaclub-rebuild/app/test-results/shot-drawer-right.png' });
await p.close();

// Desktop unchanged
p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:5199/');
await p.waitForTimeout(1000);
m = await p.evaluate(() => {
  const t = document.querySelector('.navbar-theme-btn').getBoundingClientRect();
  const h = document.querySelector('.hamburger-btn').getBoundingClientRect();
  return { themeLeft: t.x < 80, hamburgerRight: h.x + h.width > 1280 - 80 };
});
console.log('DESKTOP positions:', JSON.stringify(m));
await p.click('.hamburger-btn');
await p.waitForTimeout(500);
m = await p.evaluate(() => {
  const d = document.querySelector('.drawer').getBoundingClientRect();
  return { drawerAtLeft: d.x < 2 };
});
console.log('DESKTOP drawer:', JSON.stringify(m));
await p.close();

await browser.close();
console.log('done');
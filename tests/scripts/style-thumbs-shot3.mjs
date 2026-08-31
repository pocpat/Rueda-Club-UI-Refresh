// Full-page screenshot of the tiles grid (tall viewport, both rows fully visible)
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1400 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/');
await p.waitForTimeout(1500);
const tile = await p.evaluate(() => {
  const el = document.querySelector('.home-tiles');
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, height: r.height };
});
await p.evaluate((t) => window.scrollTo(0, t.top - 10), tile);
await p.waitForTimeout(400);
await p.screenshot({ path: 'test-results/style-thumbs-full2.png', fullPage: false });
console.log(JSON.stringify(tile));
await browser.close();
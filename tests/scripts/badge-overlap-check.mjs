// Measure badge vs OPEN button overlap precisely
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1400 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/');
await p.waitForTimeout(1200);
const out = await p.evaluate(() => {
  return [...document.querySelectorAll('.home-tile-style')].map((t) => {
    const badge = t.querySelector('.home-tile-count').getBoundingClientRect();
    const btn = t.querySelector('.tile-btn').getBoundingClientRect();
    const title = t.querySelector('.home-tile-title').textContent;
    const overlap = badge.right > btn.left && badge.left < btn.right
      && badge.bottom > btn.top && badge.top < btn.bottom;
    return {
      title,
      badgeRight: Math.round(badge.right),
      btnLeft: Math.round(btn.left),
      gapPx: Math.round(btn.left - badge.right),
      overlap,
      btnWidthPct: Math.round((btn.width / t.getBoundingClientRect().width) * 100),
    };
  });
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
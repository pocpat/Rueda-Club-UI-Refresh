// Verify each level accordion is its own white card with grey gaps between them
import { chromium } from '@playwright/test';
import fs from 'fs';
import { PNG } from 'pngjs';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
await p.goto('http://localhost:5199/?style=style-rueda-de-casino');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/?style=style-rueda-de-casino');
await p.waitForTimeout(1200);

const wraps = await p.evaluate(() => {
  return [...document.querySelectorAll('.level-acc-wrap')].map((w) => {
    const r = w.getBoundingClientRect();
    const cs = getComputedStyle(w);
    const badge = w.querySelector('.level-acc-count');
    const bcs = badge ? getComputedStyle(badge) : null;
    return {
      top: Math.round(r.top + window.scrollY),
      bottom: Math.round(r.bottom + window.scrollY),
      bg: cs.backgroundColor,
      radius: cs.borderRadius,
      badgeBg: bcs?.backgroundColor,
    };
  });
});

// pixel check between consecutive cards: expect grey page bg (not white)
const buf = await p.screenshot({ fullPage: true });
fs.writeFileSync('test-results/classpage-v4.png', buf);
const png = PNG.sync.read(buf);
const gaps = [];
for (let i = 0; i < wraps.length - 1; i++) {
  const y = Math.floor((wraps[i].bottom + wraps[i + 1].top) / 2);
  const x = 400;
  const idx = (png.width * y + x) << 2;
  gaps.push([png.data[idx], png.data[idx + 1], png.data[idx + 2]]);
}
const bodyBg = await p.evaluate(() => getComputedStyle(document.querySelector('.app-sheet')).backgroundColor.match(/\d+/g).map(Number).slice(0, 3));

await p.click('.level-acc-btn');
await p.waitForTimeout(700);
await p.screenshot({ path: 'test-results/classpage-v4-open.png' });

console.log(JSON.stringify({
  cardBg: wraps[0]?.bg,
  cards: wraps.length,
  betweenGaps: gaps,
  pageBg: bodyBg,
  gapIsGrey: gaps.every((g) => Math.abs(g[0] - bodyBg[0]) < 8 && Math.abs(g[1] - bodyBg[1]) < 8 && Math.abs(g[2] - bodyBg[2]) < 8),
}, null, 1));
await browser.close();
// Measure style tile thumbnails: image vs card vs figure bounds, look for clipping
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/');
await p.waitForTimeout(1200);
const r = await p.evaluate(() => {
  return [...document.querySelectorAll('.home-tile-style')].map((t) => {
    const tr = t.getBoundingClientRect();
    const fig = t.querySelector('.home-tile-figure')?.getBoundingClientRect();
    const img = t.querySelector('.home-tile-style-thumb')?.getBoundingClientRect();
    return {
      title: t.querySelector('.home-tile-title')?.textContent,
      cardW: Math.round(tr.width),
      cardPad: getComputedStyle(t).padding,
      figW: fig ? Math.round(fig.width) : null,
      figLeftInset: fig ? Math.round(fig.left - tr.left) : null,
      imgW: img ? Math.round(img.width) : null,
    };
  });
});
console.log(JSON.stringify(r, null, 1));
await b.close();
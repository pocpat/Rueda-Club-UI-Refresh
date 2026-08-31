// Verify style tile thumbnails + video count badges
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/');
await p.waitForTimeout(1500);
const out = await p.evaluate(() => {
  const tiles = [...document.querySelectorAll('.home-tile-style')];
  return tiles.map((t) => {
    const img = t.querySelector('.home-tile-style-thumb');
    const count = t.querySelector('.home-tile-count');
    const title = t.querySelector('.home-tile-title');
    const tr = count?.getBoundingClientRect();
    const ir = t.getBoundingClientRect();
    return {
      title: title?.textContent,
      imgLoaded: img ? (img.complete && img.naturalWidth > 0) : false,
      imgSrc: img?.getAttribute('src'),
      count: count?.textContent || null,
      countPos: tr ? { left: Math.round(tr.left - ir.left), bottomOffset: Math.round(ir.bottom - tr.bottom) } : null,
      titleVisible: title && getComputedStyle(title).display !== 'none',
    };
  });
});
await p.screenshot({ path: 'test-results/style-thumbs-desktop.png' });
await p.evaluate(() => window.scrollBy(0, 260));
await p.waitForTimeout(400);
await p.screenshot({ path: 'test-results/style-thumbs-desktop-scrolled.png' });
console.log(JSON.stringify(out, null, 1));
await browser.close();
// Verify style-tile thumbnails are the SAME treated size as the MOTD thumbnail
// (both in-flow 16:9 blocks with rounded corners inside tile padding)
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1400 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/');
await p.waitForTimeout(1500);
const out = await p.evaluate(() => {
  const r = (el) => el.getBoundingClientRect();
  const motdFig = document.querySelector('.home-tile-motd .home-tile-thumb');
  const styleFigs = [...document.querySelectorAll('.home-tile-style')].map((t) => {
    const fig = t.querySelector('.home-tile-figure');
    const img = t.querySelector('.home-tile-style-thumb');
    const badge = t.querySelector('.home-tile-count');
    const fr = fig.getBoundingClientRect();
    const tr = t.getBoundingClientRect();
    const badgeOverlap = badge && badge.getBoundingClientRect().right > fr.right - 4;
    return {
      title: t.querySelector('.home-tile-title').textContent,
      imgLoaded: img.complete && img.naturalWidth > 0,
      figW: Math.round(fr.width),
      figH: Math.round(fr.height),
      aspect: Math.round((fr.width / fr.height) * 100) / 100,
      badgeInsideFigure: (() => { if (!badge) return null; const b = badge.getBoundingClientRect(); return b.left >= fr.left && b.right <= fr.right && b.bottom <= fr.bottom; })(),
    };
  });
  const mr = r(motdFig);
  return {
    motdFig: { w: Math.round(mr.width), h: Math.round(mr.height), aspect: Math.round((mr.width / mr.height) * 100) / 100 },
    styleFigs,
  };
});
await p.evaluate(() => document.querySelector('.home-tiles')?.scrollIntoView({ block: 'start' }));
await p.waitForTimeout(400);
await p.screenshot({ path: 'test-results/style-thumbs-full3.png' });
console.log(JSON.stringify(out, null, 1));
await browser.close();
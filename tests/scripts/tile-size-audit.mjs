// Measure all 4 tile sizes across widths to find inconsistencies
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const out = {};
for (const w of [390, 480, 587, 640, 800, 1024, 1280]) {
  const p = await browser.newPage({ viewport: { width: w, height: 1430 } });
  await p.goto('http://localhost:5199/');
  await p.evaluate(() => localStorage.setItem('theme', 'light'));
  await p.goto('http://localhost:5199/');
  await p.waitForTimeout(900);
  out[w] = await p.evaluate(() => {
    const tiles = [...document.querySelectorAll('.home-tile')];
    return tiles.map((t) => ({
      name: (t.querySelector('.home-tile-heading, .home-tile-title')?.textContent || '').slice(0, 18),
      w: Math.round(t.getBoundingClientRect().width),
      h: Math.round(t.getBoundingClientRect().height),
    }));
  });
  await p.close();
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
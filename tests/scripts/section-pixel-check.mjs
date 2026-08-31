// Pixel-level check: is the area between level-1 header and level-2 header white (one section) or grey (separate cards)?
import { chromium } from '@playwright/test';
import fs from 'fs';
import { PNG } from 'pngjs';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
await p.goto('http://localhost:5199/?style=style-rueda-de-casino');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/?style=style-rueda-de-casino');
await p.waitForTimeout(1200);
const rows = await p.evaluate(() => {
  const accs = [...document.querySelectorAll('.level-acc-btn')];
  return accs.slice(0, 3).map((a) => {
    const r = a.getBoundingClientRect();
    return { name: a.querySelector('.level-acc-title')?.textContent, top: Math.round(r.top + window.scrollY), bottom: Math.round(r.bottom + window.scrollY) };
  });
});
const buf = await p.screenshot({ fullPage: true });
fs.writeFileSync('test-results/classpage-full.png', buf);
const png = PNG.sync.read(buf);
// sample middle x between row0.bottom and row1.top
const gapYs = [];
const y0 = rows[0].bottom + 2, y1 = rows[1].top - 2;
for (let y = y0; y <= y1 && y < png.height; y++) {
  // x: middle of the page body
  const x = 400;
  const idx = (png.width * y + x) << 2;
  gapYs.push([png.data[idx], png.data[idx + 1], png.data[idx + 2]]);
}
const whiteish = gapYs.filter(([r, g, b]) => r > 240 && g > 240 && b > 240).length;
const greyish = gapYs.filter(([r, g, b]) => r < 245 && g < 245 && b < 245).length;
console.log(JSON.stringify({
  rows,
  samples: gapYs.length,
  whiteish, greyish,
  verdict: whiteish > greyish ? 'ONE_WHITE_SECTION' : 'GREY_GAP_SEPARATE_CARDS',
  firstSamples: gapYs.slice(0, 3), lastSamples: gapYs.slice(-3),
}, null, 1));
await browser.close();
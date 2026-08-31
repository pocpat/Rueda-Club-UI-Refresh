// Measure figure box ratio at multiple widths to see how much horizontal crop occurs
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const out = {};
for (const w of [390, 480, 587, 640, 800, 1280]) {
  const p = await b.newPage({ viewport: { width: w, height: 1430 } });
  await p.goto('http://localhost:5199/');
  await p.evaluate(() => localStorage.setItem('theme', 'light'));
  await p.goto('http://localhost:5199/');
  await p.waitForTimeout(900);
  out[w] = await p.evaluate(() => {
    const t = [...document.querySelectorAll('.home-tile-style')][0];
    const fig = t.querySelector('.home-tile-figure').getBoundingClientRect();
    const ratio = fig.width / fig.height;
    // image is 1.792; crop% each side = (1.792 - min(ratio,1.792)) / (2*1.792)
    const cropEachSide = ratio < 1.792 ? (1 - ratio / 1.792) / 2 * 100 : 0;
    return { figW: Math.round(fig.width), figH: Math.round(fig.height), boxRatio: Math.round(ratio * 1000) / 1000, cropEachSidePct: Math.round(cropEachSide * 100) / 100 };
  });
  await p.close();
}
console.log(JSON.stringify(out, null, 1));
await b.close();
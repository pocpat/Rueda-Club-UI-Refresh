// Measure crop % per side at key widths
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const out = {};
for (const w of [480, 587, 1280]) {
  const p = await b.newPage({ viewport: { width: w, height: 1430 } });
  await p.goto('http://localhost:5199/');
  await p.evaluate(() => localStorage.setItem('theme', 'light'));
  await p.goto('http://localhost:5199/');
  await p.waitForTimeout(900);
  out[w] = await p.evaluate(() => {
    const t = [...document.querySelectorAll('.home-tile-style')][0];
    const fig = t.querySelector('.home-tile-figure').getBoundingClientRect();
    const ratio = fig.width / fig.height;
    const imgRatio = 1376 / 768;
    let cropSidesPct = 0;
    let cropTBPct = 0;
    if (ratio < imgRatio) {
      cropSidesPct = Math.round((1 - ratio / imgRatio) / 2 * 10000) / 100;
    } else {
      cropTBPct = Math.round((1 - imgRatio / ratio) / 2 * 10000) / 100;
    }
    return { figW: Math.round(fig.width), figH: Math.round(fig.height), ratio: Math.round(ratio * 100) / 100, cropSidesPct, cropTBPct };
  });
  await p.close();
}
console.log(JSON.stringify(out, null, 1));
await b.close();
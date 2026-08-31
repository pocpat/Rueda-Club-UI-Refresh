// Screenshot + overflow check at the two reported problem sizes
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
for (const [w, h, label] of [[800, 1430, '800w'], [587, 1430, '587w']]) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.goto('http://localhost:5199/');
  await p.evaluate(() => localStorage.setItem('theme', 'light'));
  await p.goto('http://localhost:5199/');
  await p.waitForTimeout(1000);
  const info = await p.evaluate(() => {
    const tiles = [...document.querySelectorAll('.home-tile')];
    let clipped = [];
    tiles.forEach((t) => {
      const name = t.querySelector('.home-tile-heading, .home-tile-title')?.textContent;

      // button visible & inside?
      const btn = t.querySelector('.tile-btn').getBoundingClientRect();
      const tr = t.getBoundingClientRect();
      if (btn.bottom > tr.bottom - 2) clipped.push(`${name}: button out`);

      // thumb/figure clipped badly? (some crop OK — object-fit)
      const desc = t.querySelector('.home-tile-desc');
      if (desc) {
        const dr = desc.getBoundingClientRect();
        if (dr.height <= 0) clipped.push(`${name}: desc zero`);
      }
    });
    return { clipped, sizes: tiles.map((t) => Math.round(t.getBoundingClientRect().height)) };
  });
  await p.evaluate(() => document.querySelector('.home-tiles')?.scrollIntoView({ block: 'start' }));
  await p.waitForTimeout(300);
  await p.screenshot({ path: `test-results/equal-tiles-${label}.png` });
  console.log(label, JSON.stringify(info));
  await p.close();
}
await browser.close();
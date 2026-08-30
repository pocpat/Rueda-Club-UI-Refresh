// Mobile heading centering check for MOTD tile
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/');
await p.waitForTimeout(800);
const r = await p.evaluate(() => {
  const t = document.querySelector('.home-tile-motd');
  const h = t.querySelector('.home-tile-heading');
  const tr = h.getBoundingClientRect(), tir = t.getBoundingClientRect();
  const off = (tr.left + tr.right) / 2 - (tir.left + tir.right) / 2;
  return { headingCenterOffsetPx: Math.round(off * 10) / 10, hFont: getComputedStyle(h).fontSize };
});
console.log(JSON.stringify(r));
await b.close();
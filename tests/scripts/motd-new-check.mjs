// Verify MOTD tile structure: heading -> thumb -> video title -> desc -> level -> VIEW
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const out = {};

// Desktop
let p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/');
await p.waitForTimeout(1200);
out.desktop = await p.evaluate(() => {
  const tile = document.querySelector('.home-tile-motd');
  if (!tile) return null;
  const parts = [...tile.children].map((el) => ({
    cls: el.className,
    text: (el.textContent || '').trim().slice(0, 60),
    tag: el.tagName.toLowerCase(),
  }));
  const cs = getComputedStyle(tile.querySelector('.home-tile-heading'));
  return { parts, headingFont: cs.fontSize, headingWeight: cs.fontWeight, tileH: tile.offsetHeight };
});
await p.screenshot({ path: 'test-results/shot-motd-new-desktop.png' });

// Mobile
const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
await m.goto('http://localhost:5199/');
await m.evaluate(() => localStorage.setItem('theme', 'light'));
await m.goto('http://localhost:5199/');
await m.waitForTimeout(1200);
out.mobile = await m.evaluate(() => {
  const tile = document.querySelector('.home-tile-motd');
  if (!tile) return null;
  return [...tile.children].map((el) => el.className + ': ' + (el.textContent || '').trim().slice(0, 40));
});
await m.screenshot({ path: 'test-results/shot-motd-new-mobile.png' });

console.log(JSON.stringify(out, null, 1));
await browser.close();
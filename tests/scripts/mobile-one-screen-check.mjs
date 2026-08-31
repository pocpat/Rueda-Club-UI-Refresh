// Verify: on phones, hero hidden, tiles+QA fit one screen (no scroll)
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/');
await p.waitForTimeout(1200);
const r = await p.evaluate(() => {
  const vh = window.innerHeight;
  const hero = document.querySelector('.home-hero');
  const heroStyle = hero ? getComputedStyle(hero).display : 'no-hero-el';
  const qa = document.querySelector('.qa-row')?.getBoundingClientRect();
  const tiles = document.querySelector('.home-tiles')?.getBoundingClientRect();
  return {
    heroDisplay: heroStyle,
    viewportH: vh,
    quickActionsBottom: qa ? Math.round(qa.bottom) : null,
    tilesBottom: tiles ? Math.round(tiles.bottom) : null,
    fitsOneScreen: qa ? qa.bottom <= vh : false,
    scrollHeight: document.documentElement.scrollHeight,
    scrollNeeded: document.documentElement.scrollHeight > vh,
  };
});
await p.screenshot({ path: 'C:/Users/Elena/ruedaclub-rebuild/app/test-results/mobile-noscroll.png' });

// Desktop unchanged
const d = await b.newPage({ viewport: { width: 1280, height: 1000 } });
await d.goto('http://localhost:5199/');
await d.waitForTimeout(900);
const r2 = await d.evaluate(() => {
  const hero = document.querySelector('.home-hero');
  return { heroVisibleDesktop: hero && getComputedStyle(hero).display !== 'none' };
});
console.log(JSON.stringify({ mobile: r, desktop: r2 }, null, 1));
await b.close();
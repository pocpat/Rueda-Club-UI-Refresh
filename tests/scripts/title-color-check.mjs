// Verify all page titles use the same dark blue (--accent-2 / #2E5FA3 in light mode)
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 800, height: 900 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));

const pages = [
  ['home', '/'],
  ['search', '/?tab=classes'],
  ['levels', '/?tab=levels'],
  ['playlist', '/?tab=playlist'],
  ['community', '/?tab=community'],
  ['favorites', '/?tab=favorites'],
  ['classPage', '/?style=style-son-cubano'],
];
const expected = 'rgb(46, 95, 163)';
const results = {};
for (const [name, url] of pages) {
  await p.goto('http://localhost:5199' + url);
  await p.waitForTimeout(700);
  const color = await p.evaluate(() => {
    const h = document.querySelector('main h2, main .style-tile-btn span[class*="font-extrabold"]');
    return h ? getComputedStyle(h).color : 'NO TITLE';
  });
  results[name] = { color, match: color === expected };
}
console.log(JSON.stringify(results, null, 1));
console.log('ALL SAME BLUE:', Object.values(results).every((r) => r.match));
await browser.close();
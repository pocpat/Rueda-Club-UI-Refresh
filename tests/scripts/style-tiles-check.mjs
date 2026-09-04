// Style tile check on Search page: old orbit/glass gone, new clean card present
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
await p.goto('http://localhost:5199/?tab=classes');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/?tab=classes');
await p.waitForTimeout(1200);

const m = await p.evaluate(() => {
  const oldOrbits = document.querySelectorAll('.style-card-orbits, .style-orbit, .style-card-glass').length;
  const tiles = [...document.querySelectorAll('.style-tile-btn')];
  const names = tiles.map((t) => t.querySelector('span:nth-of-type(1)') ? t.innerText.split('\n')[0] : '');
  return {
    oldOrbitCards: oldOrbits,
    newTiles: tiles.length,
    names: tiles.map((t) => t.innerText.replace(/\n+/g, ' | ').slice(0, 80)),
    wholeCardClickable: tiles.every((t) => t.tagName === 'BUTTON'),
  };
});
console.log(JSON.stringify(m, null, 1));

// Click Rueda de Casino card -> opens class page
await p.locator('.style-tile-btn').first().click();
await p.waitForTimeout(600);
console.log('click navigates:', p.url().includes('?style=style-rueda-de-casino'));
await p.goBack();
await p.waitForTimeout(600);
await p.locator('.style-tile-btn').first().scrollIntoViewIfNeeded();
await p.waitForTimeout(400);
await p.screenshot({ path: 'C:/Users/Elena/ruedaclub-rebuild/app/test-results/shot-style-tiles.png' });
await browser.close();
console.log('done');
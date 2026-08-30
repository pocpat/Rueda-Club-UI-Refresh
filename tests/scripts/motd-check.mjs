// Move-of-the-day tile check: thumbnail, kicker/title, desc, button pinned bottom
import { chromium } from '@playwright/test';

const browser = await chromium.launch();

// Desktop
let p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/');
await p.waitForTimeout(1500);
let m = await p.evaluate(() => {
  const tile = document.querySelectorAll('.home-tile')[0];
  const img = tile.querySelector('.home-tile-thumb');
  const desc = tile.querySelector('.home-tile-desc');
  const btn = tile.querySelector('.tile-btn').getBoundingClientRect();
  const tileR = tile.getBoundingClientRect();
  const others = [...document.querySelectorAll('.home-tile')].slice(1).map((t) => {
    const b2 = t.querySelector('.tile-btn').getBoundingClientRect();
    const tr = t.getBoundingClientRect();
    return Math.abs(b2.bottom - tr.bottom + 16) < 3;
  });
  return {
    kicker: tile.querySelector('.home-tile-kicker')?.textContent,
    title: tile.querySelector('.home-tile-title')?.textContent,
    imgLoaded: img ? img.complete && img.naturalWidth > 0 : false,
    descVisible: !!desc && desc.offsetHeight > 0,
    descText: desc?.textContent.slice(0, 60),
    btnAtBottom: Math.abs(btn.bottom - tileR.bottom + 16) < 4,
    othersBtnBottom: others,
  };
});
console.log('DESKTOP', JSON.stringify(m, null, 1));
await p.screenshot({ path: 'C:/Users/Elena/ruedaclub-rebuild/app/test-results/shot-motd-desktop.png' });
await p.close();

// Mobile
p = await browser.newPage({ viewport: { width: 390, height: 844 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/');
await p.waitForTimeout(1200);
m = await p.evaluate(() => {
  const tile = document.querySelector('.home-tile');
  const img = tile.querySelector('.home-tile-thumb');
  return {
    thumbDisplay: img ? getComputedStyle(img).display : 'no-img',
    titleDisplay: getComputedStyle(tile.querySelector('.home-tile-title')).display,
    kickerColor: getComputedStyle(tile.querySelector('.home-tile-kicker')).color,
    btnVisible: tile.querySelector('.tile-btn').getBoundingClientRect().height > 0,
  };
});
console.log('MOBILE', JSON.stringify(m));
await p.screenshot({ path: 'C:/Users/Elena/ruedaclub-rebuild/app/test-results/shot-motd-mobile.png' });

// Documentary exclusion check: reload home many times, ensure View never opens a Documentary lesson
p = await browser.newPage({ viewport: { width: 800, height: 900 } });
const docs = new Set();
for (let i = 0; i < 12; i++) {
  await p.goto('http://localhost:5199/?cachebust=' + i);
  await p.waitForTimeout(500);
  const name = await p.evaluate(() => document.querySelector('.home-tile .home-tile-title')?.textContent || '');
  // check the style of the move via data lookup in page context
  const isDoc = await p.evaluate((nm) => {
    return fetch('/src/data.json').then((r) => r.json()).then((d) => {
      const mv = d.moves.find((x) => x.name === nm);
      if (!mv) return 'unknown';
      const lvl = d.levels.find((l) => l.id === mv.levelId);
      return lvl?.styleId === 'style-documentary';
    });
  }, name);
  if (isDoc === true) docs.add(name);
}
console.log('docLessonsShown:', docs.size, [...docs]);
await browser.close();
console.log('done');
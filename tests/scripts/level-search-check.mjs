// Verify level badge on MOTD tile + Search quick action
import { chromium } from '@playwright/test';
import { readFileSync } from 'fs';

const d = JSON.parse(readFileSync('C:/Users/Elena/ruedaclub-rebuild/app/src/data.json', 'utf-8'));
const styles = Object.fromEntries(d.styles.map((s) => [s.id, s]));
const levels = Object.fromEntries(d.levels.map((l) => [l.id, l]));
const shortStyle = (sid) => styles[sid]?.name.split(' ')[0];

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// check the level badge across several daily picks (different loads)
const seen = [];
for (let i = 0; i < 8; i++) {
  await p.goto('http://localhost:5199/?v=' + i);
  await p.evaluate(() => localStorage.setItem('theme', 'light'));
  await p.goto('http://localhost:5199/?v=' + i);
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => ({
    title: document.querySelector('.home-tile .home-tile-title')?.textContent,
    level: document.querySelector('.home-tile .home-tile-level')?.textContent || null,
  }));
  const mv = d.moves.find((m) => m.name === r.title);
  const lvl = mv ? levels[mv.levelId] : null;
  const expected = lvl ? `${shortStyle(lvl.styleId)} ${lvl.name}` : null;
  seen.push({ title: r.title, shown: r.level, expected, ok: r.level === expected });
}
console.log(JSON.stringify(seen, null, 1));
console.log('all labels correct:', seen.every((s) => s.ok && s.shown !== null));

// Search tile test
await p.goto('http://localhost:5199/');
await p.waitForTimeout(600);
await p.getByRole('button', { name: 'Search' }).click();
await p.waitForTimeout(800);
const searchState = await p.evaluate(() => ({
  url: location.search.includes('tab=classes'),
  focused: document.activeElement?.id === 'move-search',
  hasMagnifier: !!document.querySelector('#move-search'),
}));
console.log('SEARCH', JSON.stringify(searchState));
await browser.close();
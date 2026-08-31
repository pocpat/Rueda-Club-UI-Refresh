// Verify: level chips now on Classes tab under search input (filterable), gone from Home
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1100 } });

// Home: chips must be gone
await p.goto('http://localhost:5199/?tab=home');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/?tab=home');
await p.waitForTimeout(900);
const home = await p.evaluate(() => ({
  chipsOnHome: document.querySelectorAll('.level-chip').length,
  qaLabels: [...document.querySelectorAll('.qa-label')].map((x) => x.textContent),
}));

// Classes tab: chips under search input, filters work
await p.goto('http://localhost:5199/?tab=classes');
await p.waitForTimeout(900);
await p.click('#move-search');
await p.type('#move-search', 'a');
await p.waitForTimeout(300);
const before = await p.evaluate(() => document.querySelectorAll('[role="listbox"] [role="option"]').length);
// filter to Foundations only
await p.click('.filter-chip:has-text("Foundations")');
await p.evaluate(() => document.getElementById('move-search').focus());
await p.fill('#move-search', 'a');
await p.waitForTimeout(300);
const after = await p.evaluate(() => {
  const opts = [...document.querySelectorAll('[role="listbox"] [role="option"]')];
  const badges = opts.map((o) => o.textContent.match(/Foundations|Beginner|Improver|Intermediate|Advanced|Son|Documentary/g)?.slice(0, 2).join('·')).filter(Boolean);
  return { count: opts.length, badges: [...new Set(badges)].slice(0, 5) };
});
await p.click('.filter-chip.is-active'); // deselect
await p.waitForTimeout(200);

await p.screenshot({ path: 'test-results/search-chips.png' });
await p.fill('#move-search', '');
await p.evaluate(() => document.querySelector('.level-chips')?.scrollIntoView({ block: 'center' }));
await p.waitForTimeout(300);
await p.screenshot({ path: 'test-results/search-chips-plain.png' });

const chipCount = await p.evaluate(() => [...document.querySelectorAll('.filter-chip')].map((c) => c.textContent.trim()));
console.log(JSON.stringify({ home, beforeCount: before, afterFilter: after, chips: chipCount }, null, 1));
await browser.close();
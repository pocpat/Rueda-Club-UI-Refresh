// Fresh screenshot of tile area with level badge + quick actions
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/');
await p.waitForTimeout(1500);
const check = await p.evaluate(() => ({
  levelBadge: document.querySelector('.home-tile .home-tile-level')?.textContent,
  qaLabels: [...document.querySelectorAll('.qa-label')].map((x) => x.textContent),
}));
console.log(JSON.stringify(check));
await p.screenshot({ path: 'C:/Users/Elena/ruedaclub-rebuild/app/test-results/shot-level-badge.png', fullPage: false });
await p.evaluate(() => document.querySelector('.qa-row')?.scrollIntoView({ block: 'center' }));
await p.waitForTimeout(500);
await p.screenshot({ path: 'C:/Users/Elena/ruedaclub-rebuild/app/test-results/shot-qa-search.png' });
await browser.close();
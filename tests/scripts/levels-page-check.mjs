// Verify: dashboard order Search→Play music→Level; Level opens grouped Levels page
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1100 } });

await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/?tab=home');
await p.waitForTimeout(1000);
const home = await p.evaluate(() => ({
  order: [...document.querySelectorAll('.qa-label')].map((x) => x.textContent),
}));

// Click the Level circle → should land on ?tab=levels
await p.click('.qa-btn[aria-label="Level"]');
await p.waitForTimeout(700);
const url = p.url();

const levels = await p.evaluate(() => {
  const title = document.querySelector('.class-page-head h2')?.textContent;
  const sections = [...document.querySelectorAll('.level-acc-wrap')].map((s) => {
    const name = s.querySelector('.level-acc-title')?.textContent;
    const count = s.querySelector('.level-acc-count')?.textContent;
    const cards = s.querySelectorAll('.move-card').length;
    return { name, count, cards };
  });
  return { title, sections: sections.slice(0, 6), total: sections.length };
});
await p.screenshot({ path: 'test-results/levels-page.png', fullPage: false });
console.log(JSON.stringify({ home, urlAfterLevelClick: url, levelsPage: levels }, null, 1));
await browser.close();
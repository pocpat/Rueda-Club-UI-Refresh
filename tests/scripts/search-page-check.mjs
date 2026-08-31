// Verify Search page: title renamed + style-card titles navbar-blue, stats circles kept
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
await p.goto('http://localhost:5199/?tab=classes');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/?tab=classes');
await p.waitForTimeout(1100);
const out = await p.evaluate(() => {
  const title = document.querySelector('.class-page-head h2');
  const stats = [...document.querySelectorAll('.style-stat')].length;
  const statColors = [...document.querySelectorAll('.style-stat')].map((s) => getComputedStyle(s).getPropertyValue('--stat-color').trim());
  return {
    pageTitle: title?.textContent,
    pageTitleColor: getComputedStyle(title).color,
    styleCardTitles: [...document.querySelectorAll('.style-card-title')].map((t) => ({
      text: t.textContent,
      color: getComputedStyle(t).color,
    })),
    statCircles: stats,
    statColors,
  };
});
await p.evaluate(() => document.querySelector('.style-card-wrapper')?.scrollIntoView({ block: 'center' }));
await p.waitForTimeout(300);
await p.screenshot({ path: 'test-results/search-page-v2.png' });
// class page title for comparison
await p.goto('http://localhost:5199/?style=style-rueda-de-casino');
await p.waitForTimeout(700);
out.classPageTitleColor = await p.evaluate(() => getComputedStyle(document.querySelector('.class-page-head h2')).color);
console.log(JSON.stringify(out, null, 1));
await browser.close();
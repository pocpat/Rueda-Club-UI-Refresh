// Verify: wide buttons (~80% of tile), View page shows video + title + FULL explanation
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/');
await p.waitForTimeout(1500);

// 1) button width vs tile width
const widths = await p.evaluate(() => {
  return [...document.querySelectorAll('.home-tile')].map((t) => {
    const tr = t.getBoundingClientRect();
    const b = t.querySelector('.tile-btn').getBoundingClientRect();
    return { tileW: Math.round(tr.width), btnW: Math.round(b.width), pct: Math.round((b.width / tr.width) * 100) };
  });
});
console.log('BUTTON WIDTHS', JSON.stringify(widths));

// 2) View opens move detail with full explanation
const tileDesc = await p.evaluate(() => document.querySelector('.home-tile .home-tile-desc')?.textContent);
const before = await p.evaluate(() => document.querySelectorAll('article').length);
await p.click('.home-tile .tile-btn-red');
await p.waitForTimeout(1200);
const after = await p.evaluate(() => {
  const article = document.querySelector('article');
  if (!article) return { page: 'none' };
  const descP = [...article.querySelectorAll('p')].map((x) => x.textContent.trim()).filter((t) => t.length > 30);
  const hasVideoArea = !!article.querySelector('img, iframe, [class*="aspect-video"]');
  const backVisible = !!article.querySelector('nav button');
  return {
    hasArticle: true,
    hasVideoArea,
    backVisible,
    longestText: descP.sort((a, b) => b.length - a.length)[0]?.slice(0, 100),
    textLen: descP.sort((a, b) => b.length - a.length)[0]?.length,
  };
});
console.log('DETAIL PAGE', JSON.stringify(after, null, 1));
console.log('url:', p.url());
const descEndsWithEllipsis = after.textLen ? await p.evaluate(() => {
  const article = document.querySelector('article');
  const p1 = [...article.querySelectorAll('p')].map((x) => x.textContent.trim()).filter((t) => t.length > 30).sort((a, b) => b.length - a.length)[0];
  return p1.endsWith('…');
}) : null;
console.log('fullExplanation (no trailing …):', descEndsWithEllipsis === false);
await p.screenshot({ path: 'C:/Users/Elena/ruedaclub-rebuild/app/test-results/shot-view-detail.png' });
await browser.close();
console.log('done');
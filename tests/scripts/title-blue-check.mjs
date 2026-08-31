// Verify class-page title uses navbar blue (#0C1F3C) and header bar is #0C1F3C
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:5199/?style=style-rueda-de-casino');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/?style=style-rueda-de-casino');
await p.waitForTimeout(1000);
const out = await p.evaluate(() => {
  const title = document.querySelector('.class-page-head h2');
  const headerBar = document.querySelector('header');
  const dot = document.querySelector('.class-page-head .style-dot');
  return {
    titleColor: getComputedStyle(title).color,
    headerBarBg: getComputedStyle(headerBar).backgroundColor,
    dotColor: dot ? getComputedStyle(dot).backgroundColor : null,
    titleText: title.textContent,
  };
});
await p.screenshot({ path: 'test-results/classpage-title-blue.png' });
await p.evaluate(() => localStorage.setItem('theme', 'dark'));
await p.goto('http://localhost:5199/?style=style-rueda-de-casino');
await p.waitForTimeout(800);
out.darkTitleColor = await p.evaluate(() => getComputedStyle(document.querySelector('.class-page-head h2')).color);
out.darkHeaderBg = await p.evaluate(() => getComputedStyle(document.querySelector('header')).backgroundColor);
console.log(JSON.stringify(out, null, 1));
await browser.close();
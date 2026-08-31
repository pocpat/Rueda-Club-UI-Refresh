// Verify Levels page: all sections closed by default, red chevron opens one, toggle works
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
await p.goto('http://localhost:5199/?tab=levels');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/?tab=levels');
await p.waitForTimeout(900);

const closed = await p.evaluate(() => ({
  sections: document.querySelectorAll('.level-acc-wrap').length,
  openGrids: document.querySelectorAll('.accordion-grid.is-open').length,
  moveCards: document.querySelectorAll('.move-card').length,
  redChevrons: [...document.querySelectorAll('.level-acc-wrap [style*="linear-gradient(135deg, rgb(225, 29, 51)"]')].length,
  pageH: document.body.scrollHeight,
}));

// open Foundations via its red chevron button
await p.click('.level-page-btn:has-text("Foundations")');
await p.waitForTimeout(700);
const opened = await p.evaluate(() => ({
  openGrids: document.querySelectorAll('.accordion-grid.is-open').length,
  moveCards: document.querySelectorAll('.move-card').length,
}));
const openH = await p.evaluate(() => document.body.scrollHeight);
await p.screenshot({ path: 'test-results/levels-open.png' });

// toggle closed again
await p.click('.level-page-btn:has-text("Foundations")');
await p.waitForTimeout(600);
const reclosed = await p.evaluate(() => ({
  openGrids: document.querySelectorAll('.accordion-grid.is-open').length,
  moveCards: document.querySelectorAll('.move-card').length,
}));

console.log(JSON.stringify({ closed, opened, reclosed, pageHclosed: closed.pageH, pageHopen: openH }, null, 1));
await browser.close();
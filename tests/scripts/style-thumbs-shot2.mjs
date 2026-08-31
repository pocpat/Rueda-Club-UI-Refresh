// Screenshot scrolled to show bottom tiles fully
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/');
await p.waitForTimeout(1500);
await p.evaluate(() => document.querySelector('.home-tiles')?.scrollIntoView({ block: 'start' }));
await p.waitForTimeout(400);
await p.screenshot({ path: 'test-results/style-thumbs-full.png' });
console.log('done');
await browser.close();
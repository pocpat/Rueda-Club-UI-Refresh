// Screenshot home tiles with new matching fonts
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/');
await p.waitForTimeout(1000);
await p.screenshot({ path: 'test-results/tiles-font-matched.png' });
// scroll to show bottom tiles too
await p.evaluate(() => window.scrollBy(0, 250));
await p.waitForTimeout(300);
await p.screenshot({ path: 'test-results/tiles-font-matched-scrolled.png' });
console.log('done');
await browser.close();
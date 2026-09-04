// Final visual: search field with run button + open dropdown
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
await p.goto('http://localhost:5199/?tab=classes');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/?tab=classes');
await p.waitForTimeout(1200);
await p.fill('#move-search', 'dile');
await p.waitForTimeout(700);
await p.locator('#move-search').scrollIntoViewIfNeeded();
await p.waitForTimeout(400);
await p.screenshot({ path: 'C:/Users/Elena/ruedaclub-rebuild/app/test-results/shot-search-run.png' });
await browser.close();
console.log('done');
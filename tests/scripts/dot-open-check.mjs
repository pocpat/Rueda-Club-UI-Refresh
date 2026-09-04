// Verify: style-card dots blue, Open-> red (light + dark)
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 800, height: 900 } });
await p.goto('http://localhost:5199/?tab=classes');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/?tab=classes');
await p.waitForTimeout(1000);

const check = () => p.evaluate(() => {
  const dot = getComputedStyle(document.querySelector('.style-tile-btn .style-dot')).backgroundColor;
  const open = getComputedStyle(document.querySelector('.style-tile-btn span.ml-auto')).color;
  return { dot, open };
});
const light = await check();
console.log('LIGHT', JSON.stringify(light));
const okLight = light.dot === 'rgb(46, 95, 163)' && light.open === 'rgb(217, 4, 41)';

await p.evaluate(() => localStorage.setItem('theme', 'dark'));
await p.goto('http://localhost:5199/?tab=classes');
await p.waitForTimeout(900);
const dark = await check();
console.log('DARK', JSON.stringify(dark));

await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/?tab=classes');
await p.waitForTimeout(900);
await p.locator('.style-tile-btn').first().scrollIntoViewIfNeeded();
await p.waitForTimeout(300);
await p.screenshot({ path: 'C:/Users/Elena/ruedaclub-rebuild/app/test-results/shot-dots-open.png' });
await browser.close();
console.log('LIGHT OK:', okLight);
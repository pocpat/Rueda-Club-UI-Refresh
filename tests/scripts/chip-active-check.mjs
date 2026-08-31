// Active filter chip must be navy-filled (navbar blue)
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await p.goto('http://localhost:5199/?tab=classes');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/?tab=classes');
await p.waitForTimeout(900);
await p.click('.filter-chip:has-text("Beginner")');
await p.mouse.move(640, 900); // move mouse away so :hover doesn't mask the active style
await p.waitForTimeout(300);
const out = await p.evaluate(() => {
  const active = document.querySelector('.filter-chip.is-active');
  const cs = getComputedStyle(active);
  return { text: active.textContent, bg: cs.backgroundColor, color: cs.color };
});
await p.evaluate(() => document.querySelector('.level-chips')?.scrollIntoView({ block: 'center' }));
await p.waitForTimeout(300);
await p.screenshot({ path: 'test-results/chip-active.png' });
console.log(JSON.stringify(out));
await browser.close();
// Verify level accordion restyle: title color/no card, red chevron button, blue count badge
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await p.goto('http://localhost:5199/?style=style-rueda-de-casino');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/?style=style-rueda-de-casino');
await p.waitForTimeout(1200);
const out = await p.evaluate(() => {
  const heads = [...document.querySelectorAll('.level-acc-btn')].slice(0, 2);
  return heads.map((h) => {
    const title = h.querySelector('.level-acc-title');
    const count = h.querySelector('.level-acc-count');
    const chev = h.querySelector('div[style*="linear-gradient(135deg, rgb(225, 29, 51)"]');
    const tcs = title ? getComputedStyle(title) : null;
    const ccs = count ? getComputedStyle(count) : null;
    // any card bg behind the title row? (button itself must be transparent)
    const btnBg = getComputedStyle(h).backgroundColor;
    return {
      title: title?.textContent,
      titleColor: tcs?.color,
      rowBg: btnBg,
      countText: count?.textContent,
      countBg: ccs?.backgroundColor,
      countColor: ccs?.color,
      chevronRed: !!chev,
    };
  });
});
await p.screenshot({ path: 'test-results/level-acc-v2.png' });
// open first accordion, screenshot opened state
await p.click('.level-acc-btn');
await p.waitForTimeout(700);
await p.screenshot({ path: 'test-results/level-acc-v2-open.png' });
console.log(JSON.stringify(out, null, 1));
await browser.close();
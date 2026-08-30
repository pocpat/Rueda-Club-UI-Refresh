// Quick Actions check: circular red buttons, titles only, level chips below
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:5199/');
await page.evaluate(() => localStorage.setItem('theme', 'light'));
await page.goto('http://localhost:5199/');
await page.waitForTimeout(1200);

const m = await page.evaluate(() => {
  const gs = (el, p) => getComputedStyle(el)[p];
  const btns = [...document.querySelectorAll('.qa-btn')];
  return {
    count: btns.length,
    subs: document.querySelectorAll('.quick-tile-sub').length,
    labels: [...document.querySelectorAll('.qa-label')].map((el) => el.textContent),
    btnStyle: btns[0] ? {
      borderRadius: gs(btns[0], 'borderRadius'),
      bg: gs(btns[0], 'backgroundImage').slice(0, 80),
      color: gs(btns[0], 'color'),
      w: btns[0].getBoundingClientRect().width,
      h: btns[0].getBoundingClientRect().height,
    } : null,
    chips: document.querySelectorAll('.level-chip').length,
  };
});
console.log(JSON.stringify(m, null, 1));

const circleOK = m.btnStyle && m.btnStyle.borderRadius === '50%' && Math.abs(m.btnStyle.w - m.btnStyle.h) < 1;
const redOK = m.btnStyle && m.btnStyle.bg.includes('225, 4, 41');
const whiteOK = m.btnStyle && m.btnStyle.color === 'rgb(255, 255, 255)';
console.log(`circle=${circleOK} red=${redOK} whiteIcon=${whiteIcon(m)} subs=${m.subs} chips=${m.chips}`);
function whiteIcon(m) { return m.btnStyle && m.btnStyle.color === 'rgb(255, 255, 255)'; }

await page.locator('.qa-row').scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: 'C:/Users/Elena/ruedaclub-rebuild/app/test-results/shot-qa-circles.png' });
await browser.close();
console.log('done');
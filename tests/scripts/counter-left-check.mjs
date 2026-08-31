// Verify counter sits LEFT of the red chevron on Levels page
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await p.goto('http://localhost:5199/?tab=levels');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/?tab=levels');
await p.waitForTimeout(900);
const out = await p.evaluate(() => {
  const head = document.querySelector('.level-page-head');
  const badge = head.querySelector('.level-acc-count').getBoundingClientRect();
  const chev = head.querySelector('.flex-row > div:last-child, .flex-row > span:last-child')?.getBoundingClientRect()
    || head.querySelectorAll('span span + div')[0]?.getBoundingClientRect();
  // find the red chevron box: last direct child span of the flex-row wrapper
  const wrapper = head.querySelector('.flex-row');
  const chevEl = wrapper.lastElementChild.getBoundingClientRect();
  return {
    counterRight: Math.round(badge.right),
    chevronLeft: Math.round(chevEl.left),
    counterLeftOfChevron: badge.right <= chevEl.left,
    sameRow: Math.abs((badge.top + badge.height / 2) - (chevEl.top + chevEl.height / 2)) < 6,
  };
});
await p.evaluate(() => document.querySelector('.level-page-head')?.scrollIntoView({ block: 'center' }));
await p.waitForTimeout(300);
await p.screenshot({ path: 'test-results/levels-counter-left.png' });
console.log(JSON.stringify(out));
await browser.close();
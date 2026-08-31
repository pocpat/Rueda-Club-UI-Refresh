// Verify class page: plain header on grey, one white body section wrapping accordions, no VIEW pill
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1100 } });

// Rueda de Casino class page (?style=)
await p.goto('http://localhost:5199/?style=style-rueda-de-casino');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/?style=style-rueda-de-casino');
await p.waitForTimeout(1200);
const out = await p.evaluate(() => {
  const head = document.querySelector('.class-page-head');
  const body = document.querySelector('.class-page-body');
  const hcs = head ? getComputedStyle(head) : null;
  const bcs = body ? getComputedStyle(body) : null;
  const accs = body ? body.querySelectorAll('.level-acc-btn').length : 0;
  const viewPills = document.querySelectorAll('.level-acc-view').length;
  const titleInsideCard = hcs && hcs.backgroundColor !== 'rgba(0, 0, 0, 0)';
  return {
    headBg: hcs?.backgroundColor,
    headBorder: hcs?.borderTopWidth + ' ' + hcs?.borderTopStyle,
    bodyBg: bcs?.backgroundColor,
    bodyRadius: bcs?.borderRadius,
    accordionsInsideBody: accs,
    viewPillsGone: viewPills === 0,
    titleVisible: !!document.querySelector('.class-page-head h2'),
  };
});
await p.screenshot({ path: 'test-results/classpage-v3.png' });
// open a level for the shot
await p.click('.level-acc-btn');
await p.waitForTimeout(700);
await p.screenshot({ path: 'test-results/classpage-v3-open.png' });

// Documentary page — must look the same
await p.goto('http://localhost:5199/?style=style-documentary');
await p.waitForTimeout(900);
const out2 = await p.evaluate(() => {
  const body = document.querySelector('.class-page-body');
  return {
    docHasBody: !!body,
    docAccordions: body ? body.querySelectorAll('.level-acc-btn').length : 0,
    docViewPills: document.querySelectorAll('.level-acc-view').length,
  };
});
await p.screenshot({ path: 'test-results/classpage-v3-doc.png' });

// Son Cubano
await p.goto('http://localhost:5199/?style=style-son-cubano');
await p.waitForTimeout(900);
const out3 = await p.evaluate(() => ({
  sonHasBody: !!document.querySelector('.class-page-body'),
  sonPills: document.querySelectorAll('.level-acc-view').length,
}));

console.log(JSON.stringify({ rueda: out, documentary: out2, son: out3 }, null, 1));
await browser.close();
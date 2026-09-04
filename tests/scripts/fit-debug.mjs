// Debug the flip logic: what does fit() actually see under the fake keyboard?
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
await p.goto('http://localhost:5199/?tab=classes');
await p.waitForTimeout(1200);

// install fake keyboard viewport FIRST
await p.evaluate(() => {
  const fake = new EventTarget();
  Object.defineProperty(fake, 'height', { value: 494 });
  Object.defineProperty(fake, 'offsetTop', { value: 0 });
  Object.defineProperty(window, 'visualViewport', { value: fake, configurable: true });
  window.__fakeVV = fake;
  // instrument: log fit decisions
  window.__fitLog = [];
});

await p.fill('#move-search', 'dile');
await p.waitForTimeout(600);

const dbg = await p.evaluate(() => {
  const input = document.getElementById('move-search');
  const list = document.querySelector('[role="listbox"]');
  const vv = window.visualViewport;
  const r = input.getBoundingClientRect();
  const lr = list?.getBoundingClientRect();
  return {
    vvHeight: vv ? vv.height : null,
    inputRect: { top: Math.round(r.top), bottom: Math.round(r.bottom) },
    listStyleTop: list?.style.top || null,
    listStyleBottom: list?.style.bottom || null,
    listMaxH: list?.style.maxHeight,
    listBottomPx: lr ? Math.round(lr.bottom) : null,
    spaceBelow: vv ? Math.round(vv.height + vv.offsetTop - r.bottom - 12) : null,
    spaceAbove: vv ? Math.round(r.top - vv.offsetTop - 12) : null,
  };
});
console.log(JSON.stringify(dbg, null, 1));
await p.evaluate(() => window.__fakeVV.dispatchEvent(new Event('resize')));
await p.waitForTimeout(800);
const dbg2 = await p.evaluate(() => {
  const list = document.querySelector('[role="listbox"]');
  return {
    listStyleTop: list?.style.top || null,
    listStyleBottom: list?.style.bottom || null,
    listMaxH: list?.style.maxHeight,
    listBottomPx: list ? Math.round(list.getBoundingClientRect().bottom) : null,
  };
});
console.log('after resize:', JSON.stringify(dbg2));
await browser.close();
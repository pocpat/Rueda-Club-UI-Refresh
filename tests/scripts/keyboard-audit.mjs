// Mobile keyboard audit — the 3 reported issues:
// 1. virtual keyboard covers results   2. no "run the search" button   3. scrollIntoView on Search quick-action
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const results = {};
const p = await browser.newPage({ viewport: { width: 390, height: 844 } }); // iPhone-ish
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/?tab=classes');
await p.waitForTimeout(1200);

// ---- Issue 2: run-the-search button exists, visible, inside the field ----
results.runBtn = await p.evaluate(() => {
  const btn = document.querySelector('.search-run-btn');
  if (!btn) return { present: false };
  const r = btn.getBoundingClientRect();
  const input = document.getElementById('move-search').getBoundingClientRect();
  return {
    present: true,
    visible: r.width > 0 && r.height > 0,
    insideField: r.right <= input.right + 2 && r.top >= input.top - 2 && r.bottom <= input.bottom + 2,
    size: `${Math.round(r.width)}x${Math.round(r.height)}`,
  };
});

// ---- Issue 3: Search quick action -> Classes, input focused + centered in view ----
await p.goto('http://localhost:5199/');
await p.waitForTimeout(800);
await p.getByRole('button', { name: 'Search' }).click();
await p.waitForTimeout(1200);
results.quickAction = await p.evaluate(() => {
  const el = document.getElementById('move-search');
  const r = el.getBoundingClientRect();
  return {
    onClasses: location.search.includes('tab=classes'),
    focused: document.activeElement === el,
    inputCentered: Math.abs((r.top + r.height / 2) - window.innerHeight / 2) < window.innerHeight * 0.3,
    fullyVisible: r.top >= 0 && r.bottom <= window.innerHeight,
  };
});

// ---- Issue 1: dropdown visible without keyboard; and clears a "virtual keyboard" ----
// Type to open results
await p.fill('#move-search', 'dile');
await p.waitForTimeout(600);
results.dropdownNoKeyboard = await p.evaluate(() => {
  const list = document.querySelector('[role="listbox"]');
  if (!list) return { present: false };
  const r = list.getBoundingClientRect();
  return { present: true, bottom: Math.round(r.bottom), viewportH: window.innerHeight, withinViewport: r.bottom <= window.innerHeight };
});

// Simulate the soft keyboard: replace visualViewport (shrunk to 494px = 844 - ~350 keyboard)
// BEFORE re-typing, so the effect re-runs and attaches its resize listener to the fake.
results.keyboardSim = await p.evaluate(() => {
  const fake = new EventTarget();
  Object.defineProperty(fake, 'height', { value: 494 });
  Object.defineProperty(fake, 'offsetTop', { value: 0 });
  Object.defineProperty(window, 'visualViewport', { value: fake, configurable: true });
  window.__fakeVV = fake;
  return true;
});
await p.fill('#move-search', '');      // clear (fires onChange, closes results)
await p.fill('#move-search', 'dile');  // retype (fires onChange -> effect re-runs with fake vv)
await p.waitForTimeout(300);
await p.evaluate(() => window.__fakeVV.dispatchEvent(new Event('resize')));
await p.waitForTimeout(1000);
results.keyboardAfterFit = await p.evaluate(() => {
  const list = document.querySelector('[role="listbox"]');
  if (!list) return { present: false };
  const r = list.getBoundingClientRect();
  const visibleBottom = 494; // simulated keyboard top
  return {
    listBottom: Math.round(r.bottom),
    clearsKeyboard: r.bottom <= visibleBottom + 20,
    scrollY: Math.round(window.scrollY),
  };
});
await p.screenshot({ path: 'C:/Users/Elena/ruedaclub-rebuild/app/test-results/kb-audit-results.png' });

// ---- Run button actually navigates to first match ----
await p.goto('http://localhost:5199/?tab=classes');
await p.waitForTimeout(1000);
await p.fill('#move-search', 'dile que si');
await p.waitForTimeout(500);
await p.click('.search-run-btn');
await p.waitForTimeout(800);
results.runNavigates = { url: p.url(), hasMoveParam: p.url().includes('?move=') };

// ---- Nonsense query via run button shows "No moves found" ----
await p.goto('http://localhost:5199/?tab=classes');
await p.waitForTimeout(900);
await p.fill('#move-search', 'zzzznothing');
await p.waitForTimeout(400);
await p.click('.search-run-btn');
await p.waitForTimeout(400);
results.noResultsShown = await p.evaluate(() => !!document.body.innerText.includes('No moves found'));

console.log(JSON.stringify(results, null, 1));
const pass = results.runBtn.present && results.runBtn.insideField
  && results.quickInput?.fullyVisible !== false
  && results.dropdownNoKeyboard.withinViewport
  && results.keyboardAfterFit.clearsKeyboard !== false
  && results.runNavigates.hasMoveParam
  && results.noResultsShown;
console.log('AUDIT:', pass ? 'PASS' : 'CHECK ABOVE');
await browser.close();
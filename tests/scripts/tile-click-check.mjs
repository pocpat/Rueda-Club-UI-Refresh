// Verify: whole tile clickable, buttons are affordances, slim mobile button heights
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const out = {};

// Desktop: click tile body (not button) → navigates to move/style
const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/');
await p.waitForTimeout(1000);

// Click MOTD tile near its TOP (away from the button)
await p.click('.home-tile-motd', { position: { x: 80, y: 30 } });
await p.waitForTimeout(500);
out.tileClickOpensMove = /move=/.test(p.url()) ? p.url() : 'FAIL ' + p.url();

// Back home; click a style tile body
await p.goto('http://localhost:5199/');
await p.waitForTimeout(800);
await p.click('.home-tile-style >> nth=0', { position: { x: 30, y: 150 } });
await p.waitForTimeout(500);
out.styleTileClickOpensStyle = /style=/.test(p.url()) ? 'OK' : 'FAIL ' + p.url();

// Button itself is now a span (affordance) — clicking it still bubbles to tile
await p.goto('http://localhost:5199/');
await p.waitForTimeout(800);
await p.click('.home-tile-style >> nth=0 >> .tile-btn');
await p.waitForTimeout(500);
out.affordanceClickWorks = /style=/.test(p.url()) ? 'OK' : 'FAIL ' + p.url();

// Mobile: button height measurement
const m = await b.newPage({ viewport: { width: 390, height: 844 } });
await m.goto('http://localhost:5199/');
await m.evaluate(() => localStorage.setItem('theme', 'light'));
await m.goto('http://localhost:5199/');
await m.waitForTimeout(1000);
out.mobile = await m.evaluate(() => {
  const tile = document.querySelector('.home-tile-motd');
  const tr = tile.getBoundingClientRect();
  const btn = tile.querySelector('.tile-btn').getBoundingClientRect();
  return {
    btnH: Math.round(btn.height),
    btnWas33Before: 'was ~33px',
    redPctOfTile: Math.round(btn.width * btn.height / (tr.width * tr.height) * 1000) / 10 + '%',
    btnLabel: (btn.textContent || '').trim(),
    cursor: getComputedStyle(tile).cursor,
  };
});
await m.screenshot({ path: 'C:/Users/Elena/ruedaclub-rebuild/app/test-results/sl_buttons_mobile.png' });

// keyboard: focus tile + Enter
await p.goto('http://localhost:5199/');
await p.waitForTimeout(800);
await p.evaluate(() => document.querySelector('.home-tile-motd').focus());
await p.keyboard.press('Enter');
await p.waitForTimeout(500);
out.keyboardEnterOpens = /move=/.test(p.url()) ? 'OK' : 'FAIL';
// focus outline visible?
out.focusVisible = await p.evaluate(() => document.activeElement?.classList.contains('home-tile'));

console.log(JSON.stringify(out, null, 1));
await b.close();
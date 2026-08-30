// BackButton check: present + top-left + same button on every page, absent on Home
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const out = {};
const pages = [
  ['home', '/'],
  ['motd→move detail', '/?move='],
  ['class page', '/?style=style-rueda-de-casino'],
  ['classes tab', '/?tab=classes'],
  ['playlist tab', '/?tab=playlist'],
  ['community tab', '/?tab=community'],
  ['favorites tab', '/?tab=favorites'],
];

const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Get a real moveId + a style page with a move for the detail test
await p.goto('http://localhost:5199/');
await p.waitForTimeout(600);
const moveId = await p.evaluate(() => window.__nope, undefined).then(() => null).catch(() => null);

// Discover a move id from the data by opening Classes then clicking through is heavy;
// read it from the module data file instead at runtime via fetch
const res = await p.request.get('http://localhost:5199/data.json').catch(() => null);
let firstMoveId = null;
if (res && res.ok()) {
  const j = await res.json().catch(() => null);
  firstMoveId = j?.moves?.[0]?.id || null;
}

const results = {};
for (const [label, path] of pages) {
  const url = path === '/?move='
    ? `/?move=${firstMoveId}&style=`
    : path;
  await p.goto(`http://localhost:5199${url}`);
  await p.waitForTimeout(500);
  results[label] = await p.evaluate(() => {
    const main = document.querySelector('main#main-content');
    const nav = main?.querySelector(':scope > nav[aria-label="Breadcrumb navigation"]');
    const btn = nav?.querySelector('button');
    if (!nav || !btn) return { present: false };
    const br = btn.getBoundingClientRect();
    const mr = main.getBoundingClientRect();
    return {
      present: true,
      label: btn.textContent.trim(),
      isFirstChild: main.firstElementChild === nav,
      x: Math.round(br.left - mr.left),
      y: Math.round(br.top - mr.top),
    };
  });
}
console.log(JSON.stringify({ firstMoveId, results }, null, 1));
await browser.close();
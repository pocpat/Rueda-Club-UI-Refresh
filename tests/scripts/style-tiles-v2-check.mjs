// Verify style tile updates: labels, red buttons, tags, desc, badge no border, fit
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1400 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/');
await p.waitForTimeout(1500);
const out = await p.evaluate(() => {
  const tiles = [...document.querySelectorAll('.home-tile-style')];
  return tiles.map((t) => {
    const btn = t.querySelector('.tile-btn');
    const badge = t.querySelector('.home-tile-count');
    const cs = btn ? getComputedStyle(btn) : null;
    const bcs = badge ? getComputedStyle(badge) : null;
    const tags = [...t.querySelectorAll('.home-tile-tag')].map((x) => x.textContent);
    // overflow check: any content extending past tile bounds?
    const tr = t.getBoundingClientRect();
    let overflow = false;
    t.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom > tr.bottom + 1 || r.right > tr.right + 1) overflow = true;
    });
    return {
      title: t.querySelector('.home-tile-title')?.textContent,
      btnLabel: btn?.textContent.trim(),
      btnBg: cs?.backgroundImage !== 'none' ? cs?.backgroundImage.slice(0, 40) : cs?.backgroundColor,
      btnColor: cs?.color,
      badgeBorder: bcs?.borderTopWidth + ' ' + bcs?.borderTopStyle,
      tags,
      desc: t.querySelector('.home-tile-desc')?.textContent.slice(0, 50) || null,
      overflow,
      tileH: Math.round(t.getBoundingClientRect().height),
    };
  });
});
await p.evaluate(() => document.querySelector('.home-tiles')?.scrollIntoView({ block: 'start' }));
await p.waitForTimeout(400);
await p.screenshot({ path: 'test-results/style-tiles-v2.png' });
console.log(JSON.stringify(out, null, 1));
await browser.close();
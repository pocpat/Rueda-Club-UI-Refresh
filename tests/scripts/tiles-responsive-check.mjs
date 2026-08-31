// Verify progressive disclosure across 390 / 600 / 1280 widths
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const out = {};

async function check(width, label) {
  const p = await browser.newPage({ viewport: { width, height: 1200 } });
  await p.goto('http://localhost:5199/?tab=home');
  await p.evaluate(() => localStorage.setItem('theme', 'light'));
  await p.goto('http://localhost:5199/?tab=home');
  await p.waitForTimeout(1200);
  out[label] = await p.evaluate(() => {
    const vis = (el) => el && getComputedStyle(el).display !== 'none';
    const styleTile = document.querySelector('.home-tile-style');
    const motd = document.querySelector('.home-tile-motd');
    const title = styleTile.querySelector('.home-tile-title');
    const tr = title.getBoundingClientRect();
    return {
      styleThumbVisible: vis(styleTile.querySelector('.home-tile-style-thumb')),
      motdThumbVisible: vis(motd.querySelector('.home-tile-thumb')),
      titleVisible: vis(title),
      titleH: Math.round(tr.height),
      titleFont: getComputedStyle(title).fontSize,
      badgeVisible: vis(styleTile.querySelector('.home-tile-count')),
      tagsVisible: vis(styleTile.querySelector('.home-tile-tags')),
      descVisible: vis(styleTile.querySelector('.home-tile-desc')),
      videoTitleVisible: vis(motd.querySelector('.home-tile-video-title')),
      levelVisible: vis(motd.querySelector('.home-tile-level')),
      styleBtnLabel: [...styleTile.querySelectorAll('.tile-btn span')].filter((s) => getComputedStyle(s).display !== 'none').map((s) => s.textContent),
      motdBtn: motd.querySelector('.tile-btn').textContent.trim(),
      overflow: (() => {
        const t = styleTile;
        let o = false;
        t.querySelectorAll('*').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom > t.getBoundingClientRect().bottom + 1) o = true;
        });
        return o;
      })(),
    };
  });
  await p.screenshot({ path: `test-results/tiles-${label}.png`, fullPage: false });
  await p.close();
}

await check(390, 'small');
await check(600, 'mid');
await check(1280, 'desktop');
console.log(JSON.stringify(out, null, 1));
await browser.close();
// Daily renewal check: same day -> same move; next local day -> different move.
// Uses Playwright clock.setFixedTime to simulate days (page must reload after set).
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const out = {};

async function motdAt(page, dateArg) {
  await page.clock.setFixedTime(new Date(dateArg));
  await page.goto('http://localhost:5199/');
  await page.evaluate(() => localStorage.setItem('theme', 'light'));
  await page.goto('http://localhost:5199/');
  await page.waitForTimeout(400);
  return page.evaluate(() => document.querySelector('.home-tile-video-title')?.textContent);
}

const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });

out['2026-08-31_morning'] = await motdAt(p, '2026-08-31T08:00:00');
out['2026-08-31_evening'] = await motdAt(p, '2026-08-31T22:00:00');
out['2026-09-01_nextday'] = await motdAt(p, '2026-09-01T08:00:00');
out['2026-09-02_dayafter'] = await motdAt(p, '2026-09-02T08:00:00');

out.sameMoveWithinDay =
  out['2026-08-31_morning'] === out['2026-08-31_evening'];
out.renewsNextDay = out['2026-08-31_morning'] !== out['2026-09-01_nextday'];
out.renewsAgainDayAfter = out['2026-09-01_nextday'] !== out['2026-09-02_dayafter'];
out.neverSameConsecutive = out['2026-08-31_morning'] !== out['2026-09-01_nextday']
  && out['2026-09-01_nextday'] !== out['2026-09-02_dayafter'];

// Real now (unfixed clock) sanity
const p2 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await p2.goto('http://localhost:5199/');
await p2.waitForTimeout(400);
out.realNow = await p2.evaluate(() => document.querySelector('.home-tile-video-title')?.textContent);

console.log(JSON.stringify(out, null, 1));
await browser.close();
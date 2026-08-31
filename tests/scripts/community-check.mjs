// Verify Community page: banner, address, schedule, maps links, all images local
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
await p.goto('http://localhost:5199/?tab=community');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/?tab=community');
await p.waitForTimeout(1200);
const out = await p.evaluate(() => {
  const banner = document.querySelector('.venue-banner img');
  const addr = document.querySelector('.venue-address');
  const rows = [...document.querySelectorAll('.venue-schedule-row')].map((r) => r.textContent.trim());
  const links = [...document.querySelectorAll('.venue-btn')].map((a) => ({ text: a.textContent.trim(), href: a.href }));
  const badge = document.querySelector('.venue-banner-badge');
  return {
    bannerLoaded: banner ? banner.complete && banner.naturalWidth > 0 : false,
    bannerSrc: banner?.getAttribute('src'),
    address: addr?.textContent,
    schedule: rows,
    links,
    badge: badge?.textContent,
  };
});
await p.screenshot({ path: 'test-results/community-v2.png', fullPage: true });

// all <img> on the page must be local /images/... and return 200
const imgs = await p.evaluate(() => [...document.querySelectorAll('img')].map((i) => i.getAttribute('src')));
const status = {};
for (const src of imgs) {
  const res = await p.request.get(`http://localhost:5199${src}`);
  status[src] = res.status();
}
console.log(JSON.stringify({ out, imageStatus: status }, null, 1));
await browser.close();
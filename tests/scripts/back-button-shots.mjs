// Screenshots of Back button on class page + playlist + move detail (desktop + mobile)
import { chromium } from '@playwright/test';

const browser = await chromium.launch();

const shots = [
  ['http://localhost:5199/?style=style-rueda-de-casino', 'test-results/back-desktop-class.png', 1280, 900],
  ['http://localhost:5199/?tab=playlist', 'test-results/back-desktop-playlist.png', 1280, 900],
  ['http://localhost:5199/?move=move-foundations-foundational-body-mechanics-and-rhythm&style=style-rueda-de-casino', 'test-results/back-desktop-move.png', 1280, 900],
  ['http://localhost:5199/?tab=classes', 'test-results/back-mobile-classes.png', 390, 844],
];

for (const [url, path, w, h] of shots) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.goto(url);
  await p.evaluate(() => localStorage.setItem('theme', 'light'));
  await p.goto(url);
  await p.waitForTimeout(900);
  await p.screenshot({ path });
  await p.close();
}
console.log('done');
await browser.close();
// Determine why MoveDetail 'class-page-head h2' selector fails — page probably has no .class-page-head
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await p.goto('http://localhost:5199/?move=move-foundations-foundational-body-mechanics-and-rhythm&style=style-rueda-de-casino');
await p.waitForTimeout(900);
const r = await p.evaluate(() => ({
  hasClassPageHead: !!document.querySelector('.class-page-head'),
  h1: document.querySelector('h1')?.textContent?.slice(0, 50),
  firstHeading: document.querySelector('h1, h2, h3')?.textContent?.slice(0, 50),
  moveDetailHeading: [...document.querySelectorAll('h1,h2,h3')].slice(0, 3).map((h) => h.textContent.slice(0, 40)),
  iframes: document.querySelectorAll('iframe').length,
  youtubeThumb: !!document.querySelector('img[src*="img.youtube.com"]'),
}));
console.log(JSON.stringify(r, null, 1));
await browser.close();
// Compare computed fonts: MOTD heading vs style tile titles
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:5199/');
await p.evaluate(() => localStorage.setItem('theme', 'light'));
await p.goto('http://localhost:5199/');
await p.waitForTimeout(800);
const r = await p.evaluate(() => {
  const pick = (el) => {
    const c = getComputedStyle(el);
    return { family: c.fontFamily, weight: c.fontWeight, size: c.fontSize, ls: c.letterSpacing, tt: c.textTransform };
  };
  const heading = document.querySelector('.home-tile-motd .home-tile-heading');
  const titles = [...document.querySelectorAll('.home-tile-title')].map((el) => ({ text: el.textContent, ...pick(el) }));
  return { motdHeading: pick(heading), styleTiles: titles };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
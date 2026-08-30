// Verify detail page renders the FULL explanation for a long-description lesson
import { chromium } from '@playwright/test';
import { readFileSync } from 'fs';

const d = JSON.parse(readFileSync('C:/Users/Elena/ruedaclub-rebuild/app/src/data.json', 'utf-8'));
const mv = d.moves.find((m) => (m.description || '').length > 200);
console.log('test lesson:', mv.id, '| desc chars:', mv.description.length);

const strip = (t) => t.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/\\n/g, ' ').replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim();

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:5199/?move=' + mv.id + '&style=style-rueda-de-casino');
await p.waitForTimeout(1500);
const res = await p.evaluate(() => {
  const article = document.querySelector('article');
  const ps = [...article.querySelectorAll('p')].map((x) => x.textContent.trim());
  const longest = ps.sort((a, b) => b.length - a.length)[0];
  const hasVideo = !!article.querySelector('[class*="aspect-video"]');
  return { longest, hasVideo };
});
const expected = strip(mv.description);
console.log('rendered chars:', res.longest.length, '| expected chars:', expected.length);
console.log('FULL match:', res.longest === expected);
console.log('has video:', res.hasVideo);
await p.screenshot({ path: 'C:/Users/Elena/ruedaclub-rebuild/app/test-results/shot-detail-full.png' });
await browser.close();
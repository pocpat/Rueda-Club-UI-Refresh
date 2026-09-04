// Render sitemap.html in a real browser and screenshot the diagram
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
await p.goto('file:///C:/Users/Elena/ruedaclub-rebuild/app/docs/sitemap.html');
await p.waitForTimeout(3500); // mermaid CDN + render
const hasSvg = await p.evaluate(() => !!document.querySelector('.mermaid svg'));
const nodes = await p.evaluate(() => document.querySelectorAll('.mermaid svg g.node').length);
console.log('mermaid rendered:', hasSvg, '| nodes:', nodes);
await p.screenshot({ path: 'C:/Users/Elena/ruedaclub-rebuild/app/test-results/sitemap-diagram.png', clip: { x: 0, y: 0, width: 1200, height: 980 } });
await browser.close();
console.log('done');
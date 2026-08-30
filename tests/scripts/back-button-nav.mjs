// Back-button click behavior: returns to class page when ?style= set, else Home
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const out = {};

const clickBack = async () => {
  await p.click('main nav[aria-label="Breadcrumb navigation"] button');
  await p.waitForTimeout(400);
  return p.url();
};

// 1. Move detail WITH style → back to that class page
await p.goto('http://localhost:5199/?move=move-foundations-foundational-body-mechanics-and-rhythm&style=style-rueda-de-casino');
await p.waitForTimeout(500);
out.fromMoveWithStyle = await clickBack(); // expect ?style=style-rueda-de-casino

// 2. Class page → back home
await p.goto('http://localhost:5199/?style=style-rueda-de-casino');
await p.waitForTimeout(500);
out.fromClassPage = await clickBack(); // expect ?tab=home

// 3. Playlist tab → back home
await p.goto('http://localhost:5199/?tab=playlist');
await p.waitForTimeout(500);
out.fromPlaylist = await clickBack(); // expect ?tab=home

// 4. MOTD View → detail (no style) → back home
await p.goto('http://localhost:5199/');
await p.waitForTimeout(600);
await p.click('.home-tile-motd .tile-btn');
await p.waitForTimeout(500);
const detailUrl = p.url();
out.motdDetailUrl = detailUrl;
out.fromMotdDetail = await clickBack(); // expect ?tab=home

console.log(JSON.stringify(out, null, 1));
await browser.close();
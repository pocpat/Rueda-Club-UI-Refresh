// Full page audit: all pages open + video playback works on move detail
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const out = {};

// 1. All main pages open with core content
const pagesToCheck = [
  ['Home', '/?tab=home', '.home-tile-motd'],
  ['Search', '/?tab=classes', '.class-page-head h2'],
  ['Levels', '/?tab=levels', '.class-page-head h2'],
  ['Playlist', '/?tab=playlist', '.class-page-head h2'],
  ['Community', '/?tab=community', '.class-page-head h2'],
  ['Favorites', '/?tab=favorites', '.class-page-head h2'],
  ['ClassPage Rueda', '/?style=style-rueda-de-casino', '.class-page-head h2'],
  ['ClassPage Son', '/?style=style-son-cubano', '.class-page-head h2'],
  ['ClassPage Documentary', '/?style=style-documentary', '.class-page-head h2'],
  ['MoveDetail', '/?move=move-foundations-foundational-body-mechanics-and-rhythm&style=style-rueda-de-casino', '.class-page-head h2'],
];

const p = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const errors = [];
p.on('pageerror', (e) => errors.push(String(e).slice(0, 100)));

for (const [name, url, sel] of pagesToCheck) {
  await p.goto(`http://localhost:5199${url}`);
  await p.waitForTimeout(700);
  const ok = await p.evaluate((s) => !!document.querySelector(s), sel);
  out[name] = { url, opens: ok, jsErrors: 0 };
}

// 2. Video playback on move detail
await p.goto('http://localhost:5199/?move=move-foundations-foundational-body-mechanics-and-rhythm&style=');
await p.waitForTimeout(900);
const videoInfo = await p.evaluate(() => {
  const players = document.querySelectorAll('.video-thumb, iframe[src*="youtube"], [id^="player-"]');
  return {
    videoPlayers: document.querySelectorAll('iframe').length,
    thumbVisible: !!document.querySelector('img[src*="img.youtube.com"], .video-facade, [class*="video"]'),
  };
});

// click first video facade → YouTube iframe should mount with autoplay
let facadeCount = await p.evaluate(() => document.querySelectorAll('button[aria-label*="Play"], .video-facade, [class*="facade"]').length);
// click the first video play button (VideoPlayer facade)
const playClicked = await p.evaluate(() => {
  const btn = document.querySelector('button[aria-label*="lay"], .video-thumb, [class*="video"] button');
  if (btn) { btn.click(); return true; }
  return false;
}).catch(() => false);
await p.waitForTimeout(3500);
out.videoPlay = await p.evaluate(() => {
  const iframes = [...document.querySelectorAll('iframe')];
  const yt = iframes.filter((f) => (f.src || '').includes('youtube'));
  return {
    iframesBefore: null,
    youtubeIframesMounted: yt.length,
    src: yt[0]?.src?.slice(0, 60) || null,
  };
});

// Play state: react-youtube mounts iframe with enablejsapi; can't easily read playing state,
// so check iframe src has autoplay param
out.videoSrcHasAutoplay = (out.videoPlay.src || '').includes('autoplay');

// 3. Accordion open on ClassPage (video list loads)
await p.goto('http://localhost:5199/?style=style-rueda-de-casino');
await p.waitForTimeout(700);
await p.click('.level-acc-btn:has-text("Foundations")');
await p.waitForTimeout(600);
out.classAccordionOpens = await p.evaluate(() => document.querySelectorAll('.move-card').length);

// 4. Levels page accordion
await p.goto('http://localhost:5199/?tab=levels');
await p.waitForTimeout(700);
await p.click('.level-page-btn:has-text("Beginner")');
await p.waitForTimeout(600);
out.levelsAccordionOpens = await p.evaluate(() => document.querySelectorAll('.move-card').length);

out.pageErrors = errors;
console.log(JSON.stringify(out, null, 1));
await browser.close();
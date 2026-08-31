// Deep video-play check: click facade, wait, inspect YT player state via postMessage API
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await p.goto('http://localhost:5199/?move=move-foundations-foundational-body-mechanics-and-rhythm&style=');
await p.waitForTimeout(1000);

const before = await p.evaluate(() => document.querySelectorAll('iframe').length);
// click the video facade play button
await p.click('button[aria-label*="Play" i]').catch(() => {});
await p.waitForTimeout(4000);
const after = await p.evaluate(() => {
  const iframes = [...document.querySelectorAll('iframe')];
  return {
    iframes: iframes.length,
    srcs: iframes.map((f) => f.src.slice(0, 80)),
  };
});
// Verify the YT iframe is actually alive & playing via playback state: use YT API on contentWindow
const playState = await p.evaluate(async () => {
  const f = document.querySelector('iframe[src*="youtube"]');
  if (!f) return { error: 'no iframe' };
  // send getCurrentTime ping via YT JS API handshake
  return new Promise((resolve) => {
    let answered = false;
    const onMsg = (e) => {
      try {
        const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (d?.event === 'infoDelivery' && d.info?.playerState !== undefined) {
          answered = true;
          window.removeEventListener('message', onMsg);
          resolve({ playerState: d.info.playerState, currentTime: d.info.currentTime });
        }
      } catch {}
    };
    window.addEventListener('message', onMsg);
    f.contentWindow.postMessage(JSON.stringify({
      event: 'listening', id: 1, channel: 'widget',
    }), '*');
    setTimeout(() => {
      if (!answered) {
        window.removeEventListener('message', onMsg);
        resolve({ answered: false, note: 'iframe alive but handshake inconclusive (autoplay may be blocked in headless)' });
      }
    }, 2500);
  });
});
console.log(JSON.stringify({ iframesBeforeFacadeClick: before, afterFacadeClick: after, playback: playState }, null, 1));
await browser.close();
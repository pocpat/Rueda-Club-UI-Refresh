#!/usr/bin/env node
/**
 * Link Checker Script — checks all YouTube video URLs in data.json.
 * Prints dead links with "will be fixed soon" notes and replacement suggestions.
 *
 * Run: node tests/scripts/check-links.mjs
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(__dirname, '../../src/data.json');
const data = JSON.parse(readFileSync(dataPath, 'utf-8'));

// Collect all video URLs
const allEntries = [];
for (const move of data.moves) {
  for (const video of move.videos || []) {
    if (video.url) {
      allEntries.push({ moveId: move.id, moveName: move.name, url: video.url, videoTitle: video.title });
    }
  }
}
const uniqueUrls = [...new Set(allEntries.map((e) => e.url))];

console.log(`\n🔍 Checking ${uniqueUrls.length} unique YouTube URLs across ${allEntries.length} video entries...\n`);

function extractVideoId(url) {
  const match = url.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]{11})/);
  return match ? match[1] : null;
}

async function checkUrl(url) {
  const videoId = extractVideoId(url);
  if (!videoId) return { ok: false, reason: 'Could not extract video ID' };

  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(oembedUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) return { ok: true, title: (await res.json()).title };
    if (res.status === 401 || res.status === 403) return { ok: true, reason: 'Restricted but exists' };
    if (res.status === 404) return { ok: false, reason: 'Video not found (404 — likely deleted or private)' };
    return { ok: false, reason: `HTTP ${res.status}` };
  } catch (e) {
    if (e.name === 'AbortError') return { ok: false, reason: 'Timeout (15s)' };
    return { ok: false, reason: e.message };
  }
}

// Search YouTube for a replacement suggestion
function suggestReplacement(moveName, videoTitle) {
  const query = encodeURIComponent(`${moveName} rueda de casino cuban dance`);
  return `https://www.youtube.com/results?search_query=${query}`;
}

async function main() {
  const dead = [];
  let checked = 0;

  for (const url of uniqueUrls) {
    const result = await checkUrl(url);
    checked++;
    process.stdout.write(`  [${checked}/${uniqueUrls.length}] ${result.ok ? '✓' : '✗'} ${url}\r`);

    if (!result.ok) {
      const entries = allEntries.filter((e) => e.url === url);
      dead.push({ url, ...result, entries });
    }
  }

  console.log('\n');
  if (dead.length === 0) {
    console.log('  ✅ All video links are reachable!\n');
    return;
  }

  console.log(`  ⚠️  ${dead.length} dead link(s) found:\n`);
  console.log('══════════════════════════════════════════════════════════════');
  for (const d of dead) {
    console.log(`\n  ✗ ${d.url}`);
    console.log(`    Reason: ${d.reason}`);
    for (const entry of d.entries) {
      console.log(`    Used in: "${entry.moveName}" — video: "${entry.videoTitle}"`);
      console.log(`    🔧 Will be fixed soon — search for replacement:`);
      console.log(`       ${suggestReplacement(entry.moveName, entry.videoTitle)}`);
    }
  }
  console.log('\n══════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
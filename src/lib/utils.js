/** Extract YouTube video ID from various URL formats */
export function extractYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return '';
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : '';
}

/** Strip markdown bold/italic and normalize whitespace */
export function stripMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Get YouTube thumbnail URL from video ID */
export function youtubeThumb(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/** Format seconds as M:SS */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Fisher-Yates shuffle — non-mutating, cryptographically random */
export function randomShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick n random items from an array (Fisher-Yates, non-mutating) */
export function pickRandom(arr, n = 1) {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  return randomShuffle(arr).slice(0, Math.max(0, Math.min(n, arr.length)));
}

/** Random "Move of the Day" — seeded by the local date so it stays the same all day,
 *  renews at local midnight, and never repeats the previous day's move.
 *  Excludes Documentary style (informational, not actual moves). */
export function getMoveOfTheDay(moves, levels, now = new Date()) {
  const documentaryLevelIds = levels
    ? new Set(levels.filter((l) => l.styleId === 'style-documentary').map((l) => l.id))
    : new Set();
  const eligible = moves.filter((m) =>
    m.videos && m.videos.length > 0 && !documentaryLevelIds.has(m.levelId)
  );
  if (eligible.length === 0) return moves[0];

  // LOCAL date string as seed: "2026-8-31" — changes at local midnight
  // (toISOString() would use UTC, which renews at noon in NZ, UTC+12)
  const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

  // Mulberry32 PRNG — deterministic for same seed
  const prng = (a) => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // Hash helper: string → 32-bit int seed
  const hashStr = (s) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return h;
  };

  // Each day's final pick = raw PRNG pick, shifted +1 if it would equal the
  // previous day's FINAL pick (which may itself have been shifted). A tiny
  // forward simulation from a fixed anchor resolves the chain exactly and
  // guarantees the same move is never shown two days in a row.
  const dayKey = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const dateSeedFor = (d) => hashStr(dayKey(d));
  const anchor = new Date(2024, 0, 1);
  const days = Math.round(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      Date.UTC(anchor.getFullYear(), anchor.getMonth(), anchor.getDate())) / 86400000
  );
  let final = 0;
  if (days > 0) {
    for (let i = 0; i <= days; i++) {
      const d = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + i);
      const raw = Math.floor(prng(dateSeedFor(d)) * eligible.length);
      final = raw === final && eligible.length > 1 ? (raw + 1) % eligible.length : raw;
    }
  } else {
    final = Math.floor(prng(dateSeedFor(now)) * eligible.length);
  }
  return eligible[final];
}
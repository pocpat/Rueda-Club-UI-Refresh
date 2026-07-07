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

/** Random "Move of the Day" — seeded by date so it stays the same all day,
 *  then picks a new random move at midnight (nighttime rollover).
 *  Excludes Documentary style (informational, not actual moves). */
export function getMoveOfTheDay(moves, levels) {
  const now = new Date();
  const documentaryLevelIds = levels
    ? new Set(levels.filter((l) => l.styleId === 'style-documentary').map((l) => l.id))
    : new Set();
  const eligible = moves.filter((m) =>
    m.videos && m.videos.length > 0 && !documentaryLevelIds.has(m.levelId)
  );
  if (eligible.length === 0) return moves[0];

  // Date string as seed: "2026-07-07" — changes at midnight
  const dateStr = now.toISOString().slice(0, 10);

  // Simple string hash → 32-bit int
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = ((seed << 5) - seed + dateStr.charCodeAt(i)) | 0;
  }

  // Mulberry32 PRNG — deterministic for same seed
  const prng = (a) => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const idx = Math.floor(prng(seed) * eligible.length);
  return eligible[idx];
}
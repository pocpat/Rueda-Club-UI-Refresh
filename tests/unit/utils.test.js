import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractYouTubeVideoId, stripMarkdown, youtubeThumb, formatTime, getMoveOfTheDay } from '../../src/lib/utils.js';

describe('extractYouTubeVideoId', () => {
  it('extracts from standard watch URL', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=U454lXjpKi8')).toBe('U454lXjpKi8');
  });

  it('extracts from youtu.be short URL', () => {
    expect(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts from shorts URL', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/shorts/abcdefghijk')).toBe('abcdefghijk');
  });

  it('extracts from embed URL', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/embed/U454lXjpKi8')).toBe('U454lXjpKi8');
  });

  it('returns empty string for non-YouTube URL', () => {
    expect(extractYouTubeVideoId('https://vimeo.com/123456')).toBe('');
  });

  it('returns empty string for empty/null input', () => {
    expect(extractYouTubeVideoId('')).toBe('');
    expect(extractYouTubeVideoId(null)).toBe('');
    expect(extractYouTubeVideoId(undefined)).toBe('');
  });

  it('returns empty string for malformed video ID (wrong length)', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=short')).toBe('');
  });
});

describe('stripMarkdown', () => {
  it('removes bold markers', () => {
    expect(stripMarkdown('**bold text**')).toBe('bold text');
  });

  it('removes italic markers', () => {
    expect(stripMarkdown('*italic text*')).toBe('italic text');
  });

  it('handles mixed bold and italic', () => {
    expect(stripMarkdown('**bold** and *italic*')).toBe('bold and italic');
  });

  it('normalizes newlines to spaces', () => {
    expect(stripMarkdown('line1\nline2')).toBe('line1 line2');
  });

  it('collapses multiple whitespace', () => {
    expect(stripMarkdown('extra   spaces   here')).toBe('extra spaces here');
  });

  it('returns empty string for falsy input', () => {
    expect(stripMarkdown('')).toBe('');
    expect(stripMarkdown(null)).toBe('');
  });
});

describe('youtubeThumb', () => {
  it('generates hqdefault thumbnail URL', () => {
    expect(youtubeThumb('dQw4w9WgXcQ')).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  });
});

describe('formatTime', () => {
  it('formats zero seconds', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('formats under a minute', () => {
    expect(formatTime(45)).toBe('0:45');
  });

  it('formats exactly one minute', () => {
    expect(formatTime(60)).toBe('1:00');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('2:05');
  });

  it('formats large values', () => {
    expect(formatTime(3661)).toBe('61:01');
  });
});

describe('getMoveOfTheDay', () => {
  const mockMoves = [
    { id: 'move-1', levelId: 'lvl-1', videos: [{ url: 'https://www.youtube.com/watch?v=aaa11111111' }] },
    { id: 'move-2', levelId: 'lvl-1', videos: [{ url: 'https://www.youtube.com/watch?v=bbb22222222' }] },
    { id: 'move-3', levelId: 'lvl-doc', videos: [{ url: 'https://www.youtube.com/watch?v=ccc33333333' }] },
    { id: 'move-4', levelId: 'lvl-1', videos: [] },
  ];

  const mockLevels = [
    { id: 'lvl-1', styleId: 'style-rueda-de-casino' },
    { id: 'lvl-doc', styleId: 'style-documentary' },
  ];

  beforeEach(() => {
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-07-07T12:00:00.000Z');
  });

  it('returns a move with videos (never one without)', () => {
    const result = getMoveOfTheDay(mockMoves, mockLevels);
    expect(result.videos.length).toBeGreaterThan(0);
  });

  it('excludes Documentary style moves', () => {
    // Run multiple times — Documentary move should never appear
    const results = new Set();
    for (let day = 1; day <= 365; day++) {
      const dateStr = `2026-${String(Math.floor(day / 30) + 1).padStart(2, '0')}-${String((day % 28) + 1).padStart(2, '0')}T12:00:00.000Z`;
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(dateStr);
      const r = getMoveOfTheDay(mockMoves, mockLevels);
      results.add(r.id);
    }
    expect(results.has('move-3')).toBe(false);
    expect(results.has('move-4')).toBe(false); // no videos
  });

  it('returns same move for the same date (deterministic)', () => {
    const r1 = getMoveOfTheDay(mockMoves, mockLevels);
    const r2 = getMoveOfTheDay(mockMoves, mockLevels);
    expect(r1.id).toBe(r2.id);
  });

  it('returns first move as fallback if no eligible moves', () => {
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-07-07T12:00:00.000Z');
    const noVideoMoves = [{ id: 'move-x', levelId: 'lvl-1', videos: [] }];
    expect(getMoveOfTheDay(noVideoMoves, mockLevels).id).toBe('move-x');
  });

  it('handles missing levels argument gracefully', () => {
    const result = getMoveOfTheDay(mockMoves);
    expect(result).toBeDefined();
    expect(result.videos.length).toBeGreaterThan(0);
  });
});
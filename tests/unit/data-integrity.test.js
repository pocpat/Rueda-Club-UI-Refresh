import { describe, it, expect } from 'vitest';
import clubData from '../../src/data.json';

describe('Data integrity — data.json', () => {
  it('has 4 styles', () => {
    expect(clubData.styles.length).toBe(4);
  });

  it('has expected style IDs', () => {
    const ids = clubData.styles.map((s) => s.id);
    expect(ids).toContain('style-rueda-de-casino');
    expect(ids).toContain('style-son-cubano');
    expect(ids).toContain('style-documentary');
    expect(ids).toContain('style-musicality');
  });

  it('all styles have themeColor', () => {
    clubData.styles.forEach((s) => {
      expect(s.themeColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('has 11 levels', () => {
    expect(clubData.levels.length).toBe(11);
  });

  it('all levels reference a valid styleId', () => {
    const styleIds = new Set(clubData.styles.map((s) => s.id));
    clubData.levels.forEach((l) => {
      expect(styleIds.has(l.styleId)).toBe(true);
    });
  });

  it('all move levelIds reference a valid level', () => {
    const levelIds = new Set(clubData.levels.map((l) => l.id));
    clubData.moves.forEach((m) => {
      expect(levelIds.has(m.levelId)).toBe(true);
    });
  });

  it('all move IDs are unique', () => {
    const ids = clubData.moves.map((m) => m.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all level IDs are unique', () => {
    const ids = clubData.levels.map((l) => l.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('every move has required fields (id, name, levelId)', () => {
    clubData.moves.forEach((m) => {
      expect(m.id).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect(m.levelId).toBeTruthy();
    });
  });

  it('video URLs are valid YouTube links', () => {
    clubData.moves.forEach((m) => {
      m.videos?.forEach((v) => {
        if (v.url) {
          expect(v.url).toMatch(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//);
        }
      });
    });
  });

  it('video thumbnails are valid URLs', () => {
    clubData.moves.forEach((m) => {
      m.videos?.forEach((v) => {
        if (v.thumbnail) {
          expect(v.thumbnail).toMatch(/^https?:\/\//);
        }
      });
    });
  });

  it('has 224 moves total', () => {
    expect(clubData.moves.length).toBe(224);
  });

  it('Documentary has 19 moves (informational, not dance moves)', () => {
    const docLevelIds = clubData.levels
      .filter((l) => l.styleId === 'style-documentary')
      .map((l) => l.id);
    const docMoves = clubData.moves.filter((m) => docLevelIds.includes(m.levelId));
    expect(docMoves.length).toBe(19);
  });
});
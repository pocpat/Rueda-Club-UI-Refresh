import { describe, it, expect } from 'vitest';
import { getMoveOfTheDay } from '../../src/lib/utils.js';

// One Documentary level + one normal level; docs moves must be excluded from the draw
const levels = [
  { id: 'lvl-doc', styleId: 'style-documentary', name: 'Documentary' },
  { id: 'lvl-a', styleId: 'style-rueda-de-casino', name: 'Foundations' },
];

const moves = Array.from({ length: 30 }, (_, i) => ({
  id: `move-${i + 1}`,
  name: `Move ${i + 1}`,
  levelId: i < 5 ? 'lvl-doc' : 'lvl-a', // first 5 are Documentary
  description: 'x',
  videos: [{ url: 'https://www.youtube.com/watch?v=abc', title: 'v' }],
}));

const day = (y, m, d, h = 12) => new Date(y, m - 1, d, h, 0, 0);

describe('getMoveOfTheDay', () => {
  it('excludes Documentary moves', () => {
    for (let i = 0; i < 30; i++) {
      const picked = getMoveOfTheDay(moves, levels, day(2026, 8, 1 + (i % 28)));
      expect(picked.levelId).not.toBe('lvl-doc');
    }
  });

  it('keeps the same move all day (morning == evening)', () => {
    const morning = getMoveOfTheDay(moves, levels, day(2026, 8, 31, 0, 1));
    const evening = getMoveOfTheDay(moves, levels, day(2026, 8, 31, 23, 59));
    expect(evening.id).toBe(morning.id);
  });

  it('renews at local midnight (day 1 != day 2)', () => {
    const d1 = getMoveOfTheDay(moves, levels, day(2026, 8, 31, 12));
    const d2 = getMoveOfTheDay(moves, levels, day(2026, 9, 1, 12));
    expect(d2.id).not.toBe(d1.id);
  });

  it('never picks the same move two days in a row over a full year', () => {
    let prev = null;
    const d = day(2026, 1, 1);
    for (let i = 0; i < 365; i++) {
      const picked = getMoveOfTheDay(moves, levels, d);
      if (prev) expect(picked.id).not.toBe(prev);
      prev = picked.id;
      d.setDate(d.getDate() + 1);
    }
  });
});
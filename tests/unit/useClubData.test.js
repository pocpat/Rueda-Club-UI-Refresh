import { describe, it, expect } from 'vitest';
import { getLevelsForStyle, getMovesForLevel, getMovesForStyle, findMove, calcStats } from '../../src/hooks/useClubData.js';
import clubData from '../../src/data.json';

describe('getLevelsForStyle', () => {
  it('returns levels for Rueda de Casino', () => {
    const levels = getLevelsForStyle(clubData, 'style-rueda-de-casino');
    expect(levels.length).toBeGreaterThan(0);
    levels.forEach((l) => expect(l.styleId).toBe('style-rueda-de-casino'));
  });

  it('returns levels for Documentary', () => {
    const levels = getLevelsForStyle(clubData, 'style-documentary');
    expect(levels.length).toBe(4);
  });

  it('returns empty array for unknown style', () => {
    expect(getLevelsForStyle(clubData, 'nonexistent')).toEqual([]);
  });
});

describe('getMovesForLevel', () => {
  it('returns moves for a known level', () => {
    const moves = getMovesForLevel(clubData, 'lvl-foundations');
    expect(moves.length).toBeGreaterThan(0);
    moves.forEach((m) => expect(m.levelId).toBe('lvl-foundations'));
  });

  it('returns empty array for unknown level', () => {
    expect(getMovesForLevel(clubData, 'nonexistent')).toEqual([]);
  });
});

describe('getMovesForStyle', () => {
  it('returns moves for Rueda de Casino via its levels', () => {
    const moves = getMovesForStyle(clubData, 'style-rueda-de-casino');
    expect(moves.length).toBeGreaterThan(0);
  });

  it('returns empty for unknown style', () => {
    expect(getMovesForStyle(clubData, 'nonexistent')).toEqual([]);
  });
});

describe('findMove', () => {
  it('finds a move by ID', () => {
    const first = clubData.moves[0];
    expect(findMove(clubData, first.id)).toBe(first);
  });

  it('returns undefined for non-existent ID', () => {
    expect(findMove(clubData, 'does-not-exist')).toBeUndefined();
  });
});

describe('calcStats', () => {
  it('calculates 0% when nothing completed', () => {
    const stats = calcStats(clubData.moves.slice(0, 10), []);
    expect(stats.completed).toBe(0);
    expect(stats.percent).toBe(0);
    expect(stats.total).toBe(10);
  });

  it('calculates 50% when half completed', () => {
    const moves = clubData.moves.slice(0, 10);
    const completed = moves.slice(0, 5).map((m) => m.id);
    const stats = calcStats(moves, completed);
    expect(stats.completed).toBe(5);
    expect(stats.percent).toBe(50);
  });

  it('handles empty moves array', () => {
    const stats = calcStats([], []);
    expect(stats.total).toBe(0);
    expect(stats.percent).toBe(0);
  });

  it('calculates 100%', () => {
    const moves = clubData.moves.slice(0, 4);
    const completed = moves.map((m) => m.id);
    const stats = calcStats(moves, completed);
    expect(stats.percent).toBe(100);
  });
});
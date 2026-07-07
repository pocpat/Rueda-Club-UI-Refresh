import clubData from '../lib/data.js';

/** Get levels for a given style */
export function getLevelsForStyle(data, styleId) {
  return data.levels.filter((l) => l.styleId === styleId);
}

/** Get moves for a given level */
export function getMovesForLevel(data, levelId) {
  return data.moves.filter((m) => m.levelId === levelId);
}

/** Get moves for a given style (via its levels) */
export function getMovesForStyle(data, styleId) {
  const levelIds = data.levels.filter((l) => l.styleId === styleId).map((l) => l.id);
  return data.moves.filter((m) => levelIds.includes(m.levelId));
}

/** Find a move by ID */
export function findMove(data, moveId) {
  return data.moves.find((m) => m.id === moveId);
}

/** Calculate completion stats */
export function calcStats(moves, completedMoves) {
  const total = moves.length;
  const completed = moves.filter((m) => completedMoves.includes(m.id)).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percent };
}

export { clubData };
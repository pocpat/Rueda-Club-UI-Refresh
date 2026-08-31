import Chevron from './Chevron.jsx';
import MoveCard from './MoveCard.jsx';
import { getMovesForLevel, calcStats } from '../hooks/useClubData.js';

/** Level accordion header per new design:
 *  - Level name in navbar-blue, plain (no card behind)
 *  - Description + progress bar stay
 *  - Completed/total counter = blue badge (navbar blue), white text
 *  - Chevron trigger = red circle button (red BG + white font)
 *  - Lesson grid content unchanged */
export default function LevelSection({ data, level, styleColor, isOpen, onToggle, completedMoves, onSelectMove, onToggleComplete, onSpeak, isFavorite, onToggleFavorite }) {
  const moves = getMovesForLevel(data, level.id);
  if (moves.length === 0) return null;

  const stats = calcStats(moves, completedMoves);

  return (
    <div className="mb-2 last:mb-0 rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: 'transparent' }}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`content-level-${level.id}`}
        className="level-acc-btn w-full text-left cursor-pointer flex items-center gap-3 p-3 md:p-4 border-none bg-transparent rounded-2xl"
      >
        <div className="flex-grow flex flex-col items-start gap-1">
          <h3 className="level-acc-title font-[var(--font-heading)] text-base md:text-lg font-semibold">
            {level.name}
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{level.description}</p>
          {/* Progress bar — gradient line */}
          <div className="w-full max-w-[250px] h-2 rounded-full mt-1 overflow-hidden" style={{ background: 'var(--stat-ring-track)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${stats.percent}%`,
                background: `linear-gradient(90deg, ${styleColor}, ${styleColor}aa)`,
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="level-acc-count text-xs font-bold px-2.5 py-1 rounded-full" aria-label={`${stats.completed} of ${stats.total} completed`}>
            {stats.completed}/{stats.total}
          </span>
          <Chevron open={isOpen} red />
        </div>
      </button>

      <div className={`accordion-grid ${isOpen ? 'is-open' : ''}`}>
        <div className="accordion-inner">
          {isOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-2 md:p-3">
              {moves.map((move) => (
                <MoveCard
                  key={move.id}
                  move={move}
                  isCompleted={completedMoves.includes(move.id)}
                  onSelectMove={onSelectMove}
                  onToggleComplete={onToggleComplete}
                  onSpeak={onSpeak}
                  isFavorite={isFavorite ? isFavorite(move.id) : false}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
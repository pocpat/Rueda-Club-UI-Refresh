import { useState } from 'react';
import MoveCard from './MoveCard.jsx';
import Chevron from './Chevron.jsx';
import { getMovesForLevel, calcStats } from '../hooks/useClubData.js';

/** LevelsPage (?tab=levels) — lessons grouped by level across all styles.
 *  Every section starts CLOSED (keeps the page short); the red circle chevron
 *  opens a level, and the lesson list animates in like the class-page accordions. */
export default function LevelsPage({ data, completedMoves, onSelectMove, onToggleComplete, onSpeak, isFavorite, onToggleFavorite }) {
  const levels = data.levels.filter((level) => getMovesForLevel(data, level.id).length > 0);
  const [openLevelId, setOpenLevelId] = useState(null);

  return (
    <div className="tab-fade">
      {/* Header — same style as class pages */}
      <div className="class-page-head mb-6">
        <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--header-bg)' }}>
          Levels
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Every lesson grouped by level — tap a level to see its lessons.
        </p>
      </div>

      {levels.map((level) => {
        const moves = getMovesForLevel(data, level.id);
        const stats = calcStats(moves, completedMoves);
        const isOpen = openLevelId === level.id;
        return (
          <section key={level.id} className="level-acc-wrap mb-3 rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-2)', boxShadow: 'var(--shadow-sm)' }}
          >
            <button
              type="button"
              onClick={() => setOpenLevelId((p) => (p === level.id ? null : level.id))}
              aria-expanded={isOpen}
              aria-controls={`levels-content-${level.id}`}
              className="level-page-btn w-full text-left cursor-pointer border-none bg-transparent"
            >
              <div className="level-page-head">
                <div className="flex-grow flex flex-col items-start gap-1">
                  <h3 className="level-acc-title font-[var(--font-heading)] text-base md:text-lg font-semibold">
                    {level.name}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{level.description}</p>
                </div>
                <span className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <span className="level-acc-count text-xs font-bold px-2.5 py-1 rounded-full"
                    aria-label={`${stats.completed} of ${stats.total} completed`}>
                    {stats.completed}/{stats.total}
                  </span>
                  <Chevron open={isOpen} red />
                </span>
              </div>
            </button>

            <div className={`accordion-grid ${isOpen ? 'is-open' : ''}`}>
              <div className="accordion-inner">
                {isOpen && (
                  <div className="px-2 md:px-3 pb-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
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
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
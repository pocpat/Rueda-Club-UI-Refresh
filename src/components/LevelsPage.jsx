import MoveCard from './MoveCard.jsx';
import { getMovesForLevel, calcStats } from '../hooks/useClubData.js';

/** LevelsPage (?tab=levels) — lessons grouped by level across all styles.
 *  Each level = its own white section with heading + counter, listing every
 *  lesson of that level (e.g. Beginner shows all Rueda Beginner + Son Beginner lessons). */
export default function LevelsPage({ data, completedMoves, onSelectMove, onToggleComplete, onSpeak, isFavorite, onToggleFavorite }) {
  const levels = data.levels.filter((level) => getMovesForLevel(data, level.id).length > 0);
  const styleMap = new Map(data.styles.map((s) => [s.id, s]));

  return (
    <div className="tab-fade">
      {/* Header — same style as class pages */}
      <div className="class-page-head mb-6">
        <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--header-bg)' }}>
          Levels
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Every lesson grouped by level — beginners to advanced, all styles together.
        </p>
      </div>

      {levels.map((level) => {
        const moves = getMovesForLevel(data, level.id);
        const stats = calcStats(moves, completedMoves);
        const style = styleMap.get(level.styleId);
        return (
          <section key={level.id} className="level-acc-wrap mb-3 rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-2)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="level-page-head">
              <div className="flex-grow flex flex-col items-start gap-1">
                <h3 className="level-acc-title font-[var(--font-heading)] text-base md:text-lg font-semibold">
                  {level.name}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{level.description}</p>
              </div>
              <span className="level-acc-count text-xs font-bold px-2.5 py-1 rounded-full"
                aria-label={`${stats.completed} of ${stats.total} completed`}>
                {stats.completed}/{stats.total}
              </span>
            </div>

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
          </section>
        );
      })}
    </div>
  );
}
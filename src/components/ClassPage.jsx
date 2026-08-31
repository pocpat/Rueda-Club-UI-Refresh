import { useState } from 'react';
import LevelSection from './LevelSection.jsx';
import { getLevelsForStyle, getMovesForStyle, calcStats } from '../hooks/useClubData.js';

/** Class page — the old accordion behaviour, as its own page (?style=<id>).
 *  Level accordions stay inline; the STYLE level moved to dedicated pages. */
export default function ClassPage({
  data, style, completedMoves, onSelectMove, onToggleComplete, onSpeak,
  isFavorite, onToggleFavorite,
}) {
  const [openLevelId, setOpenLevelId] = useState(null);
  const levels = getLevelsForStyle(data, style.id);
  const styleMoves = getMovesForStyle(data, style.id);
  const stats = calcStats(styleMoves, completedMoves);
  const color = style.themeColor;
  const openLevel = levels.find((l) => l.id === openLevelId);

  return (
    <div className="tab-fade">
      {/* Header — plain on the grey page background (no white card) */}
      <div className="class-page-head mb-6" style={{ '--style-color': color }}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="style-dot" />
          <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl font-extrabold" style={{ color }}>
            {style.name}
          </h2>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
            Level {stats.percent}% · {stats.completed}/{stats.total}
          </span>
        </div>
        <p className="mt-2 text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
          {style.description} Choose a level below — each lesson has videos and chapters.
        </p>
      </div>

      {levels.length > 0 ? (
        <>
          {/* One white section wrapping ALL level accordions */}
          <div className="class-page-body">
            {levels.map((level) => (
              <LevelSection
                key={level.id}
                data={data}
                level={level}
                styleColor={color}
                isOpen={openLevelId === level.id}
                onToggle={() => setOpenLevelId((p) => (p === level.id ? null : level.id))}
                completedMoves={completedMoves}
                onSelectMove={onSelectMove}
                onToggleComplete={onToggleComplete}
                onSpeak={onSpeak}
                isFavorite={isFavorite}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
          {openLevel && (
            <p className="text-xs mt-4 mb-2" style={{ color: 'var(--text-muted)' }}>
              Tip: "{openLevel.name}" opens its lesson list here — tap any lesson to watch.
            </p>
          )}
        </>
      ) : (
        <div className="py-14 text-center rounded-2xl" style={{ border: '1px dashed var(--glass-border)', color: 'var(--text-secondary)' }}>
          <div className="text-3xl mb-2">🎵</div>
          <p>Content coming soon.</p>
        </div>
      )}
    </div>
  );
}
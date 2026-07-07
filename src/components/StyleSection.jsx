import Chevron from './Chevron.jsx';
import LevelSection from './LevelSection.jsx';
import ProgressRing from './ProgressRing.jsx';
import { getLevelsForStyle, getMovesForStyle, calcStats } from '../hooks/useClubData.js';

/** Style section with circular progress ring and vibrant accent colors */
export default function StyleSection({
  data, style, isOpen, onToggle,
  openLevelId, onToggleLevel,
  completedMoves, onSelectMove, onToggleComplete, onSpeak,
}) {
  const levels = getLevelsForStyle(data, style.id);
  const styleMoves = getMovesForStyle(data, style.id);
  const stats = calcStats(styleMoves, completedMoves);

  return (
    <div
      className={`mb-8 rounded-3xl overflow-hidden transition-all duration-400 style-section-glass${isOpen ? ' style-section-glass--open' : ''}`}
      style={{
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        '--style-color': style.themeColor,
        contentVisibility: 'auto',
        containIntrinsicSize: '800px',
      }}
      data-style-color={style.themeColor}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`content-style-${style.id}`}
        className="w-full text-left cursor-pointer flex items-center gap-4 p-5 md:p-7 transition-all duration-300 border-none bg-transparent"
        style={{ background: isOpen ? `linear-gradient(135deg, ${style.themeColor}10, transparent)` : 'transparent' }}
      >
        {/* Circular progress ring */}
        <ProgressRing percent={stats.percent} size={64} stroke={4} color={style.themeColor}>
          <div className="text-center">
            <div className="text-xs font-bold" style={{ color: style.themeColor }}>{stats.percent}%</div>
          </div>
        </ProgressRing>

        {/* Style info */}
        <div className="flex-grow flex flex-col items-start gap-1 min-w-0">
          <h2
            className="font-[var(--font-display)] text-xl md:text-2xl lg:text-3xl font-semibold"
            style={{ color: style.themeColor, textShadow: `0 0 20px ${style.themeColor}30` }}
          >
            {style.name}
          </h2>
          <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>{style.description}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full" style={{ background: style.themeColor }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {stats.completed} / {stats.total} moves mastered
            </span>
          </div>
        </div>

        <Chevron open={isOpen} />
      </button>

      <div className={`accordion-grid ${isOpen ? 'is-open' : ''}`}>
        <div className="accordion-inner">
          {isOpen && (
            <div className="px-3 md:px-5 pb-5">
              {levels.length > 0 ? (
                levels.map((level) => (
                  <LevelSection
                    key={level.id}
                    data={data}
                    level={level}
                    styleColor={style.themeColor}
                    isOpen={openLevelId === level.id}
                    onToggle={() => onToggleLevel(level.id)}
                    completedMoves={completedMoves}
                    onSelectMove={onSelectMove}
                    onToggleComplete={onToggleComplete}
                    onSpeak={onSpeak}
                  />
                ))
              ) : (
                <div className="py-12 text-center" style={{ color: 'var(--text-secondary)' }}>
                  <div className="text-3xl mb-2">🎵</div>
                  <p>Content coming soon.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
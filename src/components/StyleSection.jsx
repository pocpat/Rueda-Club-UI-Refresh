import LevelSection from './LevelSection.jsx';
import { getLevelsForStyle, getMovesForStyle, calcStats } from '../hooks/useClubData.js';

/** Style section — glass card matching DepthFold reference structure:
 *  Bright gradient bg → full glass overlay (inset, top-right radius 100%)
 *  → orbit circles top-right → content below circles → bottom bar with
 *  social/stat circles left + "Open ▼" right. */
export default function StyleSection({
  data, style, isOpen, onToggle,
  openLevelId, onToggleLevel,
  completedMoves, onSelectMove, onToggleComplete, onSpeak,
}) {
  const levels = getLevelsForStyle(data, style.id);
  const styleMoves = getMovesForStyle(data, style.id);
  const stats = calcStats(styleMoves, completedMoves);
  const color = style.themeColor;

  return (
    <div
      className={`mb-6 style-card-wrapper${isOpen ? ' style-card-wrapper--open' : ''}`}
      style={{ '--style-color': color }}
      data-style-color={color}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`content-style-${style.id}`}
        className="style-card-btn"
      >
        {/* Gradient background — bright color to almost white */}
        <div className="style-card-bg" />

        {/* Glass overlay — covers entire card (inset 8px),
            border-top-right-radius: 100% creates the curve */}
        <div className="style-card-glass" />

        {/* Orbiting glass circles — top right corner (decorative) */}
        <div className="style-card-orbits" aria-hidden="true">
          <span className="style-orbit style-orbit--1" />
          <span className="style-orbit style-orbit--2" />
          <span className="style-orbit style-orbit--3" />
          <span className="style-orbit style-orbit--4" />
          <span className="style-orbit style-orbit--icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4" fill="currentColor" />
            </svg>
          </span>
        </div>

        {/* Content — title + description, below the circles area */}
        <div className="style-card-content">
          <span className="style-card-title" style={{ color: color }}>
            {style.name}
          </span>
          <span className="style-card-desc">{style.description}</span>
        </div>

        {/* Bottom bar — stat circles left + Open ▼ right */}
        <div className="style-card-bottom">
          <div className="style-card-stats">
            <span className="style-stat" style={{ '--stat-color': color }}>
              <svg className="style-stat-ring" viewBox="0 0 36 36" aria-hidden="true">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3"
                  strokeDasharray={`${(stats.percent / 100) * 94.2} 94.2`}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <span className="style-stat-value">{stats.percent}%</span>
            </span>
            <span className="style-stat" style={{ '--stat-color': color }}>
              <span className="style-stat-badge">{stats.completed}</span>
            </span>
            <span className="style-stat" style={{ '--stat-color': color }}>
              <span className="style-stat-badge">{stats.total}</span>
            </span>
          </div>

          <div className="style-card-more">
            <span className="style-card-open-text">{isOpen ? 'Close' : 'Open'}</span>
            <svg className="style-card-chevron-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
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
                    styleColor={color}
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
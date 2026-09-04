import { getLevelsForStyle, getMovesForStyle, calcStats } from '../hooks/useClubData.js';

/** Style card on the Search page — same clean UI as the class pages:
 *  glass card, style dot + colored title + level badge + description + Open chevron.
 *  Whole card is one button that opens the style's class page. */
export default function StyleSection({
  data, style, onToggle,
}) {
  const levels = getLevelsForStyle(data, style.id);
  const styleMoves = getMovesForStyle(data, style.id);
  const stats = calcStats(styleMoves, []);
  const color = style.themeColor;
  const hasContent = stats.total > 0;

  return (
    <div className="mb-4" style={{ '--style-color': color }}>
      <button
        onClick={onToggle}
        aria-label={`Open ${style.name} class page`}
        className="style-tile-btn w-full text-left"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="style-dot" />
          <span
            className="font-[var(--font-heading)] text-xl md:text-2xl font-extrabold"
            style={{ color: 'var(--accent-2)' }}
          >
            {style.name}
          </span>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ background: 'var(--glass-2)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}
          >
            {hasContent ? `${stats.total} lessons · ${levels.length} levels` : 'Coming soon'}
          </span>
          <span className="ml-auto flex items-center gap-1.5 font-[var(--font-jakarta)] font-extrabold text-xs uppercase tracking-widest"
            style={{ color }}
          >
            Open
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {style.description}
        </p>
      </button>
    </div>
  );
}
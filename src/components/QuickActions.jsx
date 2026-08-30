/** Quick Actions — square tiles (mockup style: white cards, crimson icon circles)
 *  + Level chips row (Foundations…Advanced, Son levels). */
export default function QuickActions({ levels, onFindClass, onPlayMusic, onChallenge, onSelectLevel }) {
  const tiles = [
    {
      label: 'Find class',
      sub: 'Watch & repeat tutorial',
      onClick: onFindClass,
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      label: 'Play music',
      sub: 'Musicality playlist',
      onClick: onPlayMusic,
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      ),
    },
    {
      label: 'Dance challenge',
      sub: 'Random Rueda or Son',
      onClick: onChallenge,
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" />
          <path d="M17 5h3a1 1 0 0 1 1 1c0 2.5-2 4-4 4" />
          <path d="M7 5H4a1 1 0 0 0-1 1c0 2.5 2 4 4 4" />
        </svg>
      ),
    },
    {
      label: 'Level',
      sub: 'Foundations → Advanced',
      onClick: onSelectLevel,
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2 2 7l10 5 10-5-10-5z" />
          <path d="M2 12l10 5 10-5" />
          <path d="M2 17l10 5 10-5" />
        </svg>
      ),
    },
  ];

  return (
    <section className="mb-10" aria-label="Quick actions">
      <h2 className="font-[var(--font-heading)] text-lg font-semibold mb-3">Quick Actions</h2>
      <div className="quick-tiles">
        {tiles.map((t) => (
          <button key={t.label} className="quick-tile" onClick={t.onClick}>
            <span className="quick-tile-icon">{t.icon}</span>
            <span className="quick-tile-label">{t.label}</span>
            <span className="quick-tile-sub">{t.sub}</span>
          </button>
        ))}
      </div>

      {/* Level chips — jump straight to that level on its class page */}
      <div className="level-chips mt-4">
        {levels.map((l) => (
          <button key={l.id} className="level-chip" onClick={() => onSelectLevel(l)}>
            {l.name}
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </section>
  );
}
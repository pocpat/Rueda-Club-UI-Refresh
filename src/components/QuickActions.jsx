/** Quick Actions — circular red buttons (the circle IS the button), title underneath. */
export default function QuickActions({ levels, onFindClass, onSearch, onPlayMusic, onSelectLevel }) {
  const scrollToLevels = () => {
    const el = document.getElementById('level-chips');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (onSelectLevel) onSelectLevel();
  };

  const actions = [
    {
      label: 'Find class',
      onClick: onFindClass,
      icon: (
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 9 12 4 2 9l10 5 10-5z" />
          <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
        </svg>
      ),
    },
    {
      label: 'Play music',
      onClick: onPlayMusic,
      icon: (
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      ),
    },
    {
      label: 'Search',
      onClick: onSearch,
      icon: (
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      label: 'Level',
      onClick: scrollToLevels,
      icon: (
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2 2 7l10 5 10-5-10-5z" />
          <path d="M2 12l10 5 10-5" />
          <path d="M2 17l10 5 10-5" />
        </svg>
      ),
    },
  ];

  return (
    <section className="mb-10" aria-label="Quick actions">
      <h2 className="font-[var(--font-heading)] text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="qa-row">
        {actions.map((a) => (
          <div key={a.label} className="qa-item">
            <button className="qa-btn" onClick={a.onClick} aria-label={a.label}>
              {a.icon}
            </button>
            <span className="qa-label">{a.label}</span>
          </div>
        ))}
      </div>

      {/* Level chips — jump straight to that level's class page */}
      <div className="level-chips mt-5" id="level-chips">
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
/** QuickActions — circular red buttons, in order: Search, Play music, Level.
 *  Level opens the by-level lesson browser (?tab=levels). */
export default function QuickActions({ onFindClass, onSearch, onPlayMusic, onLevels }) {
  const actions = [
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
      label: 'Level',
      onClick: onLevels,
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
    </section>
  );
}
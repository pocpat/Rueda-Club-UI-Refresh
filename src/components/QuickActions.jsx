/** QuickActions — circular red buttons (the circle IS the button), title underneath.
 *  Level chips moved to the Search page (SearchBar) as filter options. */
export default function QuickActions({ onFindClass, onSearch, onPlayMusic }) {
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
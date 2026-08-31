/** Chevron icon for accordions — circular button.
 *  red variant: red background + white chevron (action buttons are red BG + white font). */
export default function Chevron({ open, red = false }) {
  if (red) {
    return (
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #E11D33 0%, #D90429 100%)',
          boxShadow: '0 4px 12px rgba(217, 4, 41, 0.35)',
        }}
        aria-hidden="true"
      >
        <svg
          className={`w-5 h-5 fill-none transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    );
  }
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0"
      style={{
        background: open ? 'var(--accent)20' : 'var(--glass-bg)',
        border: `1px solid ${open ? 'var(--accent)40' : 'var(--glass-border)'}`,
      }}
    >
      <svg
        className={`w-5 h-5 fill-none transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        viewBox="0 0 24 24"
        aria-hidden="true"
        stroke={open ? 'var(--accent)' : 'var(--text-secondary)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}
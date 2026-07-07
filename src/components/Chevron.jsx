/** Chevron icon for accordions — circular accent */
export default function Chevron({ open }) {
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
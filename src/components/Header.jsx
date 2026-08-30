import FlagSVG from './Flag.jsx';

/** Sticky top bar — navy, sign logo (congas + claves) + "Rueda Club" title */
export default function Header({ theme, onToggleTheme, onHome }) {
  return (
    <header
      className="sticky top-0 z-50 transition-all duration-400"
      style={{
        background: 'var(--header-bg)',
        color: 'var(--header-fg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 12px 40px rgba(13, 27, 42, 0.3)',
      }}
    >
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 flex justify-between items-center h-[4.5rem]">
        {/* Logo — wooden sign with conga drums + claves, "Rueda Club" title */}
        <div className="flex items-center gap-3 cursor-pointer group min-w-0" onClick={onHome} role="button" tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onHome(); }}
          aria-label="Rueda Club — go to home">
          <img src="/images/mi-fg.png" alt="Rueda Club sign with conga drums and claves"
            className="sign-img group-hover:scale-105 transition-transform duration-300"
            style={{ height: '54px' }}
          />
          <h1 className="font-[var(--font-heading)] font-extrabold text-lg sm:text-xl tracking-tight whitespace-nowrap"
            style={{ color: '#FFFFFF' }}>
            Rueda Club
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block" title="Rueda Club — Cuban dance" aria-hidden="true">
            <FlagSVG />
          </span>
          {/* Theme toggle — glass pill */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle light/dark theme"
            className="relative w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 border-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.16)',
              color: '#FFFFFF',
            }}
          >
            {theme === 'light' ? (
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="relative">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="relative">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
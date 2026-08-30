import { useState, useEffect } from 'react';
import Flag from './Flag.jsx';

/** Sticky top bar — flag-blue, hamburger (left), sign logo (center), theme toggle (right).
 *  Hamburger opens a drawer with tabs + dance styles. */
export default function Header({ theme, onToggleTheme, onHome, onTab, onOpenStyle, styles, active }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close drawer on Escape and lock body scroll while open
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const go = (fn, arg) => {
    setMenuOpen(false);
    fn(arg);
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 transition-all duration-400"
        style={{
          background: 'var(--header-bg)',
          color: 'var(--header-fg)',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 12px 40px rgba(13, 27, 42, 0.35)',
        }}
      >
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="navbar-grid">
            {/* Red hamburger — 3 white lines */}
            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>

            {/* Center — wooden sign logo with congas + claves */}
            <div
              className="flex justify-center cursor-pointer group"
              onClick={onHome}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onHome(); }}
              aria-label="Rueda Club — go to home"
            >
              <img
                src="/images/mi-fg.png"
                alt="Rueda Club sign with conga drums and claves"
                className="sign-img group-hover:scale-105 transition-transform duration-300"
                style={{ height: '54px' }}
              />
            </div>

            {/* Right — day/night toggle */}
            <button
              onClick={onToggleTheme}
              aria-label="Toggle light/dark theme"
              className="navbar-theme-btn"
            >
              {theme === 'light' ? (
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
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

      {/* Drawer menu */}
      {menuOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div className="drawer" role="dialog" aria-label="Menu">
            <div className="drawer-head">
              <Flag />
              <button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="drawer-section">Menu</div>
            {[
              { id: 'home', label: 'Home' },
              { id: 'classes', label: 'Classes' },
              { id: 'playlist', label: 'Playlist' },
              { id: 'community', label: 'Community' },
              { id: 'favorites', label: 'Favorites' },
            ].map((t) => (
              <button
                key={t.id}
                className="drawer-link"
                style={active === t.id ? { background: 'var(--accent-glow)', color: 'var(--accent)' } : undefined}
                onClick={() => go(onTab, t.id)}
              >
                {t.label}
              </button>
            ))}

            <div className="drawer-section">Dance styles</div>
            {styles.map((s) => (
              <button key={s.id} className="drawer-link" onClick={() => go(onOpenStyle, s.id)}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.themeColor }} />
                {s.name}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
export default function Header({ theme, onToggleTheme, onHome }) {
  return (
    <header
      className="sticky top-0 z-50 transition-all duration-400"
      style={{
        background: 'var(--header-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid transparent',
        borderImage: 'linear-gradient(90deg, transparent, rgba(78,205,196,0.3), rgba(167,139,250,0.3), transparent) 1',
        boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
      }}
    >
      <div className="w-full max-w-[1200px] mx-auto px-6 flex justify-between items-center h-[4.5rem]">
        {/* Logo — gradient text (Kan3an style) + rotating ring */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onHome}>
          <div className="relative w-10 h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <svg className="absolute inset-0 animate-spin-slow" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.3"/>
              <circle cx="20" cy="2" r="2.5" fill="var(--accent)"/>
              <circle cx="38" cy="20" r="2.5" fill="var(--accent-warm)"/>
              <circle cx="20" cy="38" r="2.5" fill="#ffd93d"/>
              <circle cx="2" cy="20" r="2.5" fill="#a78bfa"/>
            </svg>
            <svg className="absolute inset-1.5 animate-spin-reverse" viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="10" fill="none" stroke="var(--accent-warm)" strokeWidth="1" opacity="0.2" strokeDasharray="3 2"/>
            </svg>
            <div className="relative w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-warm))' }} />
          </div>
          <h1 className="font-[var(--font-heading)] font-extrabold text-lg sm:text-xl tracking-tight gradient-text">
            Rueda Club
          </h1>
        </div>

        {/* Theme toggle — glass pill (visaint + ash1198 style) */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle light/dark theme"
          className="relative w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            background: 'var(--glass)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: 'var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          <div className="absolute inset-0 rounded-full opacity-20 pointer-events-none animate-spin-slow"
            style={{ border: '1px dashed var(--accent)', borderRadius: '9999px' }}
          />
          {theme === 'light' ? (
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="relative">
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
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="relative">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
import { useState, useEffect, useCallback, useRef } from 'react';
import { clubData } from './hooks/useClubData.js';
import { useProgress, useTheme, useRoute } from './hooks/useStore.js';
import { useTTS } from './hooks/useTTS.js';
import { useYouTubePlayer } from './hooks/useYouTube.js';
import { getMoveOfTheDay } from './lib/utils.js';

import Header from './components/Header.jsx';
import SearchBar from './components/SearchBar.jsx';
import MoveOfTheDay from './components/MoveOfTheDay.jsx';
import StyleSection from './components/StyleSection.jsx';
import MoveDetail from './components/MoveDetail.jsx';
import SnakeScroll from './components/SnakeScroll.jsx';

export default function App() {
  const data = clubData;
  const { completedMoves, setLastViewedMoveId, toggleComplete, isCompleted } = useProgress();
  const { theme, toggleTheme } = useTheme();
  const { moveId, navigateTo } = useRoute();
  const { speak } = useTTS();
  const { initPlayer, seekTo, destroyPlayers } = useYouTubePlayer();

  const [openStyleId, setOpenStyleId] = useState(null);
  const [openLevelId, setOpenLevelId] = useState(null);

  useEffect(() => { if (moveId) window.scrollTo({ top: 0, behavior: 'smooth' }); }, [moveId]);
  useEffect(() => { if (!moveId) destroyPlayers(); }, [moveId, destroyPlayers]);
  useEffect(() => { if (moveId) setLastViewedMoveId(moveId); }, [moveId, setLastViewedMoveId]);

  const handleSelectMove = useCallback((id) => navigateTo(`?move=${id}`), [navigateTo]);
  const handleBack = useCallback(() => navigateTo(window.location.pathname), [navigateTo]);
  const handleHome = useCallback(() => {
    if (moveId) navigateTo(window.location.pathname);
  }, [moveId, navigateTo]);
  const handleToggleStyle = useCallback((id) => {
    setOpenStyleId((p) => (p === id ? null : id)); setOpenLevelId(null);
  }, []);
  const handleToggleLevel = useCallback((id) => setOpenLevelId((p) => (p === id ? null : id)), []);

  const motd = getMoveOfTheDay(data.moves, data.levels);

  return (
    <>
      {/* Background layers — orbs + noise */}
      <div className="bg-orbs">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
      </div>
      <div  className="noise-overlay" 
      />

      {/* Skip link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-3 focus:py-2 focus:rounded-full focus:font-bold"
        style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
        Skip to main content
      </a>

      <Header theme={theme} onToggleTheme={toggleTheme} onHome={handleHome} />

      <main id="main-content" className="relative w-full max-w-[1200px] mx-auto px-6 pb-24" style={{ zIndex: 1 }}>
        {moveId ? (
          <MoveDetail
            data={data} moveId={moveId} isCompleted={isCompleted(moveId)}
            onBack={handleBack} onPlayVideo={initPlayer} onSeek={seekTo}
            onSpeak={speak} onToggleComplete={toggleComplete}
          />
        ) : (
          <div className="flex flex-col">
            {/* ===== HERO — Quick-start hub: sign + clickable style shortcuts ===== */}
            <HeroSection
              styles={data.styles}
              data={data}
              onJumpStyle={(styleId) => {
                handleToggleStyle(styleId);
                setTimeout(() => {
                  const el = document.getElementById(`style-${styleId}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
              }}
            />

            {/* Search */}
            <SearchBar moves={data.moves} styles={data.styles} levels={data.levels} onSelect={handleSelectMove} />

            {/* Snake scroll animation — starts behind Move of the Day, ends at footer */}
            <div className="relative w-full" style={{ zIndex: 0 }}>
             {/*  <SnakeScroll /> */}

              {/* Move of the Day — inside snake wrapper so snake starts behind it */}
              <div className="relative" style={{ zIndex: 1 }}>
                <MoveOfTheDay move={motd} onSelectMove={handleSelectMove} onPlayVideo={initPlayer} onSpeak={speak} />
              </div>

              {/* Curriculum sections — above snake so buttons are clickable */}
              <div className="flex flex-col gap-0 relative" style={{ zIndex: 1 }}>
                {data.styles.map((style) => (
                  <div key={style.id} id={`style-${style.id}`}>
                  <StyleSection
                    data={data} style={style}
                    isOpen={openStyleId === style.id}
                    onToggle={() => handleToggleStyle(style.id)}
                    openLevelId={openLevelId}
                    onToggleLevel={handleToggleLevel}
                    completedMoves={completedMoves}
                    onSelectMove={handleSelectMove}
                    onToggleComplete={toggleComplete}
                    onSpeak={speak}
                  />
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="text-center mt-16 mb-4 relative" style={{ zIndex: 1 }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Rueda Club NZ — {data.moves.length} moves · {data.styles.length} styles · Built with ♥ for Cuban dance
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

/** Hero section — quick-start hub: sign image + clickable style shortcuts */
function HeroSection({ styles, data, onJumpStyle }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleJump = (styleId) => {
    setMenuOpen(false);
    onJumpStyle(styleId);
  };

  const renderButton = (style) => {
    const levelIds = data.levels.filter((l) => l.styleId === style.id).map((l) => l.id);
    const moveCount = data.moves.filter((m) => levelIds.includes(m.levelId)).length;
    return (
      <button
        key={style.id}
        onClick={() => handleJump(style.id)}
        className="btn btn-pill"
        style={{
          padding: '8px 16px',
          fontSize: '0.8rem',
          minHeight: '40px',
          borderColor: style.themeColor + '40',
          background: `linear-gradient(135deg, ${style.themeColor}15, transparent)`,
          justifyContent: 'center',
        }}
      >
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: style.themeColor, boxShadow: `0 0 8px ${style.themeColor}80` }}
        />
        <span className="font-semibold">{style.name}</span>
        <span className="font-[var(--font-mono)] font-bold text-xs"
          style={{ color: style.themeColor }}
        >
          {moveCount}
        </span>
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    );
  };

  return (
    <section className="relative mb-8 mt-2">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'var(--glass)',
          backdropFilter: 'blur(14px) saturate(140%)',
          WebkitBackdropFilter: 'blur(14px) saturate(140%)',
          border: '1.5px solid var(--glass-border)',
          boxShadow: 'var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Desktop layout — sign + buttons in a row */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 justify-between">
          <img src="/images/mi-fg.png" alt="Rueda Club sign"
            className="flex-shrink-0 rounded-lg"
            style={{ height: '56px', width: 'auto' }}
          />
          <div className="flex items-center gap-2 flex-grow justify-end flex-wrap">
            {styles.map((style) => {
              const levelIds = data.levels.filter((l) => l.styleId === style.id).map((l) => l.id);
              const moveCount = data.moves.filter((m) => levelIds.includes(m.levelId)).length;
              return (
                <button
                  key={style.id}
                  onClick={() => onJumpStyle(style.id)}
                  className="btn btn-pill"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    minHeight: '40px',
                    flex: '1 1 0',
                    minWidth: '0',
                    maxWidth: '220px',
                    borderColor: style.themeColor + '40',
                    background: `linear-gradient(135deg, ${style.themeColor}15, transparent)`,
                    justifyContent: 'center',
                  }}
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: style.themeColor, boxShadow: `0 0 8px ${style.themeColor}80` }}
                  />
                  <span className="font-semibold">{style.name}</span>
                  <span className="font-[var(--font-mono)] font-bold text-xs"
                    style={{ color: style.themeColor }}
                  >
                    {moveCount}
                  </span>
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile layout — sign + hamburger, collapsible column of buttons */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between px-3 py-2">
            <img src="/images/mi-fg.png" alt="Rueda Club sign"
              className="flex-shrink-0 rounded-lg"
              style={{ height: '48px', width: 'auto' }}
            />
            <button
              onClick={() => setMenuOpen((p) => !p)}
              aria-label="Toggle style shortcuts"
              aria-expanded={menuOpen}
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border-none"
              style={{
                background: 'var(--glass)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {menuOpen
                  ? <path d="M18 6L6 18M6 6l12 12" />
                  : <path d="M3 12h18M3 6h18M3 18h18" />}
              </svg>
            </button>
          </div>

          {/* Collapsible column of buttons */}
          {menuOpen && (
            <div className="flex flex-col gap-2 px-3 pb-3 animate-slide-down">
              {styles.map(renderButton)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
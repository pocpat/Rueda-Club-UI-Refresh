import { useEffect, useCallback, useMemo } from 'react';
import { clubData } from './hooks/useClubData.js';
import { useProgress, useTheme, useRoute, useFavorites } from './hooks/useStore.js';
import { useTTS } from './hooks/useTTS.js';
import { useYouTubePlayer } from './hooks/useYouTube.js';
import { getMoveOfTheDay, pickRandom } from './lib/utils.js';

import Header from './components/Header.jsx';
import TabBar from './components/TabBar.jsx';
import Flag from './components/Flag.jsx';
import SearchBar from './components/SearchBar.jsx';
import MoveOfTheDay from './components/MoveOfTheDay.jsx';
import MoveDetail from './components/MoveDetail.jsx';
import QuickActions from './components/QuickActions.jsx';
import StyleSection from './components/StyleSection.jsx';
import ClassPage from './components/ClassPage.jsx';
import PlaylistPage from './components/PlaylistPage.jsx';
import CommunityPage from './components/CommunityPage.jsx';
import FavoritesPage from './components/FavoritesPage.jsx';

export default function App() {
  const data = clubData;
  const { completedMoves, setLastViewedMoveId, toggleComplete, isCompleted } = useProgress();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { theme, toggleTheme } = useTheme();
  const { moveId, styleId, tab, navigateTo } = useRoute();
  const { speak } = useTTS();
  const { initPlayer, seekTo, destroyPlayers, registerPlayer } = useYouTubePlayer();

  const styleMap = useMemo(() => new Map(data.styles.map((s) => [s.id, s])), [data.styles]);

  useEffect(() => { if (moveId) window.scrollTo({ top: 0, behavior: 'smooth' }); }, [moveId]);
  useEffect(() => { if (!moveId) destroyPlayers(); }, [moveId, destroyPlayers]);
  useEffect(() => { if (moveId) setLastViewedMoveId(moveId); }, [moveId, setLastViewedMoveId]);
  useEffect(() => { if (!moveId) window.scrollTo({ top: 0 }); }, [styleId, tab, moveId]);

  const handleSelectMove = useCallback((id) => {
    navigateTo({ moveId: id, styleId: styleId || '' });
  }, [navigateTo, styleId]);

  const handleBack = useCallback(() => {
    if (styleId && styleMap.has(styleId)) navigateTo({ styleId });
    else navigateTo({ tab: 'home' });
  }, [styleId, styleMap, navigateTo]);

  const handleHome = useCallback(() => navigateTo({ tab: 'home' }), [navigateTo]);
  const handleTab = useCallback((t) => navigateTo({ tab: t }), [navigateTo]);

  // ===== Quick actions =====
  // Find class — pure watch-&-repeat tutorial: a random Foundations lesson
  const handleFindClass = useCallback(() => {
    const foundations = data.moves.filter((m) => m.levelId === 'lvl-foundations' && m.videos?.length);
    const pool = foundations.length ? foundations : data.moves;
    const pick = pickRandom(pool, 1)[0];
    if (pick) navigateTo({ moveId: pick.id, styleId: 'style-rueda-de-casino' });
  }, [data, navigateTo]);

  // Dance challenge — random lesson from Rueda de Casino or Son Cubano
  const handleChallenge = useCallback(() => {
    const danceLevelIds = new Set(
      data.levels
        .filter((l) => l.styleId === 'style-rueda-de-casino' || l.styleId === 'style-son-cubano')
        .map((l) => l.id)
    );
    const pool = data.moves.filter((m) => danceLevelIds.has(m.levelId) && m.videos?.length);
    const pick = pickRandom(pool, 1)[0];
    if (!pick) return;
    const level = data.levels.find((l) => l.id === pick.levelId);
    navigateTo({ moveId: pick.id, styleId: level ? level.styleId : '' });
  }, [data, navigateTo]);

  const handlePlayMusic = useCallback(() => navigateTo({ tab: 'playlist' }), [navigateTo]);

  // Level chip / tile → open the level's class page
  const handleSelectLevel = useCallback((level) => {
    const style = styleMap.get(level.styleId);
    if (style) navigateTo({ styleId: style.id });
  }, [styleMap, navigateTo]);

  const motd = getMoveOfTheDay(data.moves, data.levels);
  const activeTab = styleId && styleMap.has(styleId) && !moveId ? 'classes' : tab;

  return (
    <>
      <div className="noise-overlay" />

      {/* Skip link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-3 focus:py-2 focus:rounded-full focus:font-bold"
        style={{ background: 'var(--accent)', color: '#fff' }}>
        Skip to main content
      </a>

      <Header theme={theme} onToggleTheme={toggleTheme} onHome={handleHome} />

      <main id="main-content" className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 pt-4 pb-28" style={{ zIndex: 1 }}>
        {moveId ? (
          <MoveDetail
            data={data} moveId={moveId} isCompleted={isCompleted(moveId)}
            onBack={handleBack} onPlayVideo={initPlayer} onSeek={seekTo}
            onSpeak={speak} onToggleComplete={toggleComplete} onRegisterPlayer={registerPlayer}
            isFavorite={isFavorite(moveId)} onToggleFavorite={toggleFavorite}
          />
        ) : styleId && styleMap.has(styleId) ? (
          <ClassPage
            data={data} style={styleMap.get(styleId)}
            completedMoves={completedMoves}
            onSelectMove={(id) => navigateTo({ moveId: id, styleId })}
            onToggleComplete={toggleComplete} onSpeak={speak}
            isFavorite={isFavorite} onToggleFavorite={toggleFavorite}
          />
        ) : activeTab === 'home' ? (
          <HomePage
            data={data} motd={motd}
            onSelectMove={handleSelectMove} onSpeak={speak}
            onOpenStyle={(id) => navigateTo({ styleId: id })}
            onFindClass={handleFindClass} onPlayMusic={handlePlayMusic}
            onChallenge={handleChallenge} onSelectLevel={handleSelectLevel}
          />
        ) : activeTab === 'classes' ? (
          <ClassesPage
            data={data} completedMoves={completedMoves}
            onOpenStyle={(id) => navigateTo({ styleId: id })}
            onSelectMove={handleSelectMove}
          />
        ) : activeTab === 'playlist' ? (
          <PlaylistPage songs={data.songs} />
        ) : activeTab === 'community' ? (
          <CommunityPage venue={data.venue} />
        ) : (
          <FavoritesPage
            data={data} favorites={favorites}
            onSelectMove={handleSelectMove} onToggleComplete={toggleComplete} onSpeak={speak}
            isFavorite={isFavorite} onToggleFavorite={toggleFavorite}
            isCompleted={isCompleted}
          />
        )}
      </main>

      <TabBar active={activeTab} onTab={handleTab} />
    </>
  );
}

/** Home — hero strip + Move of the Day + Quick Actions (level chips jump to class pages) */
function HomePage({ data, motd, onSelectMove, onSpeak, onOpenStyle, onFindClass, onPlayMusic, onChallenge, onSelectLevel }) {
  const danceStyles = data.styles.filter((s) => s.id !== 'style-musicality');

  return (
    <div className="tab-fade flex flex-col">
      {/* Hero — flag + style shortcuts to class pages */}
      <section className="relative rounded-2xl overflow-hidden mb-8 mt-2"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-center gap-4 px-5 py-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Flag />
            <div className="min-w-0">
              <p className="font-[var(--font-heading)] font-extrabold text-base sm:text-lg leading-tight" style={{ color: 'var(--text)' }}>
                Your Cuban dance journey
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {data.moves.length} lessons · Rueda de Casino · Son Cubano · Documentary
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
            {danceStyles.map((style) => (
              <button key={style.id} className="btn btn-pill"
                style={{
                  padding: '8px 16px', fontSize: '0.8rem', minHeight: '40px',
                  borderColor: style.themeColor + '55',
                  background: `linear-gradient(135deg, ${style.themeColor}18, transparent)`,
                  justifyContent: 'center',
                }}
                onClick={() => onOpenStyle(style.id)}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: style.themeColor }} />
                <span className="font-semibold">{style.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Move of the Day */}
      <MoveOfTheDay move={motd} onSelectMove={onSelectMove} onSpeak={onSpeak} />

      {/* Quick Actions — square tiles + level chips */}
      <QuickActions
        levels={data.levels}
        onFindClass={onFindClass}
        onPlayMusic={onPlayMusic}
        onChallenge={onChallenge}
        onSelectLevel={onSelectLevel}
      />

      {/* Small footer */}
      <div className="text-center mt-10">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Rueda Club NZ — {data.moves.length} moves · {data.styles.length} styles · Built with ♥ for Cuban dance
        </p>
      </div>
    </div>
  );
}

/** Classes — search + one card per style; opens the style's class page */
function ClassesPage({ data, completedMoves, onOpenStyle, onSelectMove }) {
  return (
    <div className="tab-fade">
      <div className="class-page-head mb-6 flex items-center gap-4 flex-wrap">
        <Flag />
        <div>
          <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--text)' }}>
            Classes
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Pick a style to see its levels and lessons — watch, repeat, master.
          </p>
        </div>
      </div>

      <SearchBar moves={data.moves} styles={data.styles} levels={data.levels} onSelect={onSelectMove} />

      <div className="flex flex-col">
        {data.styles.map((style) => (
          <div key={style.id} id={`style-${style.id}`}>
            <StyleSection
              data={data} style={style}
              isOpen={false}
              onToggle={() => onOpenStyle(style.id)}
              openLevelId={null}
              onToggleLevel={() => {}}
              completedMoves={completedMoves}
              onSelectMove={() => {}}
              onToggleComplete={() => {}}
              onSpeak={() => {}}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
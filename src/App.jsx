import { useEffect, useCallback, useMemo } from 'react';
import { clubData } from './hooks/useClubData.js';
import { useProgress, useTheme, useRoute, useFavorites } from './hooks/useStore.js';
import { useTTS } from './hooks/useTTS.js';
import { useYouTubePlayer } from './hooks/useYouTube.js';
import { getMoveOfTheDay, pickRandom, stripMarkdown, extractYouTubeVideoId, youtubeThumb } from './lib/utils.js';

import Header from './components/Header.jsx';
import TabBar from './components/TabBar.jsx';
import BackButton from './components/BackButton.jsx';
import Flag from './components/Flag.jsx';
import SearchBar from './components/SearchBar.jsx';
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
    // Move detail → its class page when opened from one, else Home.
    // Every other page (class pages, tabs) → Home.
    if (moveId) {
      if (styleId && styleMap.has(styleId)) navigateTo({ styleId });
      else navigateTo({ tab: 'home' });
    } else {
      navigateTo({ tab: 'home' });
    }
  }, [moveId, styleId, styleMap, navigateTo]);

  // Every page except Home gets the shared Back button (same component, same place)
  const showBack = Boolean(moveId || styleId || (tab && tab !== 'home'));

  const handleTab = useCallback((t) => navigateTo({ tab: t }), [navigateTo]);

  // ===== Quick actions =====
  // Find class — pure watch-&-repeat tutorial: a random Foundations lesson
  const handleFindClass = useCallback(() => {
    const foundations = data.moves.filter((m) => m.levelId === 'lvl-foundations' && m.videos?.length);
    const pool = foundations.length ? foundations : data.moves;
    const pick = pickRandom(pool, 1)[0];
    if (pick) navigateTo({ moveId: pick.id, styleId: 'style-rueda-de-casino' });
  }, [data, navigateTo]);

  const handlePlayMusic = useCallback(() => navigateTo({ tab: 'playlist' }), [navigateTo]);

  // Search quick action → Classes tab with the search box focused
  const handleSearch = useCallback(() => {
    navigateTo({ tab: 'classes' });
    setTimeout(() => document.getElementById('move-search')?.focus(), 250);
  }, [navigateTo]);

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

      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onHome={() => { if (moveId || styleId || tab !== 'home') navigateTo({ tab: 'home' }); }}
        onTab={handleTab}
        onOpenStyle={(id) => navigateTo({ styleId: id })}
        styles={data.styles}
        active={activeTab}
      />

      <div className="app-sheet">
        <main id="main-content" className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 pt-5 pb-28" style={{ zIndex: 1 }}>
        {/* Shared Back button — same component & same place (top-left, first element of main) on every page except Home.
            Reuses the move-detail back behaviour: move → its class page, else Home. */}
        {showBack && (
          <BackButton onClick={handleBack} />
        )}
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
            onSelectMove={handleSelectMove} onOpenStyle={(id) => navigateTo({ styleId: id })}
            onFindClass={handleFindClass} onSearch={handleSearch}
            onPlayMusic={handlePlayMusic} onSelectLevel={handleSelectLevel}
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
      </div>

      <TabBar active={activeTab} onTab={handleTab} />
    </>
  );
}

/** Home — hero strip + Move of the Day + Quick Actions (level chips jump to class pages) */
function HomePage({ data, motd, onSelectMove, onOpenStyle, onFindClass, onSearch, onPlayMusic, onSelectLevel }) {
  const danceStyles = data.styles.filter((s) => s.id !== 'style-musicality');
  const firstVideo = motd.videos?.[0];
  const motdThumb = firstVideo
    ? (firstVideo.thumbnail || youtubeThumb(extractYouTubeVideoId(firstVideo.url)))
    : null;
  const fullDesc = stripMarkdown(motd.description);
  const motdDesc = fullDesc.length > 150 ? fullDesc.slice(0, 150).trimEnd() + '…' : fullDesc;
  const videoTitle = firstVideo?.title || motd.name;
  const motdLevel = data.levels.find((l) => l.id === motd.levelId);
  const motdStyle = motdLevel ? data.styles.find((s) => s.id === motdLevel.styleId) : null;
  const levelLabel = motdLevel
    ? (motdStyle ? `${motdStyle.name.split(' ')[0]} ${motdLevel.name}` : motdLevel.name)
    : null;

  return (
    <div className="tab-fade flex flex-col">
      {/* Hero — plain text title + subtitle (styles live in Classes tab & drawer) */}
      <section className="mb-8 mt-2">
        <h2 className="font-[var(--font-heading)] font-extrabold text-xl sm:text-2xl leading-tight" style={{ color: 'var(--text)' }}>
          Your Cuban dance journey
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {data.moves.length} lessons · {danceStyles.map((s) => s.name).join(' · ')}
        </p>
      </section>

      {/* 4 square tiles — Move of the day (with video preview) + the three styles */}
      <div className="home-tiles">
        <div className="home-tile home-tile-motd">
          <span className="home-tile-heading">Move of the day</span>
          {motdThumb && (
            <img
              className="home-tile-thumb"
              src={motdThumb}
              alt={`Preview of ${motd.name}`}
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <span className="home-tile-video-title" lang="es">{videoTitle}</span>
          <p className="home-tile-desc">{motdDesc}</p>
          {levelLabel && (
            <span className="home-tile-level">{levelLabel}</span>
          )}
          <button className="tile-btn tile-btn-red" onClick={() => onSelectMove(motd.id)}>View</button>
        </div>
        {danceStyles.map((style) => (
          <div key={style.id} className="home-tile">
            <span className="home-tile-title">{style.name}</span>
            <button className="tile-btn tile-btn-white" onClick={() => onOpenStyle(style.id)}>Open</button>
          </div>
        ))}
      </div>

      {/* Quick Actions — square tiles + level chips */}
      <QuickActions
        levels={data.levels}
        onFindClass={onFindClass}
        onSearch={onSearch}
        onPlayMusic={onPlayMusic}
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
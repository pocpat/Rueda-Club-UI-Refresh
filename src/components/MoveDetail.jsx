import { useState } from 'react';
import { stripMarkdown, extractYouTubeVideoId, formatTime } from '../lib/utils.js';
import { findMove } from '../hooks/useClubData.js';
import VideoPlayer from './VideoPlayer.jsx';
import TTSButton from './TTSButton.jsx';

/** Move detail — immersive layout with circular chapter navigation */
export default function MoveDetail({
  data, moveId, isCompleted, onBack,
  onPlayVideo, onSeek, onSpeak, onToggleComplete, onRegisterPlayer,
}) {
  const [forceLoadIndex, setForceLoadIndex] = useState(null);
  const move = findMove(data, moveId);

  if (!move) {
    return (
      <div className="text-center py-20">
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Move not found.</p>
        <button onClick={onBack} className="mt-4 font-semibold cursor-pointer" style={{ color: 'var(--accent)' }}>← Back to Dashboard</button>
      </div>
    );
  }

  const allChapters = [];
  if (move.videos) {
    move.videos.forEach((vid, vIdx) => {
      const containerId = `player-${moveId}-${vIdx}`;
      if (vid.chapters && vid.chapters.length > 0) {
        vid.chapters.forEach((chap) => {
          allChapters.push({ ...chap, containerId, videoIndex: vIdx, videoId: extractYouTubeVideoId(vid.url) });
        });
      }
    });
  }

  const chaptersByMove = {};
  allChapters.forEach((chap) => {
    const name = chap.move || 'General';
    if (!chaptersByMove[name]) chaptersByMove[name] = [];
    chaptersByMove[name].push(chap);
  });

  const handleChapterClick = (chap) => {
    // If player not registered yet, trigger load then seek after it's ready
    const player = document.getElementById(chap.containerId);
    if (!player) {
      setForceLoadIndex(chap.videoIndex);
      setTimeout(() => onSeek(chap.containerId, chap.time), 2500);
    } else {
      onSeek(chap.containerId, chap.time);
    }
  };

  return (
    <div>
      {/* Back button */}
      <nav aria-label="Breadcrumb navigation" className="mb-6">
        <button
          onClick={onBack}
          aria-label="Go back to dashboard"
          className="btn btn-ghost btn-pill"
          style={{ minHeight: '44px' }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
      </nav>

      <article className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 mt-4">
        {/* Video column */}
        <div className="flex flex-col gap-4 min-w-0 overflow-hidden">
          {move.videos && move.videos.length > 0 ? (
            <div className="flex flex-col gap-4">
              {move.videos.map((vid, vIdx) => (
                <VideoPlayer
                  key={vIdx}
                  video={vid}
                  title={move.videos.length > 1 ? vid.title : null}
                  index={vIdx}
                  playerKey={moveId}
                  onPlay={onPlayVideo}
                  shouldLoad={forceLoadIndex === vIdx}
                  onLoaded={() => {}}
                  onRegisterPlayer={onRegisterPlayer}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center rounded-2xl" style={{ border: '1px dashed var(--glass-border)', color: 'var(--text-secondary)' }}>
              <span className="text-3xl block mb-2">🎬</span>
              <p>Videos coming soon.</p>
            </div>
          )}

          {/* Chapters — circular timeline style */}
          <div>
            {Object.keys(chaptersByMove).length > 0 ? (
              <div className="rounded-2xl p-5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <h4 className="font-[var(--font-heading)] text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Chapters
                </h4>
                {Object.keys(chaptersByMove).map((moveName) => (
                  <details key={moveName} open className="mb-3 last:mb-0">
                    <summary className="cursor-pointer font-semibold text-sm py-1 list-none flex items-center select-none [&::-webkit-details-marker]:hidden"
                      style={{ color: 'var(--text)' }}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 transition-transform duration-200">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                      {moveName}
                    </summary>
                    <div className="flex flex-wrap gap-2 mt-3 mb-2">
                      {chaptersByMove[moveName].map((chap, i) => (
                        <button
                          key={i}
                          onClick={() => handleChapterClick(chap)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
                          style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-secondary)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.color = 'var(--accent)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(78, 205, 196, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--glass-border)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <span className="opacity-50 font-normal">{formatTime(chap.time)}</span>
                          <span className="opacity-30">·</span>
                          {chap.label || chap.title}
                        </button>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl p-4 text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <p className="text-sm m-0" style={{ color: 'var(--text-secondary)' }}>No chapters available</p>
              </div>
            )}
          </div>
        </div>

        {/* Info column */}
        <div className="flex flex-col gap-4">
          {/* Main info card */}
          <div className="rounded-3xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(20px)' }}>
            {/* Move image placeholder — large circular */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden mb-4"
              style={{ border: '1px dashed var(--glass-border)' }}
            >
              <img src="/images/placeholder-move.svg" alt="" className="w-full h-full object-cover opacity-50" />
            </div>

            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-[var(--font-display)] text-2xl md:text-3xl font-semibold" style={{ color: 'var(--text)' }} lang="es">
                {move.name}
              </h2>
              <TTSButton text={move.name} lang={move.lang || 'es-ES'} onSpeak={onSpeak} size="lg" />
            </div>

            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              {stripMarkdown(move.description)}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {move.tags?.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Complete button — gradient pill */}
            <button
              onClick={() => onToggleComplete(move.id)}
              aria-pressed={isCompleted}
              className={`btn btn-pill w-full justify-center ${isCompleted ? 'btn-primary' : 'btn-warm'}`}
              style={{ minHeight: '48px', fontSize: '1rem' }}
            >
              {isCompleted ? (
                <>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Mastered
                </>
              ) : (
                'Mark as Completed'
              )}
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
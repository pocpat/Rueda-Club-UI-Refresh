import { useState, useRef } from 'react';
import YouTube from 'react-youtube';
import { extractYouTubeVideoId, youtubeThumb, stripMarkdown } from '../lib/utils.js';
import TTSButton from './TTSButton.jsx';
import Flag from './Flag.jsx';

/** Move of the Day — circular hero card with orbital design, Cuban flag colors */
export default function MoveOfTheDay({ move, onSelectMove, onSpeak }) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const playerRef = useRef(null);

  if (!move) return null;

  const firstVideo = move.videos?.[0];
  const videoId = firstVideo ? extractYouTubeVideoId(firstVideo.url) : '';
  const thumbUrl = firstVideo?.thumbnail || (videoId ? youtubeThumb(videoId) : '/images/placeholder-video.svg');
  const excerpt = stripMarkdown(move.description).substring(0, 180);
  const lastSpace = excerpt.lastIndexOf(' ');
  const desc = lastSpace > 100 ? excerpt.substring(0, lastSpace) : excerpt;

  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1,
      playsinline: 1,
      rel: 0,
      modestbranding: 1,
      origin: window.location.origin,
    },
  };

  const onReady = (event) => {
    playerRef.current = event.target;
    event.target.playVideo();
  };

  return (
    <div
      className="relative rounded-3xl overflow-hidden mb-12"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      {/* Decorative orbital rings + flag */}
      <div className="absolute -top-20 -right-20 w-64 h-64 opacity-20 pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-slow">
          <circle cx="100" cy="100" r="90" fill="none" stroke="var(--accent)" strokeWidth="1" strokeDasharray="6 4" />
          <circle cx="100" cy="10" r="4" fill="var(--accent)" />
          <circle cx="190" cy="100" r="4" fill="#2E5FA3" />
          <circle cx="100" cy="190" r="4" fill="var(--gold)" />
          <circle cx="10" cy="100" r="4" fill="var(--crimson)" />
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-0">
        {/* Video / image side */}
        <div className="relative p-6 md:p-8 flex flex-col gap-3">
          <div className="text-xs uppercase tracking-[0.2em] font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
            Move of the Day
            <Flag className="ml-1" />
          </div>
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-xl group">
            {!videoLoaded && firstVideo && (
              <button
                type="button"
                onClick={() => setVideoLoaded(true)}
                aria-label={`Play ${move.name} video`}
                className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer bg-transparent border-none p-0 z-10"
              >
                <img src={thumbUrl} alt="Video thumbnail" loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-video.svg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-1" />
                <span className="relative z-2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white ml-1"><path d="M8 5v14l11-7z" /></svg>
                </span>
              </button>
            )}
            {videoLoaded && videoId && (
              <div className="absolute inset-0 w-full h-full">
                <YouTube
                  videoId={videoId}
                  opts={opts}
                  onReady={onReady}
                  className="w-full h-full"
                  iframeClassName="absolute inset-0 w-full h-full"
                  title={`${move.name} video`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Info side */}
        <div className="flex flex-col justify-center gap-3 p-6 md:p-8 relative">
          <div className="flex items-center gap-2">
            <h2
              className="font-[var(--font-display)] text-2xl md:text-3xl lg:text-4xl font-semibold"
              style={{ color: 'var(--text)' }}
              lang="es"
            >
              {move.name}
            </h2>
            <TTSButton text={move.name} lang={move.lang || 'es-ES'} onSpeak={onSpeak} />
          </div>
          <p className="text-sm md:text-base leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
            {desc}…
          </p>
          <div className="flex gap-2 flex-wrap mt-1">
            {move.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}
              >
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={() => onSelectMove(move.id)}
            className="btn btn-primary btn-pill self-start mt-3"
            style={{ minHeight: '44px' }}
          >
            Explore This Move
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
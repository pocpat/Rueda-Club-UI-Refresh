import { useState, useEffect } from 'react';
import { extractYouTubeVideoId, youtubeThumb } from '../lib/utils.js';

/**
 * YouTube video player with facade pattern.
 * Uses plain <iframe> embeds instead of the IFrame JS API for mobile reliability.
 */
export default function VideoPlayer({ video, title, index, playerKey, onPlay, shouldLoad, onLoaded }) {
  const [loaded, setLoaded] = useState(false);
  const videoId = extractYouTubeVideoId(video.url);
  const containerId = `player-${playerKey}-${index}`;
  const thumbUrl = video.thumbnail || (videoId ? youtubeThumb(videoId) : '/images/placeholder-video.svg');

  // External trigger (chapter seek) — set loaded to true
  useEffect(() => {
    if (shouldLoad && !loaded) {
      setLoaded(true);
      onLoaded?.();
    }
  }, [shouldLoad, loaded, onLoaded]);

  const handlePlay = () => {
    if (loaded) return;
    setLoaded(true);
  };

  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`
    : '';

  return (
    <div className="flex flex-col gap-2">
      {title && (
        <div className="px-3 py-2 text-sm font-semibold rounded-t-lg"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            color: 'var(--accent-bright)',
            borderBottom: '1px solid var(--glass-border)',
          }}
        >
          {title}
        </div>
      )}
      <div
        className="relative aspect-video overflow-hidden bg-black rounded-2xl shadow-2xl"
        style={{ border: '1px solid var(--glass-border)' }}
      >
        {!loaded && (
          <button
            type="button"
            onClick={handlePlay}
            aria-label={`Play ${title || 'video'}`}
            className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer bg-transparent border-none p-0 z-10 group"
          >
            <img
              src={thumbUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-video.svg'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-1" />
            <span className="relative z-2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center pointer-events-none border-2 border-white/40 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white ml-1"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </button>
        )}
        {loaded && embedUrl && (
          <iframe
            id={containerId}
            src={embedUrl}
            title={title || `Video ${index + 1}`}
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none' }}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}
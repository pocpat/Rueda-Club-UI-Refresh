import { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import { extractYouTubeVideoId, youtubeThumb } from '../lib/utils.js';

/**
 * YouTube video player with facade pattern using react-youtube.
 * Shows thumbnail until clicked, then mounts the YouTube player.
 */
export default function VideoPlayer({ video, title, index, playerKey, onPlay, shouldLoad, onLoaded, onRegisterPlayer }) {
  const [loaded, setLoaded] = useState(false);
  const playerRef = useRef(null);
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

  // Register player ref with parent for seekTo
  useEffect(() => {
    if (loaded && playerRef.current && onRegisterPlayer) {
      onRegisterPlayer(containerId, playerRef.current);
    }
  }, [loaded, containerId, onRegisterPlayer]);

  const handlePlay = () => {
    if (loaded) return;
    setLoaded(true);
  };

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
    if (onRegisterPlayer) {
      onRegisterPlayer(containerId, event.target);
    }
    // Play immediately — user already tapped the thumbnail
    event.target.playVideo();
  };

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
        {loaded && videoId && (
          <div className="absolute inset-0 w-full h-full">
            <YouTube
              videoId={videoId}
              opts={opts}
              onReady={onReady}
              className="w-full h-full"
              iframeClassName="absolute inset-0 w-full h-full"
              title={title || `Video ${index + 1}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
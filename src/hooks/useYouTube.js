import { useRef, useCallback, useEffect } from 'react';

let apiReady = false;
let apiLoading = false;

// Set up the global callback for YouTube API
if (typeof window !== 'undefined') {
  if (!window.onYouTubeIframeAPIReady) {
    window.onYouTubeIframeAPIReady = () => { apiReady = true; };
  }
  if (window.YT && window.YT.Player) {
    apiReady = true;
  }
}

/** Hook to manage YouTube player instances with facade pattern */
export function useYouTubePlayer() {
  const playersRef = useRef({});

  const initPlayer = useCallback((containerId, videoId, startTime = null) => {
    // Don't create a duplicate player if one already exists for this container
    if (playersRef.current[containerId]) {
      // Already loaded — just seek if requested
      const existing = playersRef.current[containerId];
      if (startTime !== null && typeof existing.seekTo === 'function') {
        existing.seekTo(startTime, true);
        existing.playVideo();
      }
      return;
    }

    const init = (retries = 0) => {
      if (window.YT && window.YT.Player) {
        apiReady = true;
      }
      if (!apiReady) {
        // Load the API if not already loading
        if (!apiLoading && !document.querySelector('script[src*="youtube.com/iframe_api"]')) {
          apiLoading = true;
          const script = document.createElement('script');
          script.src = 'https://www.youtube.com/iframe_api';
          script.async = true;
          document.head.appendChild(script);
        }
        if (retries > 20) {
          console.error('YouTube IFrame API failed to load after 20 retries');
          return;
        }
        setTimeout(() => init(retries + 1), 300);
        return;
      }

      const el = document.getElementById(containerId);
      if (!el) return;
      // Make sure the container is visible
      el.style.display = 'block';

      try {
        playersRef.current[containerId] = new window.YT.Player(containerId, {
          height: '100%',
          width: '100%',
          videoId,
          playerVars: {
            rel: 0,
            modestbranding: 1,
            origin: window.location.origin,
            autoplay: 1,
            // mute=1 is the key workaround for browser autoplay restrictions
            // We unmute in onReady after play starts
            mute: 1,
            playsinline: 1,
          },
          events: {
            onReady: (event) => {
              if (startTime !== null) {
                event.target.seekTo(startTime, true);
              }
              event.target.playVideo();
              // Unmute after playback starts — browsers allow this after user gesture
              setTimeout(() => {
                try { event.target.unMute(); } catch (e) {}
              }, 500);
            },
            onError: (event) => {
              console.error('YouTube player error:', event.data, 'for video:', videoId, 'container:', containerId);
            },
          },
        });
      } catch (err) {
        console.error('Failed to create YT.Player:', err);
      }
    };
    init();
  }, []);

  const seekTo = useCallback((containerId, time) => {
    const player = playersRef.current[containerId];
    if (player && typeof player.seekTo === 'function') {
      player.seekTo(time, true);
      player.playVideo();
    }
  }, []);

  const destroyPlayers = useCallback(() => {
    Object.keys(playersRef.current).forEach((key) => {
      const p = playersRef.current[key];
      if (p) {
        try { p.destroy?.(); } catch (e) {}
      }
      delete playersRef.current[key];
    });
  }, []);

  useEffect(() => {
    return () => destroyPlayers();
  }, [destroyPlayers]);

  return { initPlayer, seekTo, destroyPlayers };
}
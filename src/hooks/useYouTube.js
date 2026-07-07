import { useCallback, useEffect } from 'react';

/**
 * Hook to manage YouTube iframe players via postMessage API.
 *
 * Replaced the YouTube IFrame JS API with plain <iframe> embeds + enablejsapi=1.
 * The IFrame API approach broke on mobile (Android/Chrome): the async chain
 * (useEffect → requestAnimationFrame → setTimeout retries → onReady → playVideo)
 * lost the user gesture context, so the browser paused playback after ~0.5s.
 *
 * With plain iframes, the src is set as a direct result of the click (React state
 * update → iframe render), preserving the user gesture. Autoplay works reliably.
 * Chapter seeking uses postMessage to the iframe's contentWindow.
 */
export function useYouTubePlayer() {
  const initPlayer = useCallback((_containerId, _videoId, _startTime = null) => {
    // No-op: iframe is rendered directly by VideoPlayer / MoveOfTheDay.
    // Kept for interface compatibility — App.jsx still passes it as onPlayVideo.
  }, []);

  const seekTo = useCallback((containerId, time) => {
    const iframe = document.getElementById(containerId);
    if (!iframe || !iframe.contentWindow) return;

    iframe.contentWindow.postMessage(JSON.stringify({
      event: 'command',
      func: 'seekTo',
      args: [time, true],
    }), '*');
    iframe.contentWindow.postMessage(JSON.stringify({
      event: 'command',
      func: 'playVideo',
      args: [],
    }), '*');
  }, []);

  const destroyPlayers = useCallback(() => {
    // No-op: React handles iframe unmounting automatically.
  }, []);

  useEffect(() => {
    return () => destroyPlayers();
  }, [destroyPlayers]);

  return { initPlayer, seekTo, destroyPlayers };
}
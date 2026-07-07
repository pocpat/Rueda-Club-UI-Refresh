import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to manage YouTube players via react-youtube.
 *
 * The YouTube IFrame JS API and plain iframe approaches both broke on mobile:
 * the async chain lost the user gesture context, causing playback to stall
 * after ~0.5s. react-youtube manages the player lifecycle within React and
 * gives us a ref to call playVideo/seekTo directly.
 */
export function useYouTubePlayer() {
  const playersRef = useRef({});

  const registerPlayer = useCallback((containerId, player) => {
    if (player) {
      playersRef.current[containerId] = player;
    }
  }, []);

  const initPlayer = useCallback((_containerId, _videoId, _startTime = null) => {
    // No-op — react-youtube handles player creation.
    // Kept for interface compatibility with App.jsx.
  }, []);

  const seekTo = useCallback((containerId, time) => {
    const player = playersRef.current[containerId];
    if (!player) return;
    try {
      player.seekTo(time, true);
      player.playVideo();
    } catch (e) {
      console.warn('seekTo failed:', e);
    }
  }, []);

  const destroyPlayers = useCallback(() => {
    Object.keys(playersRef.current).forEach((key) => {
      delete playersRef.current[key];
    });
  }, []);

  useEffect(() => {
    return () => destroyPlayers();
  }, [destroyPlayers]);

  return { initPlayer, seekTo, destroyPlayers, registerPlayer };
}
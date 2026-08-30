import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'RUEDA_CLUB_USER_PROGRESS';
const FAV_KEY = 'RUEDA_CLUB_FAVORITES';
const THEME_KEY = 'theme';

/** Hook for user progress (completed moves + last viewed) persisted to localStorage */
export function useProgress() {
  const [completedMoves, setCompletedMoves] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return data?.completedMoves || [];
    } catch {
      return [];
    }
  });

  const [lastViewedMoveId, setLastViewedMoveId] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return data?.lastViewedMoveId || null;
    } catch {
      return null;
    }
  });

  // Persist to localStorage (debounced via microtask batching)
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedMoves, lastViewedMoveId }));
      } catch {}
    }, 300);
    return () => clearTimeout(id);
  }, [completedMoves, lastViewedMoveId]);

  const toggleComplete = useCallback((moveId) => {
    setCompletedMoves((prev) =>
      prev.includes(moveId) ? prev.filter((id) => id !== moveId) : [...prev, moveId]
    );
  }, []);

  const isCompleted = useCallback((moveId) => completedMoves.includes(moveId), [completedMoves]);

  return { completedMoves, lastViewedMoveId, setLastViewedMoveId, toggleComplete, isCompleted };
}

/** Hook for favorite lessons — per-device only (localStorage), hearts on lesson cards/detail */
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem(FAV_KEY));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const toggleFavorite = useCallback((moveId) => {
    setFavorites((prev) =>
      prev.includes(moveId) ? prev.filter((id) => id !== moveId) : [...prev, moveId]
    );
  }, []);

  const isFavorite = useCallback((moveId) => favorites.includes(moveId), [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}

/** Hook for theme (dark/light) persisted to localStorage */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
}

/** Tab + route state. Tabs: home | classes | playlist | community | favorites.
 *  Class pages: ?style=<styleId> opens a full class page for that style.
 *  Move detail: ?move=<moveId> (remembers ?style= so Back returns to the class page). */
export function useRoute() {
  const read = () => {
    const p = new URLSearchParams(window.location.search);
    return {
      moveId: p.get('move') || null,
      styleId: p.get('style') || null,
      tab: p.get('tab') || 'home',
    };
  };
  const [state, setState] = useState(read);

  useEffect(() => {
    const onPop = () => setState(read());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const push = useCallback((params) => {
    const url = params.moveId
      ? `?move=${params.moveId}&style=${params.styleId || ''}`
      : params.styleId
        ? `?style=${params.styleId}`
        : `?tab=${params.tab || 'home'}`;
    window.history.pushState({}, '', url);
    setState(read());
  }, []);

  return { ...state, navigateTo: push };
}
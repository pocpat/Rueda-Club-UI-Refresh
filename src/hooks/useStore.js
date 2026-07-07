import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'RUEDA_CLUB_USER_PROGRESS';
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

/** Hook for theme (dark/light) persisted to localStorage */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
}

/** Hook for URL-based routing via ?move=<id> query param */
export function useRoute() {
  const [moveId, setMoveId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('move');
  });

  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      setMoveId(params.get('move'));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigateTo = useCallback((path) => {
    window.history.pushState({}, '', path);
    const params = new URLSearchParams(window.location.search);
    setMoveId(params.get('move'));
  }, []);

  return { moveId, navigateTo };
}
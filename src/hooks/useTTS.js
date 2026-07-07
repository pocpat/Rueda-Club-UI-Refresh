import { useRef, useCallback } from 'react';

/** Hook for text-to-speech with queuing and cancellation */
export function useTTS() {
  const queueRef = useRef([]);
  const speakingRef = useRef(false);

  const next = useCallback(() => {
    if (speakingRef.current || queueRef.current.length === 0) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    speakingRef.current = true;
    const utterance = queueRef.current.shift();
    utterance.onend = () => {
      speakingRef.current = false;
      next();
    };
    utterance.onerror = () => {
      speakingRef.current = false;
      next();
    };
    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback((text, lang = 'es-ES') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    queueRef.current.push(utterance);
    next();
  }, [next]);

  const cancel = useCallback(() => {
    queueRef.current = [];
    speakingRef.current = false;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, cancel };
}
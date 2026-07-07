/** TTS (pronunciation) button with speaker icon */
export default function TTSButton({ text, lang = 'es-ES', onSpeak, size = 'md', className = '' }) {
  const dims = size === 'lg' ? 'w-12 h-12 min-w-12 min-h-12' : 'w-9 h-9 min-w-9 min-h-9';
  const iconDims = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSpeak(text, lang); }}
      aria-label={`Pronounce ${text}`}
      className={`${dims} ${className} inline-flex items-center justify-center rounded-full border-none bg-transparent cursor-pointer transition-all duration-200 hover:scale-110 active:scale-90`}
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(78, 205, 196, 0.1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className={iconDims} fill="currentColor">
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    </button>
  );
}
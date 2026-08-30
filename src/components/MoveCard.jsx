import { stripMarkdown } from '../lib/utils.js';
import TTSButton from './TTSButton.jsx';

/** Move card — Cuban flag theme. Heart = favorite (saved on this device). */
export default function MoveCard({ move, isCompleted, onSelectMove, onToggleComplete, onSpeak, isFavorite, onToggleFavorite }) {
  const excerpt = stripMarkdown(move.description).substring(0, 80);
  const accent = 'var(--accent)';

  return (
    <div
      className="move-card relative rounded-2xl p-4 cursor-pointer group overflow-hidden"
      onClick={() => onSelectMove(move.id)}
      role="article"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        border: `1px solid ${isCompleted ? accent + '40' : 'var(--glass-border)'}`,
        boxShadow: isCompleted ? 'var(--shadow-sm), 0 0 16px var(--accent-glow)' : 'var(--shadow-sm)',
        transition: 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1), background 0.2s ease, border-color 0.2s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--glass-hover)';
        e.currentTarget.style.borderColor = accent + '66';
        e.currentTarget.style.boxShadow = 'var(--shadow), 0 0 30px var(--accent-glow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--glass)';
        e.currentTarget.style.borderColor = isCompleted ? accent + '40' : 'var(--glass-border)';
        e.currentTarget.style.boxShadow = isCompleted ? 'var(--shadow-sm), 0 0 16px var(--accent-glow)' : 'var(--shadow-sm)';
      }}
    >
      {/* Accent bar at top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{
          background: isCompleted
            ? 'linear-gradient(90deg, var(--crimson), var(--crimson-deep))'
            : 'linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent-warm))',
          opacity: isCompleted ? 1 : 0.5,
        }}
      />

      {/* Title row */}
      <div className="flex items-start gap-2 mb-2 mt-1">
        <div className="flex-grow min-w-0">
          <h3 className="font-[var(--font-heading)] text-sm md:text-base font-semibold leading-tight" lang="es"
            style={{ color: 'var(--text)' }}
          >
            {move.name}
          </h3>
        </div>
        <TTSButton
          text={move.name}
          lang={move.lang || 'es-ES'}
          onSpeak={onSpeak}
          className="!w-8 !h-8 !min-w-8 !min-h-8 opacity-40 group-hover:opacity-100"
        />
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
        {excerpt}…
      </p>

      {/* Footer: tags + favorite heart + complete button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 flex-wrap flex-grow">
          {move.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}
            >
              {tag}
            </span>
          ))}
        </div>
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(move.id); }}
            aria-label={isFavorite ? `Remove ${move.name} from favorites` : `Add ${move.name} to favorites`}
            aria-pressed={isFavorite}
            className={`fav-btn${isFavorite ? ' is-fav' : ''}`}
            style={{ width: '36px', height: '36px' }}
          >
            <svg viewBox="0 0 24 24" width="17" height="17"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleComplete(move.id); }}
          aria-label={isCompleted ? `Mark ${move.name} as incomplete` : `Mark ${move.name} as complete`}
          aria-pressed={isCompleted}
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 transition-all duration-200 active:scale-90 border-none"
          style={isCompleted ? {
            background: 'linear-gradient(135deg, var(--crimson), var(--crimson-deep))',
            color: 'white',
            boxShadow: '0 0 12px var(--accent-glow)',
          } : {
            background: 'var(--glass)',
            border: '1px solid var(--glass-border)',
            opacity: '0.3',
          }}
          onMouseEnter={(e) => { if (!isCompleted) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = accent; } }}
          onMouseLeave={(e) => { if (!isCompleted) { e.currentTarget.style.opacity = '0.3'; e.currentTarget.style.borderColor = 'var(--glass-border)'; } }}
        >
          {isCompleted && (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
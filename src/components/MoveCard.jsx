import { stripMarkdown } from '../lib/utils.js';
import TTSButton from './TTSButton.jsx';

/** Move card — vibrant, dance-themed. No grey circle. Gradient accent bar + glow on hover. */
export default function MoveCard({ move, isCompleted, onSelectMove, onToggleComplete, onSpeak }) {
  const excerpt = stripMarkdown(move.description).substring(0, 80);

  return (
    <div
      className="move-card relative rounded-2xl p-4 cursor-pointer group overflow-hidden"
      onClick={() => onSelectMove(move.id)}
      role="article"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        border: `1px solid ${isCompleted ? 'rgba(78,205,196,0.25)' : 'var(--glass-border)'}`,
        boxShadow: isCompleted ? 'var(--shadow-sm), 0 0 16px rgba(78,205,196,0.08)' : 'var(--shadow-sm)',
        transition: 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1), background 0.2s ease, border-color 0.2s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--glass-hover)';
        e.currentTarget.style.borderColor = 'rgba(78,205,196,0.4)';
        e.currentTarget.style.boxShadow = 'var(--shadow), 0 0 30px rgba(78,205,196,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--glass)';
        e.currentTarget.style.borderColor = isCompleted ? 'rgba(78,205,196,0.25)' : 'var(--glass-border)';
        e.currentTarget.style.boxShadow = isCompleted ? 'var(--shadow-sm), 0 0 16px rgba(78,205,196,0.08)' : 'var(--shadow-sm)';
      }}
    >
      {/* Gradient accent bar at top — replaces the grey circle */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{
          background: isCompleted
            ? 'linear-gradient(90deg, #4ecdc4, #2dd4bf)'
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

      {/* Footer: tags + complete button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 flex-wrap">
          {move.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}
            >
              {tag}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleComplete(move.id); }}
          aria-label={isCompleted ? `Mark ${move.name} as incomplete` : `Mark ${move.name} as complete`}
          aria-pressed={isCompleted}
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 transition-all duration-200 active:scale-90 border-none"
          style={isCompleted ? {
            background: 'linear-gradient(135deg, #4ecdc4, #2dd4bf)',
            color: 'white',
            boxShadow: '0 0 12px rgba(78,205,196,0.4)',
          } : {
            background: 'var(--glass)',
            border: '1px solid var(--glass-border)',
            opacity: '0.3',
          }}
          onMouseEnter={(e) => { if (!isCompleted) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = 'var(--accent)'; } }}
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
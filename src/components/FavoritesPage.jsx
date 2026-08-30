import MoveCard from './MoveCard.jsx';

/** Favorites tab — only lessons the user hearted. Per-device (localStorage). */
export default function FavoritesPage({ data, favorites, onSelectMove, onToggleComplete, onSpeak, isFavorite, onToggleFavorite, isCompleted }) {
  const favMoves = data.moves.filter((m) => favorites.includes(m.id));

  return (
    <div className="tab-fade">
      <div className="class-page-head mb-6 flex items-center gap-4 flex-wrap">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
        <div>
          <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--accent)' }}>
            Favorites
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {favMoves.length > 0
              ? `${favMoves.length} lesson${favMoves.length === 1 ? '' : 's'} you marked with a heart`
              : 'Your hearted lessons live here'}
          </p>
        </div>
      </div>

      {favMoves.length === 0 ? (
        <div className="songs-empty">
          <div className="text-4xl mb-3">🤍</div>
          <p className="font-semibold text-lg mb-1" style={{ color: 'var(--text)' }}>No favorites yet</p>
          <p className="text-sm max-w-md mx-auto">
            Tap the heart on any lesson — in Classes or inside a lesson page — and it will be saved here on this device.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {favMoves.map((move) => (
            <MoveCard
              key={move.id}
              move={move}
              isCompleted={isCompleted(move.id)}
              onSelectMove={onSelectMove}
              onToggleComplete={onToggleComplete}
              onSpeak={onSpeak}
              isFavorite={isFavorite(move.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
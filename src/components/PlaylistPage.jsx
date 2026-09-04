import Flag from './Flag.jsx';

/** Playlist tab — songs from the Musicality section (data.songs).
 *  Empty for now: elegant "coming soon" state. Songs added to data.json appear here automatically. */
export default function PlaylistPage({ songs }) {
  return (
    <div className="tab-fade">
      <div className="class-page-head mb-6 flex items-center gap-4 flex-wrap">
        <Flag />
        <div>
          <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--accent-2)' }}>
            Musicality
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            The songs behind the dance — play them anywhere, train your ear.
          </p>
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="songs-empty">
          <div className="text-4xl mb-3">🎶</div>
          <p className="font-semibold text-lg mb-1" style={{ color: 'var(--text)' }}>Songs coming soon</p>
          <p className="text-sm max-w-md mx-auto">
            We're curating the ultimate Cuban playlist — classics from Celia Cruz, Buena Vista Social Club,
            modern timba and son. It will live here in the Musicality section.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {songs.map((song, i) => (
            <SongRow key={song.title + i} song={song} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function SongRow({ song, index }) {
  const soon = !song.url;
  return (
    <div className={`song-row${soon ? ' is-soon' : ''}`}>
      <span className="song-index">{index}</span>
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>
          {song.title}
        </p>
        <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
          {song.artist}
          {song.style ? ` · ${song.style}` : ''}
        </p>
      </div>
      {soon ? (
        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full"
          style={{ border: '1px dashed var(--glass-border)', color: 'var(--text-muted)' }}>
          soon
        </span>
      ) : (
        <a href={song.url} target="_blank" rel="noopener noreferrer"
          className="text-[10px] uppercase tracking-wider font-bold px-3 py-2 rounded-full"
          style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
          play
        </a>
      )}
    </div>
  );
}
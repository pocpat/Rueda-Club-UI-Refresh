import { useState, useRef, useEffect, useMemo } from 'react';

/** Autocomplete search with dropdown — vibrant circular-themed design */
export default function SearchBar({ moves, styles, levels, onSelect }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const levelMap = useMemo(() => new Map(levels.map((l) => [l.id, l])), [levels]);
  const styleMap = useMemo(() => new Map(styles.map((s) => [s.id, s])), [styles]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const results = [];
    for (const move of moves) {
      let source = null, context = null;
      if (move.name.toLowerCase().includes(q)) source = 'name';
      else if (move.tags?.some((t) => t.toLowerCase().includes(q))) {
        source = 'tag'; context = move.tags.find((t) => t.toLowerCase().includes(q));
      } else if (move.videos?.some((v) => v.title?.toLowerCase().includes(q))) {
        source = 'video'; context = move.videos.find((v) => v.title?.toLowerCase().includes(q))?.title;
      } else if (move.videos?.some((v) => v.chapters?.some((c) => (c.label || '').toLowerCase().includes(q)))) {
        source = 'chapter';
        const v = move.videos.find((v) => v.chapters?.some((c) => (c.label || '').toLowerCase().includes(q)));
        context = v?.chapters?.find((c) => (c.label || '').toLowerCase().includes(q))?.label;
      } else if (move.description?.toLowerCase().includes(q)) source = 'description';
      if (source) {
        const level = levelMap.get(move.levelId);
        const style = level ? styleMap.get(level.styleId) : null;
        results.push({ move, source, context, styleName: style?.name, levelName: level?.name, styleColor: style?.themeColor });
      }
    }
    return results.slice(0, 20);
  }, [query, moves, levelMap, styleMap]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleKeyDown = (e) => {
    if (!isOpen || matches.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((p) => Math.min(p + 1, matches.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((p) => Math.max(p - 1, 0)); }
    else if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); selectItem(matches[activeIndex].move.id); }
    else if (e.key === 'Escape') { setIsOpen(false); inputRef.current?.blur(); }
  };

  const selectItem = (moveId) => {
    setQuery(''); setIsOpen(false); setActiveIndex(-1); onSelect(moveId);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[600px] mx-auto mb-10">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
          viewBox="0 0 24 24" width="20" height="20" stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); setActiveIndex(-1); }}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
          placeholder="Search moves..."
          aria-label="Search moves"
          className="relative w-full py-3.5 pl-12 pr-4 rounded-full text-base font-sans transition-all duration-400 focus:outline-none"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid var(--glass-border)`,
            color: 'var(--text)',
          }}
          onFocusCapture={(e) => {
            e.target.style.borderColor = 'var(--accent)';
            e.target.style.boxShadow = '0 0 0 3px rgba(78, 205, 196, 0.2)';
          }}
          onBlurCapture={(e) => {
            e.target.style.borderColor = 'var(--glass-border)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {isOpen && matches.length > 0 && (
        <ul
          role="listbox"
          className="absolute top-full left-0 w-full max-h-[340px] overflow-y-auto rounded-2xl mt-2 p-2 list-none z-50 animate-slide-down"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          {matches.map((item, i) => (
            <li
              key={item.move.id}
              role="option"
              aria-selected={i === activeIndex}
              onClick={() => selectItem(item.move.id)}
              className="px-3 py-2.5 cursor-pointer rounded-xl transition-all duration-150 flex items-center gap-3"
              style={i === activeIndex ? { background: 'rgba(78, 205, 196, 0.12)' } : {}}
              onMouseEnter={(e) => { if (i !== activeIndex) e.currentTarget.style.background = 'rgba(78, 205, 196, 0.06)'; }}
              onMouseLeave={(e) => { if (i !== activeIndex) e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Style color dot */}
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.styleColor || 'var(--accent)' }} />
              <div className="flex flex-col gap-0.5 min-w-0 flex-grow">
                <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60" style={{ color: 'var(--text-secondary)' }}>
                  {item.styleName} · {item.levelName}
                </span>
                <span className="font-medium text-sm" style={{ color: 'var(--text)' }} lang="es">{item.move.name}</span>
              </div>
              {item.context && (
                <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(78, 205, 196, 0.12)', color: 'var(--accent)', border: '1px solid rgba(78, 205, 196, 0.2)' }}
                >
                  {item.source}: {item.context.length > 20 ? item.context.substring(0, 20) + '…' : item.context}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.trim() && matches.length === 0 && (
        <div className="absolute top-full left-0 w-full rounded-2xl mt-2 p-4 text-center z-50 animate-slide-down"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}
        >
          No moves found for "{query}"
        </div>
      )}
    </div>
  );
}
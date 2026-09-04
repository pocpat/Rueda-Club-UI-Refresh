import { useState, useRef, useEffect, useMemo } from 'react';

/** Autocomplete search with dropdown + level filter chips (toggle to narrow results) */
export default function SearchBar({ moves, styles, levels, onSelect }) {
  const [query, setQuery] = useState('');
  const [selectedLevels, setSelectedLevels] = useState(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const levelMap = useMemo(() => new Map(levels.map((l) => [l.id, l])), [levels]);
  const styleMap = useMemo(() => new Map(styles.map((s) => [s.id, s])), [styles]);

  const toggleLevel = (levelId) => {
    setSelectedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(levelId)) next.delete(levelId);
      else next.add(levelId);
      return next;
    });
  };

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const results = [];
    for (const move of moves) {
      if (selectedLevels.size > 0 && !selectedLevels.has(move.levelId)) continue;
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
  }, [query, moves, levelMap, styleMap, selectedLevels]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && matches.length > 0) selectItem(matches[activeIndex].move.id);
      else runSearch();
      return;
    }
    if (!isOpen || matches.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((p) => Math.min(p + 1, matches.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((p) => Math.max(p - 1, 0)); }
    else if (e.key === 'Escape') { setIsOpen(false); inputRef.current?.blur(); }
  };

  const selectItem = (moveId) => {
    setQuery(''); setIsOpen(false); setActiveIndex(-1); onSelect(moveId);
  };

  // "Run the search" / Enter — go to the best match (first result)
  const runSearch = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) { inputRef.current?.focus(); return; }
    if (matches.length > 0) {
      selectItem(matches[0].move.id);
    } else {
      setIsOpen(true); // show the "No moves found" state
    }
  };

  // Mobile keyboard fix: a virtual keyboard shrinks window.visualViewport.
  // Cap the results list to the actually-visible space, and flip it ABOVE the
  // input when the space below is too small — so results never hide under
  // the keyboard regardless of how far the page can scroll.
  const listRef = useRef(null);
  const [listPlacement, setListPlacement] = useState('below');
  const [listMaxH, setListMaxH] = useState(340);
  useEffect(() => {
    if (!isOpen || matches.length === 0) return;
    const fit = () => {
      const input = inputRef.current;
      if (!input) return;
      const vv = window.visualViewport;
      const vTop = vv ? vv.offsetTop : 0;
      const vBottom = vv ? Math.min(vv.height + vv.offsetTop, window.innerHeight) : window.innerHeight;
      const r = input.getBoundingClientRect();
      const spaceBelow = vBottom - r.bottom - 12;
      const spaceAbove = r.top - vTop - 12;
      if (spaceBelow >= 180 || spaceBelow >= spaceAbove) {
        setListPlacement('below');
        setListMaxH(Math.max(120, Math.min(340, spaceBelow)));
      } else if (spaceAbove > 120) {
        setListPlacement('above');
        setListMaxH(Math.max(120, Math.min(340, spaceAbove)));
      }
    };
    fit();
    const vv = window.visualViewport;
    vv?.addEventListener('resize', fit);
    window.addEventListener('scroll', fit, { passive: true });
    return () => {
      vv?.removeEventListener('resize', fit);
      window.removeEventListener('scroll', fit);
    };
  }, [isOpen, matches.length]);

  const resultsDropdown = isOpen && matches.length > 0 && (
    <ul
      ref={listRef}
      role="listbox"
      className="absolute left-0 w-full rounded-2xl p-2 list-none z-50 animate-slide-down"
      style={{
        maxHeight: listMaxH,
        overflowY: 'auto',
        ...(listPlacement === 'above'
          ? { bottom: 'calc(100% + 8px)' }
          : { top: 'calc(100% + 8px)' }),
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
  );

  const noResultsBox = isOpen && query.trim() && matches.length === 0 && (
    <div className="absolute left-0 w-full rounded-2xl p-4 text-center z-50 animate-slide-down"
      style={{
        top: 'calc(100% + 8px)',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-secondary)',
      }}
    >
      No moves found for "{query}"
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-[600px] mx-auto mb-10">
      <form className="relative" onSubmit={runSearch} role="search">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
          viewBox="0 0 24 24" width="20" height="20" stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          id="move-search"
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); setActiveIndex(-1); }}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
          placeholder="Search moves..."
          aria-label="Search moves"
          enterKeyHint="search"
          className="relative w-full py-3.5 pl-12 pr-16 rounded-full text-base font-sans transition-all duration-400 focus:outline-none"
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
        {/* Run-search button — explicit submit for mobile users */}
        <button
          type="submit"
          aria-label="Run the search"
          className="search-run-btn"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        {resultsDropdown}
        {noResultsBox}
      </form>

      {/* Level filter chips — toggle to narrow the search results */}
      <div className="level-chips mt-3" role="group" aria-label="Filter by level">
        {levels.map((l) => {
          const active = selectedLevels.has(l.id);
          return (
            <button
              key={l.id}
              type="button"
              className={`level-chip filter-chip${active ? ' is-active' : ''}`}
              aria-pressed={active}
              onClick={() => toggleLevel(l.id)}
            >
              {l.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
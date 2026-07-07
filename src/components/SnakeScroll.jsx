import { useEffect, useRef, useState } from 'react';

/**
 * Snake scroll animation — 4 wavy SVG paths with dashed strokes that flow
 * as you scroll the page. Based on the CodePen by ikrprojects.
 * The SVG height is measured dynamically to match the content from
 * the top of the wrapper through the footer text (not the footer's bottom margin).
 */
export default function SnakeScroll() {
  const bodyRef = useRef(null);
  const [svgHeight, setSvgHeight] = useState(2000);

  useEffect(() => {
    const measure = () => {
      if (!bodyRef.current) return;
      const parent = bodyRef.current.parentElement;
      if (!parent) return;
      // Find the footer element inside the wrapper
      const footer = parent.querySelector('.text-center.mt-16');
      if (footer) {
        // Snake height = distance from wrapper top to footer text bottom
        const parentTop = parent.getBoundingClientRect().top;
        const footerTop = footer.getBoundingClientRect().top;
        const footerTextHeight = footer.querySelector('p')?.offsetHeight || 20;
        const height = footerTop - parentTop + footerTextHeight;
        setSvgHeight(Math.max(200, height));
      } else {
        setSvgHeight(parent.scrollHeight);
      }
    };
    measure();
    // Re-measure on resize and when styles expand/collapse
    const ro = new ResizeObserver(measure);
    if (bodyRef.current?.parentElement) ro.observe(bodyRef.current.parentElement);
    window.addEventListener('resize', measure);
    // Also re-measure after a delay to catch dynamic content
    const timeout = setTimeout(measure, 500);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!bodyRef.current) return;
      const rect = bodyRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      // Progress: 0 when snake top enters viewport, 1 when bottom exits
      const totalScroll = rect.height + viewportHeight;
      const scrolled = viewportHeight - rect.top;
      const scrollProgress = Math.max(0, Math.min(1, scrolled / totalScroll));
      // Move dash offset to make dots flow
      const dashOffset = -(2400 * scrollProgress);
      bodyRef.current.style.setProperty('--strokeDashoffset', dashOffset);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial
    return () => window.removeEventListener('scroll', onScroll);
  }, [svgHeight]);

  return (
    <div ref={bodyRef} className="snake-scroll-container" style={{ height: svgHeight }}>
      <svg width="740" height={svgHeight} viewBox="0 45 740 2000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Dark mode gradient — matches existing teal/purple/coral theme */}
          <linearGradient id="snakeGradDark" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="1">
            <stop offset="20%" stopColor="#4ecdc4" />
            <stop offset="45%" stopColor="#a78bfa" />
            <stop offset="65%" stopColor="#ff6b6b" />
            <stop offset="85%" stopColor="#ffd93d" />
            <stop offset="100%" stopColor="#4ecdc4" />
          </linearGradient>
          {/* Light mode gradient — warm orange/purple/gold to match existing theme */}
          <linearGradient id="snakeGradLight" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="1">
            <stop offset="20%" stopColor="#e85a4f" />
            <stop offset="45%" stopColor="#f9a826" />
            <stop offset="65%" stopColor="#7c5cf8" />
            <stop offset="85%" stopColor="#e85a4f" />
            <stop offset="100%" stopColor="#f9a826" />
          </linearGradient>

          {/* The 4 wavy paths from the CodePen */}
          <path id="linePath01" d="m 106,45h 375c 114,0 226,128 226,235v 236c 0,136 -122,222 -224,221l -182,-2c -89,1 -141,42 -142,158l -2,204c -1,117 37,173 134,173h 186c 110,-3 230,111 230,220v 242c 0,113 -125,225 -248,225H 105" />
          <path id="linePath02" d="m 33,85h 444c 96,0 190,107 190,201v 224c 0,116 -98,188 -190,187l -192,-2c -92,0 -166,75 -166,168v 278c 0,94 74,169 166,169h 194c 92,0 188,94 188,188v 228c 0,94 -104,191 -214,191H 105" />
          <path id="linePath03" d="m 155,127h 308c 94,0 162,86 162,177v 178c 0,109 -50,174 -166,173L 277,653C 158,653 77,762 77,849v 302c 0,118 107,196 180,197l 204,4c 92,0 164,67 164,160v 200c 0,91 -89,163 -188,163H 105" />
          <path id="linePath04" d="m 283,173c 2,0 165,0 165,0C 544,175 577,238 577,330v 156c 0,94 -48,126 -140,125L 269,609C 167,602 29,702 29,851v 312c 0,111 101,235 242,235h 162c 109,1 144,49 144,136v 162c 0,73 -53,130 -118,130l -353,1" />
        </defs>

        {/* Paths — each has different stroke width and dot/gap pattern */}
        <use href="#linePath01" className="snake-path snake-path-dark" style={{ strokeWidth: 3, vectorEffect: 'non-scaling-stroke' }} />
        <use href="#linePath02" className="snake-path snake-path-dark" style={{ strokeWidth: 5, vectorEffect: 'non-scaling-stroke' }} />
        <use href="#linePath03" className="snake-path snake-path-dark" style={{ strokeWidth: 4, vectorEffect: 'non-scaling-stroke' }} />
        <use href="#linePath04" className="snake-path snake-path-dark" style={{ strokeWidth: 6, vectorEffect: 'non-scaling-stroke' }} />
      </svg>
    </div>
  );
}
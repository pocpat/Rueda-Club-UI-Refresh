# Rueda Club — UI Redesign Proposal

A modern UI redesign proposal for the [Rueda Club](https://ruedaclub.vercel.app) website, created to improve the user experience while preserving the club's identity.

> **Note:** This is a redesigned version of the Rueda Club app, built as a proposal to showcase a modernized interface. It is **not the original app** — it is an independent rebuild presented to the club's owners for consideration.

---

## What This Is

The original Rueda Club website provides a Cuban dance curriculum with 224 moves across 11 levels and 4 styles (Rueda de Casino, Son Cubano, Documentary, Musicality). This project rebuilds the entire front-end with a contemporary design system while keeping the same content and structure.

### Design Highlights

- **Dark mode default** with deep near-black backgrounds and multi-radial gradient glows
- **Glassmorphism surfaces** — backdrop-filter blur, translucent cards, subtle borders
- **Floating blurred orbs** for atmospheric depth
- **Noise texture overlay** for a tactile, non-flat feel
- **Gradient text** for headings and logo (mint to violet to pink)
- **Glossy buttons** with bright gradients, inset highlights, and lift-on-hover
- **Slight card rotations** that straighten on hover ("structured but free-styled like Rueda dance")
- **Move of the Day** — randomly selected each day, changes at midnight, excludes Documentary (informational, not a dance move)
- **CSS offset-path snake animation** — ambient flowing dots along an SVG path
- **Light/dark theme toggle** with localStorage persistence
- **Full responsive layout** — desktop and mobile

### Tech Stack

- **React 19** + **Vite 8** — fast SPA with HMR
- **Tailwind CSS v4** — utility-first styling
- **YouTube IFrame API** — embedded video player facade with mute-then-unmute autoplay
- **Web Speech API** — text-to-speech for move names (Spanish pronunciation)
- **localStorage** — progress tracking (completed moves) and theme persistence
- **Vercel** — deployment target

---

## Project Structure

```
app/
  public/
    images/            — placeholder images + sign graphic
    data.json          — curriculum data (224 moves, 11 levels, 4 styles)
    favicon.svg
  src/
    components/         — React components
      Header.jsx
      HeroSection (in App.jsx)
      MoveOfTheDay.jsx
      SearchBar.jsx
      StyleSection.jsx
      LevelSection.jsx
      MoveCard.jsx
      MoveDetail.jsx
      VideoPlayer.jsx
      TTSButton.jsx
      ProgressRing.jsx
      SnakeScroll.jsx
      Chevron.jsx
    hooks/             — custom React hooks
      useClubData.js   — data access helpers
      useStore.js      — progress, theme, routing
      useTTS.js        — text-to-speech
      useYouTube.js    — YouTube IFrame player
    lib/
      utils.js         — YouTube ID extraction, markdown strip, Move of the Day
      data.js          — data.json import
    App.jsx
    main.jsx
    index.css          — global styles, design tokens, scrollbar, animations
  tests/
    unit/              — Vitest unit + component tests (67 tests)
    e2e/               — Playwright E2E tests (11 tests)
    scripts/
      check-links.mjs  — live YouTube link checker (357 URLs)
  vite.config.js
  vitest.config.js
  playwright.config.js
  package.json
```

---

## Getting Started

### Prerequisites

- **Node.js 18+** (20 or 22 recommended)
- **npm** (comes with Node.js)

### Install

```bash
cd app
npm install
```

### Run the Dev Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

Output goes to `app/dist/`. Preview the production build locally:

```bash
npm run preview
```

---

## Testing

This project includes three types of tests:

| Type | Runner | Count | Command |
|------|--------|-------|---------|
| Unit & Component | Vitest + Testing Library | 67 | `npm test` |
| E2E | Playwright (Chromium) | 11 | `npm run test:e2e` |
| Link Checker | Node.js script | 357 URLs | `npm run test:links` |
| All (unit + e2e) | — | — | `npm run test:all` |

### Unit Tests (67 tests)

Located in `tests/unit/`:

- **utils.test.js** (24 tests) — YouTube ID extraction, markdown stripping, time formatting, Move of the Day (random per day, deterministic, excludes Documentary, fallback handling)
- **useClubData.test.js** (13 tests) — data access helpers (getLevelsForStyle, getMovesForLevel, getMovesForStyle, findMove, calcStats)
- **data-integrity.test.js** (13 tests) — validates data.json structure (4 styles, 11 levels, 224 moves, unique IDs, valid references, valid YouTube URLs, Documentary has 19 moves)
- **MoveOfTheDay.test.jsx** (7 tests) — renders move name, label, max 3 tags, Explore button, null move, markdown stripped
- **SearchBar.test.jsx** (5 tests) — search input, results dropdown, no-results message, click-to-select, clears after selection
- **link-checker.test.js** (5 tests) — URL format validation, video ID extraction, duplicate detection, summary report

### E2E Tests (11 tests)

Located in `tests/e2e/app.spec.js`:

- Page loads with header and hero
- All 4 style sections rendered
- Clicking a style section expands it
- Search bar finds a move
- Search shows "No results" for nonsense
- Clicking a search result navigates to move detail
- Move detail page renders with back button
- Theme toggle works (dark/light)
- Footer shows move count
- Style shortcut buttons scroll to section
- No console errors on page load

### Link Checker (357 URLs)

The link checker script (`tests/scripts/check-links.mjs`) does live HTTP checks of every YouTube video URL in the dataset using YouTube's oembed API. Dead links are printed with:

- The broken URL and reason (404, timeout, etc.)
- Which moves use the broken video
- A "Will be fixed soon" note
- A YouTube search suggestion URL to find a replacement

```bash
npm run test:links
```

Current status: all 357 links are alive.

---

## Linting

```bash
npm run lint
```

Uses [Oxlint](https://oxc.rs) for fast JavaScript/React linting.

---

## Deployment to Vercel

1. Push this repository to your GitHub
2. In Vercel, import the GitHub repository
3. Set the project root to `app/` (or the repo root if `app/` is at the top level)
4. Framework preset: **Vite**
5. Build command: `npm run build` (auto-detected)
6. Output directory: `dist` (auto-detected)
7. No environment variables required — all data is bundled

The app is a static SPA, so no server-side configuration is needed.

---

## Content Data

All curriculum content lives in `public/data.json` (also available as `src/data.json` for bundling). The structure:

- **styles** (4) — Rueda de Casino, Son Cubano, Documentary, Musicality — each with a theme color
- **levels** (11) — grouped under styles (e.g. Foundations, Beginner, Improver, Intermediate, Advanced under Rueda de Casino)
- **moves** (224) — each with name, description, tags, language, and 1-2 YouTube videos with chapter timestamps

---

## License

This is a UI redesign proposal. The original Rueda Club content and branding belong to their respective owners.

---

## Acknowledgements

- Original Rueda Club website: [ruedaclub.vercel.app](https://ruedaclub.vercel.app)
- Built with React, Vite, Tailwind CSS, and the YouTube IFrame API
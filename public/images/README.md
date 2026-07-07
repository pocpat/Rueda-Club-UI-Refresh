# Image Placeholders

This project uses SVG placeholder images in `/public/images/`. Replace them with real photos/illustrations when ready.

## Where placeholders are used

| Placeholder file | Used in | Replace with |
|---|---|---|
| `placeholder-hero.svg` | Hero banner on dashboard | Wide photo of dancers in a rueda circle (1200×400+) |
| `placeholder-move.svg` | Move card thumbnails (optional) | Photo/illustration of each move (400×400 square) |
| `placeholder-video.svg` | Video thumbnail fallback | Only shows if YouTube thumbnail fails to load |

## How to replace

1. Put your real images in `public/images/` (e.g., `public/images/hero-dancers.jpg`)
2. In the component files, replace the placeholder src:
   - `src/components/MoveOfTheDay.jsx` → hero banner
   - `src/components/MoveCard.jsx` → move card image (optional, currently not shown — you can enable it)
   - `src/components/VideoPlayer.jsx` → video fallback

## Per-move images (future feature)

The data model doesn't currently have an `image` field on moves.
To add per-move images, you could:
1. Add an `image: "/images/moves/setenta-y-dos.jpg"` field to moves in `src/data.json`
2. Update `MoveCard.jsx` to show `<img src={move.image || '/images/placeholder-move.svg'} />`
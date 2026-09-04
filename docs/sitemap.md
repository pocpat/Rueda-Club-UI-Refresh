# Rueda Club — Site Map & Navigation Map

One-hand mobile UX reference: every screen, every path, and how many taps each core task costs.

## Screens & paths

```mermaid
flowchart TD
    classDef page fill:#F4F6F8,stroke:#2E5FA3,stroke-width:2px,color:#0D1B2A
    classDef chrome fill:#0C1F3C,stroke:#0C1F3C,color:#FFFFFF
    classDef key fill:#FFFFFF,stroke:#D90429,stroke-width:3px,color:#0D1B2A

    NAV["NAVBAR — logo → Home · hamburger → Menu · day/night"]:::chrome
    TABS["FOOTER TABS — Home · Classes · Playlist · Community · Favorites<br/>(always visible, thumb zone)"]:::chrome

    subgraph CORE["Core flow — 1–3 taps, one thumb"]
      HOME["HOME<br/>4 tiles · Quick Actions"]:::page
      SEARCH["SEARCH<br/>find by name + level filters"]:::page
      LEVELS["LEVELS<br/>all levels + counters"]:::page
      CLASS["CLASS PAGE<br/>Rueda / Son / Documentary / Musicality"]:::page
      DETAIL["LESSON<br/>video · chapters · description · ♥"]:::key
    end

    subgraph MORE["Other destinations"]
      PLAYLIST["PLAYLIST<br/>songs — coming soon"]:::page
      COMMUNITY["COMMUNITY<br/>venue + Google Maps"]:::page
      FAVS["FAVORITES<br/>hearted lessons (on device)"]:::page
      DRAWER["MENU DRAWER<br/>all tabs + styles"]:::page
    end

    NAV -->|"logo"| HOME
    NAV -->|"hamburger"| DRAWER
    TABS -->|"Home"| HOME
    TABS -->|"Classes"| SEARCH
    TABS -->|"Playlist"| PLAYLIST
    TABS -->|"Community"| COMMUNITY
    TABS -->|"Favorites"| FAVS

    HOME -->|"tile VIEW / Find class"| DETAIL
    HOME -->|"tile OPEN"| CLASS
    HOME -->|"Search circle"| SEARCH
    HOME -->|"Level circle"| LEVELS
    HOME -->|"Play music"| PLAYLIST

    SEARCH -->|"tap result / run"| DETAIL
    SEARCH -->|"style card OPEN"| CLASS
    LEVELS -->|"lesson card"| DETAIL
    CLASS -->|"lesson card"| DETAIL
    FAVS -->|"lesson card"| DETAIL

    DRAWER -->|"tab / style"| CLASS
    DETAIL -->|"Back — returns to origin"| CLASS
```

## Core tasks — tap cost from Home

| Task | Path | Taps |
|---|---|---|
| Watch today's lesson | Home → tile VIEW | **1** |
| Open a style's classes | Home → style tile OPEN | **1** |
| Open a level's lessons | Home → Level → pick level | **2** |
| Find a move by name | Home → Search → type → tap result | **3** (2 if via footer Classes) |
| Watch a random Foundations tutorial | Home → Find class | **1** |
| Favorite a lesson | Lesson → ♥ | **1** (from anywhere) |
| See only my favorites | Footer → Favorites | **1** |
| Venue directions | Footer → Community → Maps | **2** |

## Keyboard & accessibility map

| Where | Key | Action |
|---|---|---|
| Search field | Enter | run search (opens best match) |
| Search results | ↓ / ↑ | move through results |
| Search results | Enter | open highlighted result |
| Search / drawer | Escape | close results / drawer |
| Every screen | Tab | all controls reachable in DOM order |
| Mobile keyboard | auto | results dropdown flips above input — never hidden under keyboard |

*Search input is 16px — iOS Safari does not zoom on focus. All tap targets ≥ 44px.*

## Routes (shareable URLs)

| Screen | URL |
|---|---|
| Home | `/?tab=home` (default `/`) |
| Search | `/?tab=classes` |
| Levels | `/?tab=levels` |
| Class page | `/?style=style-rueda-de-casino` (also son-cubano, documentary, musicality) |
| Lesson | `/?move=<moveId>&style=<styleId>` |
| Playlist | `/?tab=playlist` |
| Community | `/?tab=community` |
| Favorites | `/?tab=favorites` |

---
*This map is generated from the current code and re-verified after each UI change. Happy to produce it as a spreadsheet of paths or an auto-generated report on request.*
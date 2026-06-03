# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zen Manga is a client-side-only Nuxt 4 SPA (SSR disabled) that acts as a front-end for the MangaDex public API. It is deployed to GitHub Pages at `/zen-manga/` with hash-based routing, served as a PWA.

## Commands

```bash
pnpm dev          # Start dev server on http://localhost:8086
pnpm build        # Build for GitHub Pages (preset: github_pages)
pnpm postinstall  # Re-generate Nuxt type stubs (runs automatically after install)
```

No test suite or linter is configured.

## Architecture

### API Layer (`app/utils/`)
All MangaDex API calls go through `mangadex.ts`, which wraps every request in `fetchWithProxy` (`fetch-with-proxy.ts`). The proxy (`https://corsproxy.10jmellott.workers.dev`) is a Cloudflare Worker that bypasses CORS since the browser can't hit the MangaDex API directly. Cover art and chapter images are also proxied through the same worker via `transformForProxy`.

`mangadex.ts` owns the Mangadex-to-app type transformation (raw API shapes → `Manga` / `MangaChapter` / `MangaTag` from `app/types/manga.ts`). The internal Mangadex interface types live at the bottom of that file.

### State Management (`app/stores/`)
Three Pinia stores:
- **`manga-store`** — fetched manga data (lists, current series, current chapter images, search results). The `currentChapterGroups` getter groups chapters by volume then chapter number. Contains guard logic to avoid re-fetching if `currentManga.id` already matches, and paginates chapter fetching in batches of 100.
- **`user-store`** — all user state persisted to `localStorage`: recently read series (capped at 32), favorite series, and read chapters per series (keyed as `read_<seriesId>`).
- **`layout-store`** — controls header/nav visibility with scroll-based auto-hide (only on chapter routes, triggered after a 50px delta). Initialized once in `app.vue`.

### Routing (`app/pages/`)
| Route | Page |
|---|---|
| `/` | Home — scrollable lists of latest/newest/popular/recent/favorite manga |
| `/:series` | Series detail — cover, metadata, full paginated chapter list |
| `/:series/:chapter` | Chapter reader — image strip; tapping toggles header/nav |

The `:series` param is the MangaDex manga UUID; `:chapter` is the MangaDex chapter UUID.

### Layout (`app/app.vue`)
Sticky header (top) and sticky bottom navigation are toggled via CSS `opacity` + `pointer-events` rather than `v-if`, so they remain in the DOM. The `.padded` class is removed on chapter routes so images fill edge-to-edge.

### Styling
- Global CSS variables defined in `app/assets/styles/theme.css` — use `--spacing` (16px), `--padding` (8px), `--border-radius`, `--primary`, etc. rather than hard-coding values.
- Typography scale in `typography.css` uses class names: `.h1`–`.h4`, `.body1`–`.body2`, `.caption1`–`.caption2`.
- Utility classes: `.muted` (opacity 0.6), `.glass`, `.card`, `.hide-scrollbar`, `.fade-animation` / `.fade`.
- `@nuxt/icon` is used for icons (e.g. `<Icon name="fe:heart" />`).

### Web Comic Detection
`manga-store.isWebComic` returns `true` when the series has the `Web Comic` or `Long Strip` tag, which affects the chapter page layout (removes gap between images for vertical strips).

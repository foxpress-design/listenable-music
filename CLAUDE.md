# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Writing Style
Never use em dashes (--) in any output. Use commas, periods, or parentheses instead. This applies to all written content, code comments, commit messages, and copy.

## Commands

```bash
pnpm dev          # Vite dev server on http://localhost:5173
pnpm build        # Vite build (also strips dist/music after building)
pnpm deploy       # Build then deploy to Cloudflare Pages via wrangler
pnpm lint         # ESLint
```

For local dev with Cloudflare bindings (D1/R2), use `wrangler pages dev dist` after building, or configure `wrangler.toml` local dev. The API functions (`functions/`) only run in a Wrangler or Pages environment, not in the plain Vite dev server.

To apply a new D1 migration locally:
```bash
npx wrangler d1 execute listenable-db --local --file=migrations/00XX_name.sql
```

## Architecture

This is a React 19 + Vite SPA deployed to **Cloudflare Pages**. The backend is entirely serverless, implemented as **Cloudflare Pages Functions** in `functions/`.

### Frontend (`src/`)

`App.jsx` is a thin `BrowserRouter` shell with two routes:
- `/` renders `src/pages/Home.jsx` (all public-facing content)
- `/admin/*` renders `src/pages/Admin.jsx` (admin panel)

Key hooks:
- `useAudioPlayer.js` -- manages a single `<audio>` element via `audioRef`, handles canplay/ended events to avoid race conditions; all playback state lives here
- `usePlayCounts.js` -- fetches from `/api/counts` and POSTs to `/api/play`
- `useTheme.js` -- light/dark theme toggle

Track data is defined statically in `src/tracks.js`. Music files are served from R2 at `/music/*`, not bundled in the build.

The admin panel (`src/admin/`) is a tab-based layout with five sections: Subscribers, Email, Submissions, Events, Analytics. Auth token is stored in `localStorage` as `admin_token`.

### Backend (`functions/`)

File-based routing via Cloudflare Pages Functions:

| Path | Purpose |
|------|---------|
| `functions/[[path]].js` | SPA catch-all: returns `index.html` for 404s, passes through `/api/` and `/music/` |
| `functions/music/[[path]].js` | Serves MP3s from R2 with range request support for audio seeking |
| `functions/api/_middleware.js` | CORS for allowed origins |
| `functions/api/admin/_middleware.js` | Bearer token auth for all admin routes (validates `session`-type tokens against D1) |
| `functions/api/auth/` | Magic link login + verify flow |
| `functions/api/play.js` | Increments play count in D1 |
| `functions/api/counts.js` | Returns all play counts |
| `functions/api/subscribe.js` | Adds subscriber, sends Resend welcome email |
| `functions/api/admin/send-email.js` | Broadcasts email to all subscribers via Resend |
| `functions/api/bandcamp/collection.js` | Bandcamp collection, cached in D1 `bandcamp_cache` table |

### Database (D1: `listenable-db`)

Core tables: `subscribers`, `admin_sessions`, `unsubscribe_tokens`, `submissions`, `play_counts`, `analytics_events`, `sent_emails`, `bandcamp_cache`, `kv`.

Migrations live in `migrations/`. Add new migrations as `00XX_description.sql` files; they must be applied manually with `wrangler d1 execute`.

### Storage (R2: `listenable-uploads`)

Two namespaces in the bucket:
- `music/*` -- all MP3 files referenced in `src/tracks.js`
- `submissions/*` -- community-submitted photos and music files

## Deployment

The GitHub Actions workflow deploys via `wrangler-action` on push to main. The `pnpm deploy` script handles manual deploys. Music files are NOT part of the build; `pnpm build` explicitly deletes `dist/music` after Vite builds.

## Workflow

Enter plan mode when touching 3+ files, new API endpoints, or schema changes. Skip for single-component edits or bug fixes.

## Verification Before Done

1. Run `pnpm lint` and paste the output.
2. For UI changes, test in the browser at localhost:5173.
3. For API changes, note that functions only execute under `wrangler pages dev` (not plain Vite).

# Listenable Music - James Campbell (AIA) Tribute

A digital tribute site for James Campbell (AIA), featuring his music collection with an integrated web player.

## What's New (v1.2.16)

- Fix: Resend rate limit errors when sending to multiple subscribers (250ms delay between sends)

## v1.2.15

- Email replies now route to philip@foxpress.design instead of bouncing (hello@listenablemusic.ca is send-only)

## v1.2.14

- Email deliverability: all admin-sent emails now include a plain-text alternative and List-Unsubscribe headers, reducing spam filter false positives

## v1.2.13

- Admin Events: per-subscriber checkboxes for targeted email sends
- Admin Events: remove individual subscribers from event list

## v1.2.12

- June 17 event fully updated: confirmed venue (The Draft Room, 395 Keele St, Toronto), 4pm reservation, England v Croatia (FIFA World Cup 2026)
- Events section moved to top of page
- Venue links to Google Maps with pin icon
- "Add to Calendar" button sits inline with interest counter, shows full text on desktop

## v1.2.1

- Fix admin login emails landing in Junk: changed sender from admin@ to hello@ (matching subscribe/broadcast emails), added HTML button + plain-text alternative body to reduce spam score, and added error handling + sent_emails logging to the login function

## v1.0.1

- Music files served from R2 with range request support for audio seeking
- Removed old standalone play-counter worker (migrated to Pages Functions)
- Added deploy script: `pnpm deploy`
- Build now excludes music files from dist (served via R2)

## v1.0.0 - Platform Launch

- **Cloudflare Pages migration**: D1 database, R2 storage, Pages Functions API
- **Email subscriptions**: Subscribe form with Resend welcome emails and unsubscribe compliance
- **Community submissions**: Photo and music upload form with R2 storage, pending/approved/rejected workflow
- **Bandcamp integration**: James's collection scraped from Bandcamp internal API, cached in D1, displayed with album art grid and iframe embeds
- **Client-side routing**: react-router-dom for / and /admin routes

## v0.9.5

- Add client-side routing with react-router-dom
- Extract home page content into src/pages/Home.jsx (self-contained with all state and hooks)
- Add src/pages/Admin.jsx placeholder at /admin route
- App.jsx is now a minimal BrowserRouter shell

## v0.9.4

- Add Subscribe Form component to Share section with email input validation
- Subscribe form sends POST to /api/subscribe endpoint (backend implementation TBD)
- Styled with accent green button and monospace font, matches site design
- Shows success/error messages with visual feedback

## v0.9.3

- Migrate to Cloudflare Pages: wrangler.toml with D1 and R2 bindings
- Pages Functions: SPA catch-all, CORS middleware, play and counts API endpoints
- Play count API now served same-origin at /api (was external Cloudflare Worker)
- GitHub Actions: deploy via wrangler-action instead of GitHub Pages

## v0.9.2

- Initial D1 database schema: subscribers, admin sessions, submissions, analytics, play counts, email logs
- Migration: 0001_initial.sql with 8 core tables for platform expansion

## v0.9.1

- OG share card for social media previews (1200x630)
- Open Graph and Twitter Card meta tags
- "Share" section with copy link and Facebook share buttons
- Platform expansion plan for subscriptions, admin, community submissions, Bandcamp integration

## v0.9.0

- Mobile: player on its own line below the logo
- Mobile: collapsible track selector dropdown with close button and tap-outside dismiss
- Mobile: elapsed/total time and EQ indicator next to track title
- Mobile: full-width progress bar replaces header bottom border
- Mobile: version number aligned to the right
- Mobile: hero photo preserves aspect ratio

## v0.8.1

- Music player expands to full section width

## v0.8.0

- AIA logo: custom SVG mark (two overlapping chevrons with center dot)
- Logo used as browser favicon, in header nav, and above hero title
- Larger artist photo in The Artist section

## v0.7.1

- Add session history for development continuity

## v0.7.0

- Play count tracking via Cloudflare Worker + KV storage
- Per-track and per-album aggregate play counts displayed in the music player
- Version label in site header
- Counts increment on each track play and update in real time

## v0.6.1

- Fix CI deploy: switch GitHub Actions workflow from npm to pnpm
- Remove stale package-lock.json (pnpm-lock.yaml is the source of truth)

## v0.6.0

- GA4 analytics with custom events for track plays, track downloads, album downloads
- Per-track download button ("dl") in tracklist
- Per-album "download all" button that zips tracks client-side with JSZip
- Download progress indicator in album header

## v0.5.1

- Logo and player controls on one line in the header

## v0.5.0

- Full music player moved to sticky header (prev/play/next, track selector dropdown, progress bar, time/volume inline)
- Mobile: minified player with play/pause, track name, progress bar, and tap-to-open track list
- Music section now shows just the collapsible tracklist

## v0.4.3

- Reduce hero padding and photo size to fit above the fold

## v0.4.2

- Hero layout: photo and name side by side in two columns, centered
- Photo scales up to nearly fill viewport width (clamp 280px to 500px)
- Stacks vertically on mobile

## v0.4.1

- Replace Artist section photo with IMG_0347 (DJing shot)
- Hero photo now displays uncropped (full portrait, no square crop)

## v0.4.0

- All tracks hosted in-repo for reliable same-origin playback
- DJ mixes re-encoded to VBR to fit under Git's 100MB file limit
- Short tracks at 320kbps, Shiftless at original 192kbps

## v0.3.0

- Move all tracks to GitHub Releases, removing 186MB of MP3s from the repo
- All 27 tracks now served from release assets

## v0.2.2

- Fix audio playback: defer play() until canplay event fires instead of racing the browser
- Fix event listener gap during re-renders by attaching listeners once with stable refs
- Player controls now inline below tracklist instead of fixed overlay blocking songs
- Show audio errors in UI for debugging

## v0.2.1

- Fix audio playback by removing crossOrigin attribute that blocked GitHub Release CDN
- Fix header dropdown hover gap so it stays open when moving mouse to it

## v0.2.0

- Fix audio playback (repo made public so GitHub Release URLs work)
- Restore header quick player with track dropdown
- Shared audio state between header player and tracklist

## v0.1.0

- Add music player with full playback controls (play/pause, next/prev, seek, volume)
- Convert FLAC and WAV source files to 320kbps MP3
- Short tracks hosted in-repo, DJ mixes served from GitHub Releases
- Restore hero photo of James
- Collapsible album sections: DJ Aia Mixes, Nexus - Fable, Nexus - Shiftless, Singles

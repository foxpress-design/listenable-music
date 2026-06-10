# Session History

## 2026-03-23: Fix deploy, add play counts and version label (v0.6.1 -> v0.7.0)

### Summary
- Diagnosed why GA4 tracking and download buttons weren't showing on listenablemusic.ca: the v0.6.0 deploy had failed because `package-lock.json` was out of sync with new `jszip`/`file-saver` deps
- Fixed CI workflow to use pnpm instead of npm (matching local dev setup), removed stale `package-lock.json` (v0.6.1)
- Installed wrangler globally via pnpm (`pnpm add -g wrangler`) so it's available across all projects
- Logged into Cloudflare as philip@foxpress.design (Foxpress Design account)
- Created a Cloudflare Worker (`play-counter`) with KV storage for tracking play counts
  - Worker URL: `https://play-counter.foxpress.workers.dev`
  - KV namespace ID: `6eb307af1b9f47c09cec3b66b7daede6`
  - Endpoints: POST /play (increment), GET /counts (read all)
  - CORS locked to listenablemusic.ca and localhost
- Integrated play counts into the site: per-track counts and per-album aggregate counts
- Added version label to header: "Listenable Music v0.7.0"
- All deployed and verified (v0.7.0)

### Key Decisions
- Cloudflare Worker + KV chosen for play counts (free tier, user already has Cloudflare)
- Worker deployed under Foxpress Design account (not Subfolder)
- Album counts computed client-side by summing track counts
- pnpm is the standard package manager across all projects

### Files Modified
- `.github/workflows/deploy.yml` - switched from npm to pnpm
- `package.json` - version bumped to 0.7.0
- `README.md` - changelog updates
- `src/App.jsx` - version label, play count integration
- `src/App.css` - version label styling
- `src/MusicPlayer.jsx` - display per-track and per-album play counts
- `src/MusicPlayer.css` - play count styling
- `src/usePlayCounts.js` - new hook for fetching/recording play counts
- `worker/src/index.js` - Cloudflare Worker for play counter API
- `worker/wrangler.toml` - Worker config
- `package-lock.json` - deleted (pnpm-lock.yaml is source of truth)

### Current State
- Site live at listenablemusic.ca running v0.7.0
- All features working: player, GA4 analytics, downloads, play counts
- Branch: `claude/james-campbell-tribute-site-Gwdbs`

### Open Items
- None

## 2026-03-23: AIA logo design and integration (v0.7.1 -> v0.8.0)

### Summary
- Brainstormed and designed the AIA logo using the visual companion (browser-based mockup tool)
- Logo concept: two overlapping chevrons (∧∧) with a center dot, reading as A·I·A
- Iterated through 7 rounds of mockups to nail: overlap amount (criss-crossing inner legs), proportions (shorter/wider), flat horizontal baseline (clip-path), and dot sizing at small scales
- Final design: clean stroke chevrons, center cross at mid-height, flush flat base, geometric/monochrome
- Integrated logo in three places: favicon, header nav (inline with "Listenable Music"), hero section (above James's name)
- Created reusable AiaLogo React component with configurable size and color
- Enlarged the artist photo in The Artist section (300px to full-width, max 700px)
- Expanded music player to full section width (removed padding-left constraints)

### Key Decisions
- Logo style: clean strokes (not filled geometric or diamond intersection variants)
- Overlap: moderate criss-cross with inner legs crossing at center height
- Flat baseline via SVG clip-path (not serif feet)
- Logo color uses var(--accent) to match site theme
- Favicon is the raw white-on-transparent SVG

### Files Modified
- `public/aia-logo.svg` - new logo SVG file
- `src/AiaLogo.jsx` - new reusable React component
- `src/App.jsx` - logo in header and hero, version bump to v0.8.0
- `src/App.css` - logo styling, larger artist photo, full-width music player
- `index.html` - favicon changed from vite.svg to aia-logo.svg
- `package.json` - version 0.8.0
- `README.md` - changelog for v0.8.0

### Current State
- Commit 24bf67c pushed to origin
- Music player width fix is uncommitted
- Branch: `claude/james-campbell-tribute-site-Gwdbs`

### Open Items
- Commit the music player full-width change

## 2026-03-23: Mobile player fixes, OG card, platform expansion (v0.9.0 -> v1.0.1)

### Summary

**Mobile player improvements (v0.9.0):**
- Player moved to its own second line below the logo on mobile
- Track selector dropdown now collapsible with tap-outside dismiss (used requestAnimationFrame to prevent same-click close)
- Added elapsed/total time display and EQ animation next to track title
- Full-width progress bar replaces header bottom border on mobile
- Version number right-aligned on mobile
- Hero photo aspect ratio preserved (fixed forced square crop)
- Learned that `backdrop-filter: blur()` creates a containing block for fixed-position descendants, breaking fixed overlays inside the header

**OG share card and share section (v0.9.1):**
- Generated 1200x630 OG card using sharp (James's photo, AIA logo, site branding)
- Added Open Graph and Twitter Card meta tags
- Added Share section with "Copy Link" and "Share on Facebook" buttons

**Platform expansion (v0.9.2 -> v1.0.1):**
- Wrote comprehensive implementation plan (docs/superpowers/plans/2026-03-23-platform-expansion.md)
- Executed all 14 tasks via subagent-driven development
- Created Cloudflare D1 database (listenable-db, ID: b846e693-348c-41e1-a777-5f493d4fdcb3) with 8 tables
- Created Cloudflare R2 bucket (listenable-uploads) for file storage
- Migrated from GitHub Pages to Cloudflare Pages
- Music files (27 MP3s) uploaded to R2 with a Pages Function proxy supporting range requests
- Removed old standalone play-counter worker (migrated to Pages Functions)
- Added email subscribe form with Resend integration (welcome email + unsubscribe compliance)
- Added react-router-dom for client-side routing (/ and /admin)
- Built admin dashboard at /admin with:
  - Magic link auth (login via Resend, 7-day session tokens, type-separated tokens for security)
  - Subscriber list with CSV export
  - Email composer with batch sending and per-recipient unsubscribe links
  - Analytics dashboard (subscribers, plays, top tracks, submissions)
  - Submission moderation (approve/reject workflow)
- Added community submission form (photo/music upload to R2, pending review)
- Added Bandcamp collection player (scrapes jamesambient's collection via internal API, 24h D1 cache, album art grid with iframe embeds)
- First Cloudflare Pages deploy successful at https://450b9c56.listenable-music.pages.dev

### Key Decisions
- Cloudflare Pages over GitHub Pages (same-origin API, D1/R2 integration)
- D1 (SQLite) over KV for relational data (subscribers, submissions, analytics)
- Magic link auth with type-separated tokens (magic_link vs session) for security
- Bandcamp internal API (`fancollection/1/collection_items`) over HTML scraping (more stable)
- Music served from R2 via Pages Function (Pages has 25MB file limit)
- Build script strips music/ from dist automatically

### Infrastructure
- Cloudflare account: philip@foxpress.design (Foxpress Design)
- D1 database: listenable-db (b846e693-348c-41e1-a777-5f493d4fdcb3)
- R2 bucket: listenable-uploads
- Pages project: listenable-music
- Old KV namespace (play counts): 6eb307af1b9f47c09cec3b66b7daede6 (data not yet migrated to D1)

### Files Modified (major)
- `wrangler.toml` - new top-level Pages config
- `functions/` - 12 API endpoint files (auth, subscribe, play counts, admin, bandcamp, music proxy, submissions)
- `src/pages/Home.jsx` - extracted from App.jsx
- `src/pages/Admin.jsx` - admin dashboard with auth flow
- `src/admin/` - AdminLogin, AdminLayout, SubscriberList, EmailComposer, SubmissionReview, Analytics, admin.css
- `src/components/` - SubscribeForm, SubmissionForm, BandcampPlayer
- `src/App.jsx` - now just a router shell
- `migrations/0001_initial.sql` - D1 schema
- `index.html` - OG/Twitter meta tags
- `public/og-card.png` - social share card
- `.github/workflows/deploy.yml` - switched to Cloudflare Pages deploy
- `worker/` - deleted (migrated to Pages Functions)

### Current State
- v1.0.1 pushed to origin
- First Cloudflare Pages deploy live
- Branch: `claude/james-campbell-tribute-site-Gwdbs`

### Open Items
- Domain transfer from Namecheap to Cloudflare (not started yet)
- Set up Resend account and verify listenablemusic.ca domain
- Set Resend API key: `npx wrangler pages secret put RESEND_API_KEY`
- Migrate existing play count data from KV to D1
- Add Resend DNS records (SPF, DKIM) for email sending

## 2026-03-23: Light/dark theme, UI polish, R2 music fix (v1.1.0)

### Summary

**Light/dark/auto theme toggle:**
- Added `useTheme` hook with localStorage persistence and `prefers-color-scheme` media query listener
- Three modes cycling: auto (system) -> light -> dark
- Light mode uses warm sepia-toned palette (#ede4d4 background, darkened green #007a48 accent)
- Dark mode vignette overlay (rgba(0,0,0,0.35)), light mode warm sepia vignette
- Increased background grid visibility in dark mode (3% -> 6% opacity)
- Theme toggle shows `[theme]`, briefly flashes selection (system/light/dark) for 1.5s
- All hardcoded colors replaced with CSS variables for theme compatibility
- Admin page colors (approve button, status indicators) also theme-aware

**Favicon update:**
- Transparent background, white logo on dark tabs, black on light tabs
- Cache-busted with ?v=3 query param

**Auto-play toggle:**
- Added `[auto-play]`/`[no-auto]` button next to volume slider in header player
- Controls whether tracks advance automatically when a song ends
- Shows on desktop next to volume, on mobile inline with << >> buttons

**Community submission form polish:**
- Added "Share a Memory" tab (default) for text stories/memories
- Added music URL sources: YouTube, Spotify, Tidal (in addition to file upload)
- "Submit anonymously" checkbox hides name/email fields
- "I confirm I have the right to share this content" required checkbox
- "Notify me when new memories or content are added" subscribe checkbox
- Name placeholder: "Your name / DJ handle (or both)"
- Tab renamed from "Share Music" to "Music / Video"
- Wider form (420px -> 520px)

**Subscribe form polish:**
- Added name field ("Your name / DJ handle (optional)")
- Inline layout on desktop (name + email + button in one row), stacks on mobile
- Centered form and label
- Backend updated to store subscriber name in D1

**Section consolidation:**
- Merged "Connect" and "Share" into single "Connect" section
- Bandcamp collection moved into Music section under "James's Favourites" subheading
- Two-column layout for Bandcamp intro (text left, browse button right)

**Page view counter:**
- Created `/api/pageviews` endpoint with D1 `page_views` table
- Displays "AIA's digital memorial has been visited by X friends, fans and family members."
- Added "This page was last updated on March 23, 2026."

**Footer:**
- Added credit line: "Maintained by his friend Fox Jones" with mailto feedback@listenablemusic.ca

**Text contrast:**
- Dark mode: primary #e0e0e0 -> #f0f0f0, secondary #999 -> #b0b0b0
- Light mode: primary #2a2520 -> #1a1510, secondary #6b6560 -> #504840

**R2 music streaming fix:**
- Discovered R2 bucket was empty (files never uploaded from git history)
- Extracted all 27 MP3s from git commit 4130fa8 and uploaded to R2
- Fixed `functions/[[path]].js` catch-all intercepting `/music/` and `/api/` routes (was serving SPA fallback instead of function)
- Fixed URL-encoded path params (added `decodeURIComponent`)
- Added `Cache-Control: no-store` on 404 responses to prevent edge caching of errors

**CI/CD fix:**
- Added `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` GitHub secrets
- Fixed wrangler-action config (added `packageManager: pnpm`)
- Set `--branch=main` for production deploys
- CI now passes and deploys to production on push

**Mobile header layout:**
- Theme toggle `[theme]` on first line with logo + version
- Player controls on second line with `[auto]` inline with << >> buttons
- Progress bar full width on third line

### Key Decisions
- Warm sepia light mode (not pure white or cool gray) to match memorial tone
- Theme toggle shows generic `[theme]` to avoid confusion with `[auto-play]`
- "auto" renamed to "system" in UI display
- R2 music keys match original file paths (with spaces, parentheses)
- 404 responses not cached at edge to prevent stale errors after R2 uploads

### D1 Migrations Applied
- `ALTER TABLE subscribers ADD COLUMN name TEXT` (already existed)
- `CREATE TABLE IF NOT EXISTS page_views (page TEXT PRIMARY KEY, count INTEGER DEFAULT 0)`

### Files Modified
- `src/useTheme.js` - new theme hook
- `src/index.css` - light mode variables, new utility variables
- `src/App.css` - theme toggle, vignette, form styles, mobile layout, contrast
- `src/MusicPlayer.css` - auto-play button, inline loading fix, mobile layout
- `src/MusicPlayer.jsx` - auto-play toggle (desktop + mobile)
- `src/useAudioPlayer.js` - autoPlay state, conditional track advancement
- `src/pages/Home.jsx` - theme toggle, section consolidation, page views, footer credit
- `src/components/SubmissionForm.jsx` - memory tab, music URLs, anonymous, rights checkbox
- `src/components/SubscribeForm.jsx` - name field, inline layout
- `src/admin/admin.css` - theme-aware status/button colors
- `src/AiaLogo.jsx` - unchanged (uses currentColor)
- `public/aia-logo.svg` - transparent bg, light/dark adaptive
- `index.html` - cache-busted favicon
- `functions/[[path]].js` - exclude music/api from SPA fallback
- `functions/music/[[path]].js` - decodeURIComponent, no-store on 404
- `functions/api/pageviews.js` - new page view counter
- `functions/api/subscribe.js` - accept and store name
- `.github/workflows/deploy.yml` - CI fixes, production deploy
- `docs/superpowers/plans/2026-03-23-light-mode.md` - implementation plan

### Current State
- v1.1.0 deployed to production at listenablemusic.ca
- All 27 MP3s in R2, streaming works
- CI deploys to production on push
- Branch: `claude/james-campbell-tribute-site-Gwdbs`
- Old `play-counter` worker can be safely deleted from Cloudflare

### Open Items
- Migrate existing play count data from KV to D1
- Bandcamp collection player only works on production (needs D1)
- Update last-updated date in Home.jsx when making future changes

## 2026-03-24: UI polish, submissions, email notifications, admin improvements

### Summary

**Continued UI polish:**
- Favicon: transparent background, white on dark tabs, black on light tabs
- Header: switched to `position: fixed` (matching glhi-holdings approach) to prevent content showing through status bar on iPhone
- Added `theme-color` meta tags for iOS status bar coloring (dark: #000, light: #ede4d4)
- Theme toggle: shows `[theme]` by default, flashes `[auto]`/`[light]`/`[dark]` on click for 1.5s
- Auto-play renamed to `[flow]`/`[single]` to avoid confusion with theme `[auto]`
- Version number: removed double opacity, now clickable to open changelog
- Changelog popup: full version history from v0.1.0 to v1.1.0 with dates for recent versions
- Pulsing green notification dot on version when new changes are live (localStorage tracks last seen version)
- Text contrast increased in both themes
- Mobile: connect buttons in 2x2 full-width grid, balanced sequencer padding
- Bottom sequencer: KITT scanner animation (bouncing left-to-right using `steps(15) infinite alternate`)
- Top sequencer: randomized flash timing
- Larger AIA logo at bottom of Connect section (120px, slightly transparent in dark mode)
- Footer: "Site maintained by his biggest fan and friend" with feedback mailto link, last updated date
- OG card: multiple iterations improving text size, contrast, randomized sequencer dots, cache-busted

**Community submissions system:**
- D1 schema updated: added `memory` type to submissions CHECK constraint, made `email`/`file_key`/`file_name` nullable
- Backend handles three submission types: memory (text stored in R2), photo (file in R2), music (file or URL from YouTube/Spotify/Tidal)
- Approved submissions displayed in Community section with photos inline, memories as text blocks, music as links
- Submission form collapsed behind "Do you have a memory, photo, or music to share about James?" toggle
- Public file endpoint `/api/submissions/file/[id]` serves only approved submissions

**Email notifications (Resend):**
- RESEND_API_KEY added to Pages secrets
- Subscriber welcome email on sign-up
- Submission confirmation email to submitter
- New submission notification to admin with APPROVE/REJECT buttons in email
- Email action endpoint `/api/submissions/action` for one-click approve/reject from email (auth via last 8 chars of API key)
- Rejection email to submitter with optional reason, encouraging resubmission
- All emails logged to `sent_emails` table via shared `_email-log.js` helper

**Admin dashboard improvements:**
- Mobile responsive: header wraps, tabs scroll, compact stats/tables
- Submission review: memory type badge, photo preview (fetched with auth token via blob URL), memory text preview
- Actions on all statuses: approve from rejected, reject from approved, delete from any
- Reject form with optional reason field (emailed to submitter)
- Delete removes submission from D1 and file from R2
- Email history table in Email tab showing subject, recipients, date (last 20 entries)

**CI/CD:**
- GitHub secrets: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
- Workflow fixed: `packageManager: pnpm`, `--branch=main` for production deploys
- CI now passes and auto-deploys to production

**R2 music fix:**
- Extracted all 27 MP3s from git history (commit 4130fa8) and uploaded to R2
- Fixed SPA catch-all intercepting `/music/` and `/api/` routes
- Added `decodeURIComponent` for URL-encoded path params
- 404 responses not cached (`Cache-Control: no-store`)

### D1 Migrations Applied
- `CREATE TABLE page_views (page TEXT PRIMARY KEY, count INTEGER DEFAULT 0)`
- Recreated `submissions` table: added `memory` type, made `email`/`file_key`/`file_name` nullable

### Infrastructure
- Resend API key set in Pages secrets
- `play-counter` worker deleted from Cloudflare (safe, functionality migrated to Pages Functions)
- R2 bucket populated with all 27 MP3 files

### Files Modified (major)
- `src/pages/Home.jsx` - changelog popup, community posts, theme toggle, visitor counter, bottom logo
- `src/App.css` - fixed header, KITT scanner, community posts, autofill fix, vignette, contrast
- `src/MusicPlayer.jsx` - flow/single toggle on mobile
- `src/MusicPlayer.css` - auto-play button styling, inline loading fix
- `src/admin/SubmissionReview.jsx` - photo/memory preview, reject form, delete action
- `src/admin/EmailComposer.jsx` - email send history table
- `src/admin/admin.css` - mobile responsive, preview styles, reject form
- `src/components/SubmissionForm.jsx` - memory tab, music URLs, anonymous, rights checkbox
- `src/components/SubscribeForm.jsx` - name field, inline layout
- `src/components/BandcampPlayer.jsx` - removed redundant fallback button
- `functions/api/submissions/upload.js` - memory/URL handling, email notifications, logging
- `functions/api/submissions/action.js` - new: email approve/reject endpoint
- `functions/api/submissions/file/[id].js` - new: public file serving for approved submissions
- `functions/api/admin/submission-file/[id].js` - new: admin file serving with auth
- `functions/api/admin/submissions.js` - delete, rejection email with reason, logging
- `functions/api/_email-log.js` - new: shared email logging helper
- `functions/api/pageviews.js` - new: page view counter
- `functions/[[path]].js` - exclude music/api from SPA fallback
- `functions/music/[[path]].js` - decodeURIComponent fix
- `index.html` - theme-color meta, cache-busted favicon/OG
- `public/aia-logo.svg` - transparent adaptive favicon
- `public/og-card.png` - updated social card
- `.github/workflows/deploy.yml` - CI fixes

### Current State
- Site live at listenablemusic.ca with all features working
- CI auto-deploys to production on push
- Resend email notifications active
- Community submissions flowing: submit -> email confirm -> admin review -> approve/reject -> public display
- Branch: `claude/james-campbell-tribute-site-Gwdbs`

### Open Items
- GitHub Issue #1: Add events section
- Migrate existing play count data from KV to D1
- Bandcamp collection player only works on production (needs D1)
- Update `currentVersion` in Home.jsx and last-updated date on future changes
- Consider adding approved submission notification email to submitter

## 2026-03-24: Supporting His Memory, Events, admin Events tab (v1.2.0 -> v1.2.1+)

### Summary

**Supporting His Memory section (between Community and Connect):**
- Four cards in a responsive grid: Bandcamp, EFF, ISO 50/Tycho, Simon Stalenhag
- Each card has a featured art image (desaturated, colorizes on hover), description with inline links, and action buttons
- Bandcamp: James's collection (213 artists), links to bandcamp.com/jamesambient
- EFF: hoodie image with logo overlay (ImageMagick composite), newsletter link, podcast link, Visit EFF.org + Donate buttons
- ISO 50 / Tycho: Scott Hansen's Zabriskie Point art, shop/newsletter links, ISO50 Gallery + Tycho Music buttons
- Simon Stalenhag: Swedish sci-fi landscape painting, Gallery + Buy Prints buttons
- Full-width "Protect Your Privacy Online" card at bottom with Proton logo, Proton Mail and Proton VPN buttons with SVG icons
- All images clickable, linking to respective sites
- Button pairs display inline with equal width

**Events section (between Supporting His Memory and Connect):**
- "Raise a Pint for James" event card for June 17th, 2026, Toronto
- James's 49th birthday
- FIFA World Cup 2026 Match 21 note
- "Add to Calendar" button (Google Calendar, positioned top-right of card)
- EventSignup component with name/email form, tagged as `event-june17` in DB
- Clickable interest badge: heart to like/unlike (once per browser via localStorage)
- Interest count combines DB signups + likes (likes stored in D1 kv table)
- Event signup sends dedicated email with date, location (Toronto, TBA), calendar link, share link
- Already-subscribed users can still sign up for event (updates their source tag)
- New mailing list subscribers get upcoming event info in welcome email

**Site navigation dropdown:**
- Hover over "Listenable Music" title to reveal section nav dropdown
- Click AIA logo to pin/dismiss nav (logo rotates 180 degrees when open)
- Dismisses on outside click (mobile support) and on item selection
- Smooth scroll to sections with 7rem scroll-padding-top
- Hash links work on page load (React Router scroll fix with 500ms delay)
- 8 sections: In Memoriam, The Artist, Music, Legacy, Community, Supporting His Memory, Events, Connect

**KITT sequencer rewrite:**
- Replaced `::after` overlay with per-step animation
- Each step lights up in sequence with staggered delays and fade trail
- Uses `color-mix()` for intermediate fade states
- Bounces back and forth via `alternate`

**Admin notifications:**
- Admin gets email on every new mailing list and event signup
- Includes email, name, signup type, source tag
- Event name links to website #events section

**Admin Events tab:**
- New tab in admin dashboard
- Lists active events with subscriber counts (green badge)
- Full attendee table per event (email, name, signup date)
- "Email attendees" button opens inline compose form, sends only to that event's subscribers
- "Add Event" form (name, date, location, subscriber tag)
- Event configs stored in D1 kv table as `event-config-{tag}`
- API endpoints: GET/POST /api/admin/events, POST /api/admin/events/email

**Admin Email history:**
- Full history of all emails (system and manual) with body_html column
- New migration 0003: `ALTER TABLE sent_emails ADD COLUMN body_html TEXT`
- All email sends now log full HTML body (subscribe, event, admin campaigns)
- Email history table shows subject, recipients, sent by (system/manual badge), date
- Click any row to open preview modal with full email content
- New API endpoint: GET /api/admin/emails (list all, or ?id=N for single)

**D1 migrations:**
- 0002_kv_table.sql: Simple key-value store for counters and settings
- 0003_email_body.sql: body_html column on sent_emails
- Both applied to local and production

### Key Decisions
- Featured art images downloaded to public/ folder (not hotlinked) for reliability
- EFF logo composited onto hoodie image using ImageMagick
- Event interest uses D1 kv table (not Cloudflare KV namespace) for simplicity
- Like/unlike is anonymous (localStorage only), signups require email
- Event configs stored as JSON in kv table, keyed by `event-config-{tag}`
- All emails (system auto and manual) logged with full HTML for admin preview

### Files Created
- `src/components/EventSignup.jsx` - event signup form with tag
- `src/admin/EventsManager.jsx` - admin events management
- `functions/api/event-interest.js` - GET/POST event interest counts
- `functions/api/admin/events.js` - GET/POST event configs
- `functions/api/admin/events/email.js` - send email to event attendees
- `functions/api/admin/emails.js` - email history API
- `migrations/0002_kv_table.sql` - kv table
- `migrations/0003_email_body.sql` - body_html column
- `public/bandcamp-collection.jpg` - Bandcamp card art
- `public/eff-art.jpg` - EFF hoodie with logo overlay
- `public/iso50-art.jpg` - ISO 50 Zabriskie Point art
- `public/stalenhag.jpg` - Simon Stalenhag painting
- `public/eff-logo.svg` - EFF block letter mark (later replaced)
- `public/proton-logo.svg` - Proton logo
- `public/proton-mail.svg` - Proton Mail icon
- `public/proton-vpn.svg` - Proton VPN icon

### Files Modified
- `src/pages/Home.jsx` - Supporting His Memory, Events, nav dropdown, hash scroll, version bump
- `src/App.css` - support grid/cards, event card/badge, nav dropdown, KITT rewrite, Proton styles
- `src/index.css` - scroll-padding-top
- `src/admin/AdminLayout.jsx` - Events tab
- `src/admin/EmailComposer.jsx` - full email history with preview modal
- `src/admin/admin.css` - events manager, email history/preview styles
- `functions/api/subscribe.js` - event signup flow, admin notifications, email logging
- `functions/api/admin/send-email.js` - log full HTML body
- `functions/api/admin/events/email.js` - log full HTML body
- `functions/api/_email-log.js` - added bodyHtml parameter

### Current State
- v1.2.0+ deployed to production
- Events section live with interest tracking
- Admin Events tab functional
- All email history viewable in admin
- Branch: `claude/james-campbell-tribute-site-Gwdbs`

### Open Items
- Migrate existing play count data from KV to D1
- Bandcamp collection player only works on production (needs D1)
- Update `currentVersion` to next version on future changes
- Event venue TBA (will need update as June 17th approaches)

## 2026-06-10: Version number correction (v1.2.1)

### Summary
- Discovered version number discrepancy: README and package.json said v1.0.2 but live site showed v1.2.0
- Root cause: June 10 admin login fix commit incorrectly set version to v1.0.2 (site was already at v1.2.0)
- Home.jsx currentVersion string happened not to be touched in that commit, so UI stayed correct at v1.2.0
- Fixed by bumping package.json, README, and Home.jsx currentVersion to v1.2.1
- Added v1.2.1 changelog entry in the in-app changelog popup

### Files Modified
- `package.json` - version 1.2.1
- `README.md` - What's New header corrected to v1.2.1
- `src/pages/Home.jsx` - currentVersion = 'v1.2.1', added v1.2.1 changelog entry

### Current State
- Commit 521bcae on branch, not yet pushed
- Branch: `claude/james-campbell-tribute-site-Gwdbs`

### Open Items
- Push branch and deploy when ready

## 2026-06-10: Admin login deliverability fix + SPF/DKIM/DMARC (v1.0.2)

### Summary

**Created CLAUDE.md** with full codebase documentation: commands, architecture overview, frontend/backend structure, D1 schema, R2 storage layout, deployment notes.

**Admin login email going to Junk (fixed):**
- Root cause: login.js was sending from `admin@listenablemusic.ca` (a thin sender) instead of `hello@listenablemusic.ca` (used by all other working email). Body was also a bare 3-line URL which is a spam signal.
- Fix in `functions/api/auth/login.js`:
  - Changed sender to `hello@listenablemusic.ca`
  - Rewrote body with greeting, styled button, plain-text `text:` alternative, and signature
  - Added try/catch, `res.ok` check, `console.error` on failure, and `logEmail` logging to `sent_emails`
- Verified fix works (email now lands in Inbox)

**Email domain authentication (DNS, done in Cloudflare):**
- DKIM: was already configured at `resend._domainkey.listenablemusic.ca` (two keys)
- SPF: updated root TXT from `include:_spf.mx.cloudflare.net ~all` to add `include:amazonses.com`
- DMARC: strengthened root `_dmarc.listenablemusic.ca` from `p=none` to `p=quarantine; rua=mailto:philip@foxpress.design`
- `send.listenablemusic.ca`: Resend bounce subdomain, already has correct SPF/MX, no changes needed

### Files Modified
- `CLAUDE.md` - new, codebase documentation
- `functions/api/auth/login.js` - sender, body, error handling, logging
- `package.json` - version 1.0.2
- `README.md` - changelog for v1.0.2

### Current State
- v1.0.2 deployed to production
- Admin login emails reliably land in Inbox
- Full SPF/DKIM/DMARC in place for listenablemusic.ca
- Branch: `claude/james-campbell-tribute-site-Gwdbs`

### Open Items
- Migrate existing play count data from KV to D1
- Bandcamp collection player only works on production (needs D1)
- Event venue TBA (will need update as June 17th approaches)

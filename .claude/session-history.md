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

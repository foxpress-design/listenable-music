# Listenable Music - James Campbell (AIA) Tribute

A digital tribute site for James Campbell (AIA), featuring his music collection with an integrated web player.

## What's New (v0.6.1)

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

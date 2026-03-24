import { useEffect, useState } from 'react'
import MusicPlayer, { HeaderPlayer } from '../MusicPlayer'
import useAudioPlayer from '../useAudioPlayer'
import usePlayCounts from '../usePlayCounts'
import AiaLogo from '../AiaLogo'
import useTheme from '../useTheme'
import SubscribeForm from '../components/SubscribeForm'
import SubmissionForm from '../components/SubmissionForm'
import BandcampPlayer from '../components/BandcampPlayer'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pageViews, setPageViews] = useState(null)
  const [showThemePref, setShowThemePref] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  const currentVersion = 'v1.1.0'
  const [hasNewVersion, setHasNewVersion] = useState(() => {
    try {
      return localStorage.getItem('aia-last-seen-version') !== currentVersion
    } catch { return false }
  })
  const player = useAudioPlayer()
  const theme = useTheme()
  const { counts, recordPlay } = usePlayCounts()

  useEffect(() => {
    setMounted(true)
    fetch('/api/pageviews', { method: 'POST' })
      .then(r => r.json())
      .then(d => setPageViews(d.views))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (player.currentTrack) {
      recordPlay(player.currentTrack.src)
    }
  }, [player.currentTrack, recordPlay])

  return (
    <div className="app">
      <audio ref={player.audioRef} preload="none" />

      <header className="header">
        <div className="header-content">
          <div className="logo"><AiaLogo size={16} color="var(--accent)" className="logo-icon" /> Listenable Music <button className="logo-version" onClick={() => { setShowChangelog(!showChangelog); if (hasNewVersion) { setHasNewVersion(false); try { localStorage.setItem('aia-last-seen-version', currentVersion) } catch {} } }}>{currentVersion}{hasNewVersion && <span className="version-dot" />}</button></div>
          <HeaderPlayer player={player} />
          <button className="theme-toggle" onClick={() => {
            theme.cycle()
            setShowThemePref(true)
            setTimeout(() => setShowThemePref(false), 1500)
          }}>
            [{showThemePref ? theme.preference : 'theme'}]
          </button>
        </div>
      </header>

      {showChangelog && (
        <div className="changelog-overlay" onClick={() => setShowChangelog(false)}>
          <div className="changelog" onClick={(e) => e.stopPropagation()}>
            <div className="changelog-header">
              <h3>What's New</h3>
              <button className="changelog-close" onClick={(e) => { e.stopPropagation(); setShowChangelog(false) }}>x</button>
            </div>
            <div className="changelog-entries">
              <div className="changelog-entry">
                <span className="changelog-version">v1.1.0</span>
                <span className="changelog-date">March 24, 2026</span>
                <ul>
                  <li>Light/dark/auto theme toggle with warm sepia light mode</li>
                  <li>Flow/single auto-play toggle in header player</li>
                  <li>Community form: share memories, stories, photos, or music links (YouTube, Spotify, Tidal)</li>
                  <li>Anonymous submission option with rights confirmation</li>
                  <li>Subscribe for notifications when new content is added</li>
                  <li>Page view counter and clickable changelog</li>
                  <li>Improved text contrast, mobile layout, and social share card</li>
                  <li>Music streaming fix for R2 storage</li>
                  <li>CI/CD auto-deploy to Cloudflare Pages</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v1.0.1</span>
                <span className="changelog-date">March 23, 2026</span>
                <ul>
                  <li>Music files served from R2 with range request support for seeking</li>
                  <li>Removed old standalone play-counter worker (migrated to Pages Functions)</li>
                  <li>Added deploy script</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v1.0.0</span>
                <span className="changelog-date">March 23, 2026</span>
                <ul>
                  <li>Platform launch: Cloudflare Pages with D1 database and R2 storage</li>
                  <li>James's Bandcamp collection browser with album art and embedded player</li>
                  <li>Email subscriptions with Resend welcome emails and unsubscribe compliance</li>
                  <li>Community photo and music upload form with moderation workflow</li>
                  <li>Admin dashboard: subscriber management, email composer, analytics, submission review</li>
                  <li>Magic link authentication for admin access</li>
                  <li>Client-side routing with react-router-dom</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v0.9.0</span>
                <span className="changelog-date">March 23, 2026</span>
                <ul>
                  <li>Mobile player: own line below logo, collapsible track selector, tap-outside dismiss</li>
                  <li>Elapsed/total time display and EQ animation next to track title</li>
                  <li>Full-width progress bar replaces header border on mobile</li>
                  <li>Hero photo preserves aspect ratio on mobile</li>
                  <li>OG share card (1200x630) for Facebook and Twitter</li>
                  <li>Share section with copy link and Facebook buttons</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v0.8.0</span>
                <span className="changelog-date">March 23, 2026</span>
                <ul>
                  <li>AIA logo: custom SVG mark (two overlapping chevrons with center dot)</li>
                  <li>Logo as browser favicon, in header nav, and above hero title</li>
                  <li>Larger artist photo in The Artist section</li>
                  <li>Music player expanded to full section width</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v0.7.0</span>
                <span className="changelog-date">March 23, 2026</span>
                <ul>
                  <li>Play count tracking via Cloudflare Worker + KV storage</li>
                  <li>Per-track and per-album aggregate play counts in the player</li>
                  <li>Version label in site header</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v0.6.0</span>
                <span className="changelog-date">March 23, 2026</span>
                <ul>
                  <li>GA4 analytics with custom events for plays and downloads</li>
                  <li>Per-track download button in tracklist</li>
                  <li>Per-album "download all" with client-side ZIP via JSZip</li>
                  <li>Download progress indicator</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v0.5.0</span>
                <span className="changelog-date">March 23, 2026</span>
                <ul>
                  <li>Full music player moved to sticky header (prev/play/next, dropdown, progress, volume)</li>
                  <li>Mobile: minified player with play/pause, track name, tap-to-open track list</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v0.4.0</span>
                <span className="changelog-date">March 23, 2026</span>
                <ul>
                  <li>All tracks hosted in-repo for reliable same-origin playback</li>
                  <li>DJ mixes re-encoded to VBR to fit under Git's 100MB limit</li>
                  <li>Side-by-side hero layout with photo and name in two columns</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v0.3.0</span>
                <span className="changelog-date">March 23, 2026</span>
                <ul>
                  <li>Move all 27 tracks to GitHub Releases, removing 186MB from repo</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v0.2.0</span>
                <span className="changelog-date">March 23, 2026</span>
                <ul>
                  <li>Audio playback fixes (defer play until canplay, stable refs for listeners)</li>
                  <li>Header quick player with track dropdown and shared audio state</li>
                  <li>Dropdown hover gap fix</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v0.1.0</span>
                <span className="changelog-date">March 23, 2026</span>
                <ul>
                  <li>Initial memorial site for James Campbell (AIA)</li>
                  <li>Music player with full controls (play/pause, next/prev, seek, volume)</li>
                  <li>320kbps MP3s: DJ Aia mixes, Nexus Fable, Nexus Shiftless, and singles</li>
                  <li>In memoriam, artist bio, and legacy sections</li>
                  <li>Sequencer visual elements and glitch text effects</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="hero">
        <div className="hero-columns">
          <div className="hero-photo">
            <img src="/img/IMG_0236.JPG" alt="James Campbell (AIA)" />
          </div>
          <div className="hero-text">
            <AiaLogo size={64} color="var(--accent)" className="hero-logo" />
            <h1 className="hero-title">
              <span className="glitch">James S. Campbell</span>
            </h1>
            <p className="hero-subtitle">aka AIA</p>
            <p className="hero-years">June 17, 1977 - July 1, 2025</p>
          </div>
        </div>
      </section>

      {/* Sequencer visual element */}
      <div className="sequencer" aria-hidden="true">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="sequencer-step sequencer-random" style={{ animationDelay: `${(i * 0.7 + i * i * 0.3) % 4}s`, animationDuration: `${3 + (i % 5) * 0.8}s` }} />
        ))}
      </div>

      <main className="main">
        <section className="section">
          <h2 className="section-title">In Memoriam</h2>
          <div className="section-content">
            <p>
              James Campbell, known to the electronic music community as AIA, was a passionate advocate
              for minimal experimental techno. His deep appreciation for the genre's hypnotic rhythms,
              subtle textures, and boundary-pushing soundscapes defined both his artistic sensibilities
              and his approach to life.
            </p>
            <p>
              Through his work and his presence, James championed the experimental spirit of techno,
              the belief that music could be both deeply minimal and infinitely complex, that repetition
              could reveal hidden depths, and that the space between sounds was as important as the
              sounds themselves.
            </p>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">The Artist</h2>
          <div className="section-content">
            <div className="artist-content">
              <div className="artist-text">
                <p>
                  As AIA, James explored the outer edges of minimal techno, crafting sonic landscapes that
                  were at once sparse and immersive. His work reflected a deep understanding of the genre's
                  foundations while constantly pushing toward new territories, experimental, uncompromising,
                  and always authentic.
                </p>
                <p>
                  His approach to music was characterized by careful attention to detail, a commitment to
                  sonic experimentation, and a refusal to follow trends. Each piece was a meditation on
                  sound, space, and time.
                </p>
              </div>

              <div className="dj-photo-inline">
                <img src="/img/IMG_0347.JPG" alt="James Campbell (AIA) DJing" />
              </div>
            </div>

            <div className="quote">
              <p>
                In the minimal, we find the infinite. In the experimental, we discover ourselves.
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Music</h2>
          <div className="section-content">
            <p>
              Listen to James's music collection, spanning from early tracker compositions
              through expansive DJ mixes. All tracks encoded at the highest available quality.
            </p>
          </div>
          <div className="player-container">
            <MusicPlayer player={player} counts={counts} />
          </div>
          <h3 className="playlist-category">James's Favourites</h3>
          <div className="section-content bc-intro">
            <p>
              Music that inspired James. Browse his <a href="https://bandcamp.com/jamesambient" target="_blank" rel="noopener noreferrer">Bandcamp collection</a> of favourite albums
              and artists from the minimal and experimental techno scene.
            </p>
            <a
              href="https://bandcamp.com/jamesambient"
              className="link-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              → Browse Collection
            </a>
          </div>
          <div className="player-container">
            <BandcampPlayer />
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Legacy</h2>
          <div className="section-content">
            <p>
              James's impact extends beyond his own creative output. He was a connector, a curator
              of experiences, and a believer in the transformative power of experimental music.
              His passion inspired others to listen more deeply, to experiment more boldly, and to
              find beauty in the minimal and the unconventional.
            </p>
            <p>
              This tribute stands as a testament to a life lived in rhythm with experimental sound,
              always searching, always listening, always exploring the spaces between the beats.
            </p>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Community</h2>
          <div className="section-content">
            <p>
              Share your memories of James. Upload photos or music that remind you of him,
              and they will appear here after review.
            </p>
            <SubmissionForm />
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Connect</h2>
          <div className="section-content">
            <p>
              Help keep James's music alive. Support his favourite artists on Bandcamp,
              share this tribute, and stay connected.
            </p>

            <div className="links">
              <a
                href="https://soundcloud.com/listenablemusic"
                className="link-button"
                target="_blank"
                rel="noopener noreferrer"
              >
                → SoundCloud
              </a>
              <a
                href="https://bandcamp.com/jamesambient"
                className="link-button"
                target="_blank"
                rel="noopener noreferrer"
              >
                → Bandcamp
              </a>
              <button
                className="link-button"
                onClick={() => {
                  navigator.clipboard.writeText('https://listenablemusic.ca')
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
              >
                {copied ? '✓ Copied' : '→ Copy Link'}
              </button>
              <a
                href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flistenablemusic.ca"
                className="link-button"
                target="_blank"
                rel="noopener noreferrer"
              >
                → Share on Facebook
              </a>
            </div>

            <p className="subscribe-label">Get notified when new memories or content are added:</p>
            <SubscribeForm />

            {pageViews !== null && (
              <p className="page-views">AIA's digital memorial has been visited {pageViews.toLocaleString()} times by fans and family members.</p>
            )}
          </div>
        </section>
      </main>

      {/* Second sequencer */}
      <div className="sequencer" aria-hidden="true">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="sequencer-step" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>

      <footer className="footer">
        <p>In memory of James Campbell (AIA) - June 17, 1977 - July 1, 2025</p>
        <p>Forever in the rhythm</p>
        <p className="footer-credit">
          Site maintained by his biggest fan and friend. For additions or corrections, <a href="mailto:feedback@listenablemusic.ca?subject=Listenable%20Music%20-%20Feedback">get in touch</a>.
        </p>
        <p className="footer-credit">Last updated March 24, 2026.</p>
      </footer>
    </div>
  )
}

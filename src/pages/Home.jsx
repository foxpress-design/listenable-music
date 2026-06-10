import { useEffect, useState, useRef, useCallback } from 'react'
import MusicPlayer, { HeaderPlayer } from '../MusicPlayer'
import useAudioPlayer from '../useAudioPlayer'
import usePlayCounts from '../usePlayCounts'
import AiaLogo from '../AiaLogo'
import useTheme from '../useTheme'
import SubscribeForm from '../components/SubscribeForm'
import SubmissionForm from '../components/SubmissionForm'
import BandcampPlayer from '../components/BandcampPlayer'
import EventSignup from '../components/EventSignup'

function CommunityMemory({ id }) {
  const [text, setText] = useState(null)
  useEffect(() => {
    fetch(`/api/submissions/file/${id}`)
      .then(r => r.text())
      .then(setText)
      .catch(() => {})
  }, [id])
  if (!text) return null
  return <p className="community-post-memory">{text}</p>
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pageViews, setPageViews] = useState(null)
  const [showThemePref, setShowThemePref] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [navPinned, setNavPinned] = useState(false)
  const navRef = useRef(null)
  const [approvedPosts, setApprovedPosts] = useState([])
  const [eventInterest, setEventInterest] = useState(0)
  const [hasLiked, setHasLiked] = useState(() => {
    try { return localStorage.getItem('event-june17-liked') === '1' } catch { return false }
  })
  const currentVersion = 'v1.2.16'
  const [hasNewVersion, setHasNewVersion] = useState(() => {
    try {
      return localStorage.getItem('aia-last-seen-version') !== currentVersion
    } catch { return false }
  })
  const player = useAudioPlayer()
  const theme = useTheme()
  const { counts, recordPlay } = usePlayCounts()

  // Close nav on outside click (mobile support)
  useEffect(() => {
    if (!navPinned) return
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setNavPinned(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [navPinned])

  const toggleEventLike = useCallback(() => {
    const action = hasLiked ? 'unlike' : 'like'
    setHasLiked(!hasLiked)
    setEventInterest(prev => hasLiked ? Math.max(0, prev - 1) : prev + 1)
    try { localStorage.setItem('event-june17-liked', hasLiked ? '0' : '1') } catch {}
    fetch('/api/event-interest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    }).catch(() => {})
  }, [hasLiked])

  // Scroll to hash on load (React Router doesn't handle this)
  useEffect(() => {
    if (window.location.hash) {
      setTimeout(() => {
        const el = document.querySelector(window.location.hash)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 500)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    fetch('/api/pageviews', { method: 'POST' })
      .then(r => r.json())
      .then(d => setPageViews(d.views))
      .catch(() => {})
    fetch('/api/submissions/approved')
      .then(r => r.json())
      .then(d => setApprovedPosts(d.submissions || []))
      .catch(() => {})
    fetch('/api/event-interest')
      .then(r => r.json())
      .then(d => setEventInterest(d.count))
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
          <div ref={navRef} className={`logo logo-nav-wrapper ${navPinned ? 'nav-open' : ''}`}>
            <AiaLogo size={16} color="var(--accent)" className="logo-icon" onClick={() => setNavPinned(!navPinned)} style={{ cursor: 'pointer' }} />
            <span className="logo-title">Listenable Music <span className="nav-arrow">&#9662;</span></span>
            <button className="logo-version" onClick={() => { setShowChangelog(!showChangelog); if (hasNewVersion) { setHasNewVersion(false); try { localStorage.setItem('aia-last-seen-version', currentVersion) } catch {} } }}>{currentVersion}{hasNewVersion && <span className="version-dot" />}</button>
            <nav className="section-nav">
              {[
                ['#events', 'Events'],
                ['#in-memoriam', 'In Memoriam'],
                ['#the-artist', 'The Artist'],
                ['#music', 'Music'],
                ['#legacy', 'Legacy'],
                ['#community', 'Community'],
                ['#supporting', 'Supporting His Memory'],
                ['#connect', 'Connect'],
              ].map(([href, label]) => (
                <a key={href} href={href} className="section-nav-link" onClick={() => setNavPinned(false)}>{label}</a>
              ))}
            </nav>
          </div>
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
                <span className="changelog-version">v1.2.16</span>
                <span className="changelog-date">June 9, 2026</span>
                <ul>
                  <li>Fix: rate limit errors when sending to multiple subscribers (250ms delay between sends)</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v1.2.15</span>
                <span className="changelog-date">June 9, 2026</span>
                <ul>
                  <li>Emails: replies now go to philip@foxpress.design instead of bouncing</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v1.2.14</span>
                <span className="changelog-date">June 9, 2026</span>
                <ul>
                  <li>Email deliverability: added plain-text alternative and List-Unsubscribe headers to all admin-sent emails</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v1.2.13</span>
                <span className="changelog-date">June 9, 2026</span>
                <ul>
                  <li>Admin: select individual event attendees before emailing (select all / per-row checkboxes)</li>
                  <li>Admin: remove individual subscribers from an event list</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v1.2.12</span>
                <span className="changelog-date">June 9, 2026</span>
                <ul>
                  <li>June 17 event updated: The Draft Room (395 Keele St), 4pm reservation, England v Croatia (FIFA World Cup 2026)</li>
                  <li>Events section moved to the top of the page</li>
                  <li>Venue links to Google Maps with pin icon</li>
                  <li>"Add to Calendar" button sits inline with interest counter</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v1.2.1</span>
                <span className="changelog-date">June 10, 2026</span>
                <ul>
                  <li>Admin login emails now reliably land in inbox (changed sender, improved email body, added logging)</li>
                  <li>Full SPF/DKIM/DMARC email authentication for listenablemusic.ca</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v1.2.0</span>
                <span className="changelog-date">March 24, 2026</span>
                <ul>
                  <li>Supporting His Memory: cards for Bandcamp, EFF, ISO 50/Tycho, and Simon Stalenhag with featured art</li>
                  <li>Protect Your Privacy: full-width Proton Mail and Proton VPN section with icons</li>
                  <li>Events: June 17th birthday gathering with signup form and live interest count badge</li>
                  <li>Section navigation dropdown on hover from site title</li>
                  <li>KITT sequencer rewritten with per-step fade trail animation</li>
                  <li>Subscribe API supports tagging (event signups tracked separately)</li>
                </ul>
              </div>
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
                <ul>
                  <li>AIA logo: custom SVG mark (two overlapping chevrons with center dot)</li>
                  <li>Logo as browser favicon, in header nav, and above hero title</li>
                  <li>Larger artist photo in The Artist section</li>
                  <li>Music player expanded to full section width</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v0.7.0</span>
                <ul>
                  <li>Play count tracking via Cloudflare Worker + KV storage</li>
                  <li>Per-track and per-album aggregate play counts in the player</li>
                  <li>Version label in site header</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v0.6.0</span>
                <ul>
                  <li>Custom events for play counts and downloads</li>
                  <li>Per-track download button in tracklist</li>
                  <li>Per-album "download all" with client-side ZIP via JSZip</li>
                  <li>Download progress indicator</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v0.5.0</span>
                <ul>
                  <li>Full music player moved to sticky header (prev/play/next, dropdown, progress, volume)</li>
                  <li>Mobile: minified player with play/pause, track name, tap-to-open track list</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v0.4.0</span>
                <ul>
                  <li>All tracks hosted in-repo for reliable same-origin playback</li>
                  <li>DJ mixes re-encoded to VBR to fit under Git's 100MB limit</li>
                  <li>Side-by-side hero layout with photo and name in two columns</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v0.3.0</span>
                <ul>
                  <li>Move all 27 tracks to GitHub Releases, removing 186MB from repo</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v0.2.0</span>
                <ul>
                  <li>Audio playback fixes (defer play until canplay, stable refs for listeners)</li>
                  <li>Header quick player with track dropdown and shared audio state</li>
                  <li>Dropdown hover gap fix</li>
                </ul>
              </div>
              <div className="changelog-entry">
                <span className="changelog-version">v0.1.0</span>
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
        <section id="events" className="section">
          <h2 className="section-title">Events</h2>
          <div className="section-content">
            <div className="event-card">
              <h3 className="event-title">Raise a Pint for James /<br className="mobile-break" /> FIFA World Cup: England v Croatia</h3>
              <p className="event-date">June 17th, 2026 &middot; <a href="https://maps.app.goo.gl/jQvTBCCPYnDG2CG96" target="_blank" rel="noopener noreferrer">The Draft Room, Toronto &#x1F4CD;</a></p>
              <div className="event-actions">
                <button
                  className={`event-interested ${hasLiked ? 'event-interested-liked' : ''}`}
                  onClick={toggleEventLike}
                  title={hasLiked ? 'Remove your interest' : 'Show your interest'}
                >
                  {hasLiked ? '♥' : '♡'} {eventInterest} interested
                </button>
                <a
                  href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Raise+a+Pint+for+James&dates=20260617T160000/20260617T200000&location=The+Draft+Room%2C+395+Keele+St%2C+Toronto%2C+ON+M6P+2K9&details=Join+us+at+The+Draft+Room+%28395+Keele+St%2C+Toronto%29+to+raise+a+pint+for+James+on+what+would+have+been+his+49th+birthday.+England+v+Croatia+kicks+off+at+4pm+%28FIFA+World+Cup+2026%29.+We+have+a+reservation+from+4pm+and+plan+to+be+there+until+at+least+8pm.+Come+join+us+at+any+point+in+the+evening.+Bring+your+English+spirit.%0A%0Ahttps%3A%2F%2Flistenablemusic.ca%2F%23events"
                  className="link-button event-calendar-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Add to <span className="calendar-text-full">Calendar </span>&#x1F4C5;
                </a>
              </div>
              <p>
                On what would have been James's 49th birthday, we'll gather at <a href="https://maps.app.goo.gl/jQvTBCCPYnDG2CG96" target="_blank" rel="noopener noreferrer">The Draft Room (395 Keele St, Toronto)</a>{' '}
                to watch the football and raise a pint in his name. We've got a reservation from 4pm and plan to be
                there for a few hours, until 8pm at least. Come join us at any point in the evening; if you can't make
                it until a little later, that's fine.
              </p>
              <p className="event-note">
                England v Croatia kicks off at 4pm (FIFA World Cup 2026). Bring your English spirit.
              </p>
              <p>
                Sign up here for updates.
              </p>
              <EventSignup onSignup={() => setEventInterest(prev => (prev || 0) + 1)} />
            </div>
          </div>
        </section>

        <section id="in-memoriam" className="section">
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

        <section id="the-artist" className="section">
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

        <section id="music" className="section">
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

        <section id="legacy" className="section">
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

        <section id="community" className="section">
          <h2 className="section-title">Community</h2>
          <div className="section-content">
            {approvedPosts.length > 0 && (
              <div className="community-posts">
                {approvedPosts.map(post => (
                  <div key={post.id} className="community-post">
                    {post.type === 'photo' && post.file_key && (
                      <img className="community-post-img" src={`/api/submissions/file/${post.id}`} alt={post.caption || 'Community photo'} loading="lazy" />
                    )}
                    {post.type === 'memory' && post.file_key && (
                      <CommunityMemory id={post.id} />
                    )}
                    {post.type === 'music' && post.file_key && post.file_key.startsWith('http') && (
                      <a href={post.file_key} className="link-button" target="_blank" rel="noopener noreferrer">
                        → {post.file_name || 'Listen'}
                      </a>
                    )}
                    <div className="community-post-meta">
                      <span className="community-post-name">{post.name}</span>
                      {post.caption && <span className="community-post-caption">{post.caption}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="link-button community-toggle" onClick={() => setShowSubmitForm(!showSubmitForm)}>
              {showSubmitForm ? '- Close' : '+ Do you have a memory, photo, or music to share about James?'}
            </button>
            {showSubmitForm && <SubmissionForm />}
          </div>
        </section>

        <section id="supporting" className="section">
          <h2 className="section-title">Supporting His Memory</h2>
          <div className="section-content">
            <p>
              James was passionate about independent music, digital rights, and visual art.
              One of the best ways to honor him is to support the things he cared about.
            </p>

            <div className="support-grid">
              <div className="support-card">
                <a href="https://bandcamp.com/jamesambient" target="_blank" rel="noopener noreferrer"><img src="/bandcamp-collection.jpg" alt="From James's Bandcamp collection" className="support-card-art" /></a>
                <h3 className="support-card-title">Bandcamp</h3>
                <p className="support-card-text">
                  James has 213 artists in his Bandcamp collection. Buy a track or an album, support the artists he loved, and keep their music alive.
                </p>
                <a
                  href="https://bandcamp.com/jamesambient"
                  className="link-button"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  &rarr; JamesAmbient's BC Collection
                </a>
              </div>

              <div className="support-card">
                <a href="https://www.eff.org" target="_blank" rel="noopener noreferrer"><img src="/eff-art.jpg" alt="Electronic Frontier Foundation" className="support-card-art" /></a>
                <h3 className="support-card-title">Electronic Frontier Foundation</h3>
                <p className="support-card-text">
                  The EFF defends civil liberties, privacy, free expression, and innovation in the digital world.
                  Get acquainted with their values, <a href="https://www.eff.org/effector" target="_blank" rel="noopener noreferrer">sign up for their newsletter</a>,
                  buy a hoodie or some stickers to put on your laptop, and <a href="https://effector.simplecast.com" target="_blank" rel="noopener noreferrer">listen to the podcast</a>.
                </p>
                <div className="support-card-links">
                  <a
                    href="https://www.eff.org"
                    className="link-button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    &rarr; Visit EFF.org
                  </a>
                  <a
                    href="https://supporters.eff.org/donate/join-eff-4"
                    className="link-button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    &rarr; Donate
                  </a>
                </div>
              </div>

              <div className="support-card">
                <a href="https://iso50.com" target="_blank" rel="noopener noreferrer"><img src="/iso50-art.jpg" alt="Zabriskie Point by Scott Hansen / ISO 50" className="support-card-art" /></a>
                <h3 className="support-card-title">ISO 50 / Tycho Gallery</h3>
                <p className="support-card-text">
                  Scott Hansen is the artist and musician behind Tycho, one of James's favourite ambient/electronic acts.
                  ISO 50 is his visual art and design studio. Browse their <a href="https://merch.ambientinks.com/collections/tychoiso50/featured" target="_blank" rel="noopener noreferrer">shop for records and prints</a>,
                  and <a href="https://mailchi.mp/iso50/iso50" target="_blank" rel="noopener noreferrer">sign up for the newsletter</a>.
                </p>
                <div className="support-card-links">
                  <a
                    href="https://iso50.com"
                    className="link-button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    &rarr; ISO50 Gallery
                  </a>
                  <a
                    href="https://tychomusic.com"
                    className="link-button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    &rarr; Tycho Music
                  </a>
                </div>
              </div>

              <div className="support-card">
                <a href="https://www.simonstalenhag.se" target="_blank" rel="noopener noreferrer"><img src="/stalenhag.jpg" alt="Art by Simon Stålenhag" className="support-card-art" /></a>
                <h3 className="support-card-title">Simon St&aring;lenhag</h3>
                <p className="support-card-text">
                  Swedish artist blending retro-nostalgic Scandinavian landscapes with dystopian sci-fi imagery.
                  Giant abandoned robots, mysterious technological ruins, and haunting beauty. Pick up a print or one of his books.
                </p>
                <div className="support-card-links">
                  <a
                    href="https://www.simonstalenhag.se"
                    className="link-button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    &rarr; Gallery
                  </a>
                  <a
                    href="http://www.redbubble.com/people/simonstalenhag"
                    className="link-button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    &rarr; Buy Prints
                  </a>
                </div>
              </div>

              <div className="support-card support-card-full">
                <img src="/proton-logo.svg" alt="Proton" className="support-proton-logo" />
                <h3 className="support-card-title">Protect Your Privacy Online</h3>
                <p className="support-card-text">
                  James believed in digital privacy and freedom. Take a step to protect yours.
                </p>
                <div className="support-card-links">
                  <a
                    href="https://proton.me/mail"
                    className="link-button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src="/proton-mail.svg" alt="" className="button-icon" /> Proton Mail
                  </a>
                  <a
                    href="https://protonvpn.com"
                    className="link-button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src="/proton-vpn.svg" alt="" className="button-icon" /> Proton VPN
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="connect" className="section">
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

            <p className="subscribe-label">Get notified when new memories, content, or events are added:</p>
            <SubscribeForm />

            {pageViews !== null && (
              <p className="page-views">AIA's digital memorial has been visited {pageViews.toLocaleString()} times by fans, friends, and family members.</p>
            )}
            <div className="bottom-logo" style={{ textAlign: 'center', margin: '3rem 0 0' }}>
              <AiaLogo size={120} color="var(--accent)" />
            </div>
          </div>
        </section>
      </main>

      {/* Second sequencer - KITT scanner */}
      <div className="sequencer sequencer-kitt" aria-hidden="true">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="sequencer-step" />
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

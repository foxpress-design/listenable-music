import { useEffect, useState } from 'react'
import MusicPlayer, { HeaderPlayer } from '../MusicPlayer'
import useAudioPlayer from '../useAudioPlayer'
import usePlayCounts from '../usePlayCounts'
import AiaLogo from '../AiaLogo'
import SubscribeForm from '../components/SubscribeForm'
import SubmissionForm from '../components/SubmissionForm'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const player = useAudioPlayer()
  const { counts, recordPlay } = usePlayCounts()

  useEffect(() => {
    setMounted(true)
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
          <div className="logo"><AiaLogo size={16} color="var(--accent)" className="logo-icon" /> Listenable Music <span className="logo-version">v0.9.6</span></div>
          <HeaderPlayer player={player} />
        </div>
      </header>

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
          <div key={i} className="sequencer-step" />
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
              James would love nothing more than for you to support his favourite artists by
              purchasing their tracks on Bandcamp. Keep the spirit of independent electronic
              music alive.
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
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Share</h2>
          <div className="section-content">
            <p>
              Help keep James's music alive. Share this tribute with anyone who
              would appreciate his work.
            </p>
            <p className="subscribe-label">Get notified about new content:</p>
            <SubscribeForm />
            <div className="links">
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
      </footer>
    </div>
  )
}

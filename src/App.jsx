import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="app">
      <header className="header">
        <div className="logo">Listenable Music</div>
      </header>

      <section className="hero">
        <h1 className="hero-title">
          <span className="glitch">James Campbell</span>
        </h1>
        <p className="hero-subtitle">aka AIA</p>
        <p className="hero-years">1970 - 2024</p>
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
              Through his work and his presence, James championed the experimental spirit of techno—
              the belief that music could be both deeply minimal and infinitely complex, that repetition
              could reveal hidden depths, and that the space between sounds was as important as the
              sounds themselves.
            </p>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">The Artist</h2>
          <div className="section-content">
            <p>
              As AIA, James explored the outer edges of minimal techno, crafting sonic landscapes that
              were at once sparse and immersive. His work reflected a deep understanding of the genre's
              foundations while constantly pushing toward new territories—experimental, uncompromising,
              and always authentic.
            </p>
            <p>
              His approach to music was characterized by careful attention to detail, a commitment to
              sonic experimentation, and a refusal to follow trends. Each piece was a meditation on
              sound, space, and time.
            </p>

            <div className="quote">
              <p>
                In the minimal, we find the infinite. In the experimental, we discover ourselves.
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Musical Influences</h2>
          <div className="section-content">
            <p>
              James's love for minimal experimental techno encompassed the pioneers and innovators
              who shaped the genre:
            </p>
            <div className="grid">
              <div className="card">
                <div className="card-title">Rhythm & Sound</div>
                <div className="card-meta">Dub Techno Masters</div>
              </div>
              <div className="card">
                <div className="card-title">Basic Channel</div>
                <div className="card-meta">Berlin Minimalism</div>
              </div>
              <div className="card">
                <div className="card-title">Plastikman</div>
                <div className="card-meta">Acid Minimalism</div>
              </div>
              <div className="card">
                <div className="card-title">Robert Hood</div>
                <div className="card-meta">Detroit Minimal</div>
              </div>
              <div className="card">
                <div className="card-title">Chain Reaction</div>
                <div className="card-meta">Experimental Dub</div>
              </div>
              <div className="card">
                <div className="card-title">Surgeon</div>
                <div className="card-meta">Industrial Techno</div>
              </div>
            </div>
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
              This tribute stands as a testament to a life lived in rhythm with experimental sound—
              always searching, always listening, always exploring the spaces between the beats.
            </p>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Connect</h2>
          <div className="links">
            <a
              href="https://soundcloud.com/search?q=AIA%20minimal%20techno"
              className="link-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              → SoundCloud
            </a>
            <a
              href="https://www.discogs.com/search/?q=AIA&type=artist"
              className="link-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              → Discogs
            </a>
            <a
              href="https://www.residentadvisor.net/"
              className="link-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              → Resident Advisor
            </a>
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
        <p>In memory of James Campbell (AIA) • 1970 - 2024</p>
        <p>Forever in the rhythm</p>
      </footer>
    </div>
  )
}

export default App

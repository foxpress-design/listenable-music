import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Pause all other audio players when one starts playing
    const audioElements = document.querySelectorAll('audio')

    const handlePlay = (event) => {
      audioElements.forEach(audio => {
        if (audio !== event.target) {
          audio.pause()
        }
      })
    }

    audioElements.forEach(audio => {
      audio.addEventListener('play', handlePlay)
    })

    // Cleanup event listeners
    return () => {
      audioElements.forEach(audio => {
        audio.removeEventListener('play', handlePlay)
      })
    }
  }, [])

  return (
    <div className="app">
      <header className="header">
        <div className="logo">Listenable Music</div>
      </header>

      <section className="hero">
        {/* Uncomment when james-campbell.jpg is added to public/ folder
        <div className="hero-photo">
          <img src="/james-campbell.jpg" alt="James Campbell (AIA)" />
        </div>
        */}
        <h1 className="hero-title">
          <span className="glitch">James S. Campbell</span>
        </h1>
        <p className="hero-subtitle">aka AIA</p>
        <p className="hero-years">June 17, 1977 - July 1, 2025</p>
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
            <div className="artist-content">
              <div className="artist-text">
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
              </div>

              <div className="dj-photo-inline">
                <img src="https://files.listenablemusic.ca/AIA-DJing-Harvest-2007.jpeg" alt="James Campbell (AIA) DJing at Harvest 2007" />
                <p className="photo-caption">AIA at Harvest 2007</p>
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
          <h2 className="section-title">Listen</h2>
          <div className="section-content">
            <p className="music-intro">
              Experience James's sonic explorations. These tracks represent his journey through
              minimal and experimental techno.
            </p>

            <h3 className="playlist-category">DJ Mixes</h3>
            <div className="music-player">
              <div className="playlist">
                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Hearts and Minds Mix</div>
                    <div className="track-meta">DJ Aia • 2004</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/mixes/DJ Aia - Hearts and Minds Mix - 2004.wav" type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Listen With Aia</div>
                    <div className="track-meta">DJ Aia • 2006</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/mixes/DJ Aia - Listen With Aia - 2006.wav" type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Expansive Mix</div>
                    <div className="track-meta">DJ Aia • 2008</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/mixes/DJ Aia - Expansive mix - 2008.wav" type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Promise Cherry Blossoms</div>
                    <div className="track-meta">DJ Aia • 2009</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/mixes/DJ Aia - Promise Cherry Blossoms - 2009.wav" type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Harvest Festival Thermodome 3AM Mix</div>
                    <div className="track-meta">DJ Aia • 2017</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/mixes/DJ Aia - Harvest Festival - Thermodome 3AM mix 2017.wav" type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            </div>

            <h3 className="playlist-category">Original Productions</h3>
            <div className="music-player">
              <div className="playlist">
                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Solace</div>
                    <div className="track-meta">2002</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Solace (2002).mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Rotor</div>
                    <div className="track-meta">Gatwick Drones</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Gatwick Drones - Rotor.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            </div>

            <h3 className="playlist-category">Nexus - Shiftless (1996)</h3>
            <div className="music-player">
              <div className="playlist">
                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Shiftless</div>
                    <div className="track-meta">Nexus • 1996</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Shiftless (1996)/James S. Campbell - 01 - Shiftless.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Fragments</div>
                    <div className="track-meta">Nexus • 1996</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Shiftless (1996)/James S. Campbell - 02 - Fragments.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Sources</div>
                    <div className="track-meta">Nexus • 1996</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Shiftless (1996)/James S. Campbell - 03 - Sources.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Synthetic Orchestra 2</div>
                    <div className="track-meta">Nexus • 1996</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Shiftless (1996)/James S. Campbell - 04 - Synthetic Orchestra 2.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Synthetic Orchestra 1</div>
                    <div className="track-meta">Nexus • 1996</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Shiftless (1996)/James S. Campbell - 05 - Synthetic Orchestra 1.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Transcendance</div>
                    <div className="track-meta">Nexus • 1996</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Shiftless (1996)/James S. Campbell - 06 - Transcendance.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Nicotine</div>
                    <div className="track-meta">Nexus • 1996</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Shiftless (1996)/James S. Campbell - 07 - Nicotine.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Sources 2</div>
                    <div className="track-meta">Nexus • 1996</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Shiftless (1996)/James S. Campbell - 08 - Sources 2.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Fundamentals</div>
                    <div className="track-meta">Nexus • 1996</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Shiftless (1996)/James S. Campbell - 09 - Fundamentals.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            </div>

            <h3 className="playlist-category">Nexus - Fable (1995)</h3>
            <div className="music-player">
              <div className="playlist">
                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Track 01</div>
                    <div className="track-meta">Nexus • 1995 • PC & FastTracker</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/01 Track01.flac" type="audio/flac" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Track 02</div>
                    <div className="track-meta">Nexus • 1995 • PC & FastTracker</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/02 Track02.flac" type="audio/flac" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Track 03</div>
                    <div className="track-meta">Nexus • 1995 • PC & FastTracker</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/03 Track03.flac" type="audio/flac" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Track 04</div>
                    <div className="track-meta">Nexus • 1995 • PC & FastTracker</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/04 Track04.flac" type="audio/flac" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Track 05</div>
                    <div className="track-meta">Nexus • 1995 • PC & FastTracker</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/05 Track05.flac" type="audio/flac" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Track 06</div>
                    <div className="track-meta">Nexus • 1995 • PC & FastTracker</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/06 Track06.flac" type="audio/flac" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Track 07</div>
                    <div className="track-meta">Nexus • 1995 • PC & FastTracker</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/07 Track07.flac" type="audio/flac" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Track 08</div>
                    <div className="track-meta">Nexus • 1995 • PC & FastTracker</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/08 Track08.flac" type="audio/flac" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Track 09</div>
                    <div className="track-meta">Nexus • 1995 • PC & FastTracker</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/09 Track09.flac" type="audio/flac" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="track">
                  <div className="track-info">
                    <div className="track-title">Track 10</div>
                    <div className="track-meta">Nexus • 1995 • PC & FastTracker</div>
                  </div>
                  <audio controls>
                    <source src="https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/10 Track10.flac" type="audio/flac" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
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
      </main>

      {/* Second sequencer */}
      <div className="sequencer" aria-hidden="true">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="sequencer-step" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>

      <footer className="footer">
        <p>In memory of James Campbell (AIA) • June 17, 1977 - July 1, 2025</p>
        <p>Forever in the rhythm</p>
      </footer>
    </div>
  )
}

export default App

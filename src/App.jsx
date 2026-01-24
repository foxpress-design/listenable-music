import { useEffect, useState, useRef } from 'react'
import './App.css'

const TRACKS = [
  // DJ Mixes (5 tracks)
  { id: 0, category: 'DJ Mixes', title: 'Hearts and Minds Mix', artist: 'DJ Aia', year: '2004',
    url: 'https://files.listenablemusic.ca/mixes/DJ Aia - Hearts and Minds Mix - 2004.wav', type: 'audio/wav' },
  { id: 1, category: 'DJ Mixes', title: 'Listen With Aia', artist: 'DJ Aia', year: '2006',
    url: 'https://files.listenablemusic.ca/mixes/DJ Aia - Listen With Aia - 2006.wav', type: 'audio/wav' },
  { id: 2, category: 'DJ Mixes', title: 'Expansive Mix', artist: 'DJ Aia', year: '2008',
    url: 'https://files.listenablemusic.ca/mixes/DJ Aia - Expansive mix - 2008.wav', type: 'audio/wav' },
  { id: 3, category: 'DJ Mixes', title: 'Promise Cherry Blossoms', artist: 'DJ Aia', year: '2009',
    url: 'https://files.listenablemusic.ca/mixes/DJ Aia - Promise Cherry Blossoms - 2009.wav', type: 'audio/wav' },
  { id: 4, category: 'DJ Mixes', title: 'Harvest Festival Thermodome 3AM Mix', artist: 'DJ Aia', year: '2017',
    url: 'https://files.listenablemusic.ca/mixes/DJ Aia - Harvest Festival - Thermodome 3AM mix 2017.wav', type: 'audio/wav' },

  // Original Productions (2 tracks)
  { id: 5, category: 'Original Productions', title: 'Solace', artist: '', year: '2002',
    url: 'https://files.listenablemusic.ca/original/Solace (2002).mp3', type: 'audio/mpeg' },
  { id: 6, category: 'Original Productions', title: 'Rotor', artist: 'Gatwick Drones', year: '',
    url: 'https://files.listenablemusic.ca/original/Gatwick Drones - Rotor.mp3', type: 'audio/mpeg' },

  // Nexus - Shiftless (1996) - 9 tracks
  { id: 7, category: 'Nexus - Shiftless (1996)', title: 'Shiftless', artist: 'Nexus', year: '1996',
    url: 'https://files.listenablemusic.ca/original/Nexus - Shiftless (1996)/James S. Campbell - 01 - Shiftless.mp3', type: 'audio/mpeg' },
  { id: 8, category: 'Nexus - Shiftless (1996)', title: 'Fragments', artist: 'Nexus', year: '1996',
    url: 'https://files.listenablemusic.ca/original/Nexus - Shiftless (1996)/James S. Campbell - 02 - Fragments.mp3', type: 'audio/mpeg' },
  { id: 9, category: 'Nexus - Shiftless (1996)', title: 'Sources', artist: 'Nexus', year: '1996',
    url: 'https://files.listenablemusic.ca/original/Nexus - Shiftless (1996)/James S. Campbell - 03 - Sources.mp3', type: 'audio/mpeg' },
  { id: 10, category: 'Nexus - Shiftless (1996)', title: 'Synthetic Orchestra 2', artist: 'Nexus', year: '1996',
    url: 'https://files.listenablemusic.ca/original/Nexus - Shiftless (1996)/James S. Campbell - 04 - Synthetic Orchestra 2.mp3', type: 'audio/mpeg' },
  { id: 11, category: 'Nexus - Shiftless (1996)', title: 'Synthetic Orchestra 1', artist: 'Nexus', year: '1996',
    url: 'https://files.listenablemusic.ca/original/Nexus - Shiftless (1996)/James S. Campbell - 05 - Synthetic Orchestra 1.mp3', type: 'audio/mpeg' },
  { id: 12, category: 'Nexus - Shiftless (1996)', title: 'Transcendance', artist: 'Nexus', year: '1996',
    url: 'https://files.listenablemusic.ca/original/Nexus - Shiftless (1996)/James S. Campbell - 06 - Transcendance.mp3', type: 'audio/mpeg' },
  { id: 13, category: 'Nexus - Shiftless (1996)', title: 'Nicotine', artist: 'Nexus', year: '1996',
    url: 'https://files.listenablemusic.ca/original/Nexus - Shiftless (1996)/James S. Campbell - 07 - Nicotine.mp3', type: 'audio/mpeg' },
  { id: 14, category: 'Nexus - Shiftless (1996)', title: 'Sources 2', artist: 'Nexus', year: '1996',
    url: 'https://files.listenablemusic.ca/original/Nexus - Shiftless (1996)/James S. Campbell - 08 - Sources 2.mp3', type: 'audio/mpeg' },
  { id: 15, category: 'Nexus - Shiftless (1996)', title: 'Fundamentals', artist: 'Nexus', year: '1996',
    url: 'https://files.listenablemusic.ca/original/Nexus - Shiftless (1996)/James S. Campbell - 09 - Fundamentals.mp3', type: 'audio/mpeg' },

  // Nexus - Fable (1995) - 10 tracks
  { id: 16, category: 'Nexus - Fable (1995)', title: 'Track 01', artist: 'Nexus', year: '1995 • PC & FastTracker',
    url: 'https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/01 Track01.flac', type: 'audio/flac' },
  { id: 17, category: 'Nexus - Fable (1995)', title: 'Track 02', artist: 'Nexus', year: '1995 • PC & FastTracker',
    url: 'https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/02 Track02.flac', type: 'audio/flac' },
  { id: 18, category: 'Nexus - Fable (1995)', title: 'Track 03', artist: 'Nexus', year: '1995 • PC & FastTracker',
    url: 'https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/03 Track03.flac', type: 'audio/flac' },
  { id: 19, category: 'Nexus - Fable (1995)', title: 'Track 04', artist: 'Nexus', year: '1995 • PC & FastTracker',
    url: 'https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/04 Track04.flac', type: 'audio/flac' },
  { id: 20, category: 'Nexus - Fable (1995)', title: 'Track 05', artist: 'Nexus', year: '1995 • PC & FastTracker',
    url: 'https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/05 Track05.flac', type: 'audio/flac' },
  { id: 21, category: 'Nexus - Fable (1995)', title: 'Track 06', artist: 'Nexus', year: '1995 • PC & FastTracker',
    url: 'https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/06 Track06.flac', type: 'audio/flac' },
  { id: 22, category: 'Nexus - Fable (1995)', title: 'Track 07', artist: 'Nexus', year: '1995 • PC & FastTracker',
    url: 'https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/07 Track07.flac', type: 'audio/flac' },
  { id: 23, category: 'Nexus - Fable (1995)', title: 'Track 08', artist: 'Nexus', year: '1995 • PC & FastTracker',
    url: 'https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/08 Track08.flac', type: 'audio/flac' },
  { id: 24, category: 'Nexus - Fable (1995)', title: 'Track 09', artist: 'Nexus', year: '1995 • PC & FastTracker',
    url: 'https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/09 Track09.flac', type: 'audio/flac' },
  { id: 25, category: 'Nexus - Fable (1995)', title: 'Track 10', artist: 'Nexus', year: '1995 • PC & FastTracker',
    url: 'https://files.listenablemusic.ca/original/Nexus - Fable (1995) FLAC - PC & FastTracker/10 Track10.flac', type: 'audio/flac' },
]

const CATEGORIES = [
  { name: 'DJ Mixes', trackIds: [0, 1, 2, 3, 4] },
  { name: 'Original Productions', trackIds: [5, 6] },
  { name: 'Nexus - Shiftless (1996)', trackIds: [7, 8, 9, 10, 11, 12, 13, 14, 15] },
  { name: 'Nexus - Fable (1995)', trackIds: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25] }
]

function App() {
  const [mounted, setMounted] = useState(false)
  const [currentGlobalTrack, setCurrentGlobalTrack] = useState(0)
  const [isGlobalPlaying, setIsGlobalPlaying] = useState(false)
  const [showTrackList, setShowTrackList] = useState(false)
  const globalAudioRef = useRef(null)

  // Global player handlers
  const handleGlobalPlayPause = () => {
    if (globalAudioRef.current) {
      if (isGlobalPlaying) {
        globalAudioRef.current.pause()
      } else {
        globalAudioRef.current.play().catch(err => console.log('Play prevented:', err))
      }
    }
  }

  const handleGlobalEnded = () => {
    const nextTrack = (currentGlobalTrack + 1) % TRACKS.length
    setCurrentGlobalTrack(nextTrack)
  }

  const handleTrackSelect = (index) => {
    setCurrentGlobalTrack(index)
    setShowTrackList(false)
    setTimeout(() => {
      if (globalAudioRef.current) {
        globalAudioRef.current.play().catch(err => console.log('Play prevented:', err))
      }
    }, 100)
  }

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

  // Handle global player track changes
  useEffect(() => {
    if (globalAudioRef.current) {
      globalAudioRef.current.load()
      if (isGlobalPlaying) {
        globalAudioRef.current.play().catch(err => {
          console.log('Play prevented:', err)
          setIsGlobalPlaying(false)
        })
      }
    }
  }, [currentGlobalTrack, isGlobalPlaying])

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">Listenable Music</div>
          <div
            className="global-player"
            onMouseEnter={() => setShowTrackList(true)}
            onMouseLeave={() => setShowTrackList(false)}
          >
            <div className="current-track-name">
              {TRACKS[currentGlobalTrack].title}
            </div>
            <button
              className={`play-button ${isGlobalPlaying ? 'playing' : ''}`}
              onClick={handleGlobalPlayPause}
              aria-label={isGlobalPlaying ? 'Pause' : 'Play'}
            />
            {showTrackList && (
              <div className="track-list-dropdown">
                {CATEGORIES.map(category => (
                  <div key={category.name}>
                    <div className="track-list-category-header">{category.name}</div>
                    {category.trackIds.map(id => {
                      const track = TRACKS[id]
                      return (
                        <div
                          key={track.id}
                          className={`track-list-item ${currentGlobalTrack === track.id ? 'active' : ''}`}
                          onClick={() => handleTrackSelect(track.id)}
                        >
                          <div className="track-list-item-info">
                            <div className="track-list-item-title">{track.title}</div>
                            <div className="track-list-item-meta">
                              {track.artist && `${track.artist} • `}{track.year}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <audio
          ref={globalAudioRef}
          src={TRACKS[currentGlobalTrack].url}
          onEnded={handleGlobalEnded}
          onPlay={() => setIsGlobalPlaying(true)}
          onPause={() => setIsGlobalPlaying(false)}
        />
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

            {CATEGORIES.map(category => (
              <div key={category.name}>
                <h3 className="playlist-category">{category.name}</h3>
                <div className="music-player">
                  <div className="playlist">
                    {category.trackIds.map(id => {
                      const track = TRACKS[id]
                      return (
                        <div key={track.id} className="track">
                          <div className="track-info">
                            <div className="track-title">{track.title}</div>
                            <div className="track-meta">
                              {track.artist && `${track.artist} • `}{track.year}
                            </div>
                          </div>
                          <audio controls>
                            <source src={track.url} type={track.type} />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
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

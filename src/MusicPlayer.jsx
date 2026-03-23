import { useState, useRef, useEffect, useCallback } from 'react'
import './MusicPlayer.css'

const RELEASE_BASE = 'https://github.com/foxpress-design/listenable-music/releases/download/music-v1'

const albums = [
  {
    title: 'DJ Aia Mixes',
    type: 'mixes',
    tracks: [
      { title: 'Hearts and Minds Mix', year: '2004', duration: '1:14:20', src: `${RELEASE_BASE}/DJ.Aia.-.Hearts.and.Minds.Mix.-.2004.mp3` },
      { title: 'Listen With Aia', year: '2006', duration: '1:14:35', src: `${RELEASE_BASE}/DJ.Aia.-.Listen.With.Aia.-.2006.mp3` },
      { title: 'Expansive Mix', year: '2008', duration: '1:03:23', src: `${RELEASE_BASE}/DJ.Aia.-.Expansive.mix.-.2008.mp3` },
      { title: 'Promise Cherry Blossoms', year: '2009', duration: '0:53:22', src: `${RELEASE_BASE}/DJ.Aia.-.Promise.Cherry.Blossoms.-.2009.mp3` },
      { title: 'Harvest Festival', year: '2017', duration: '1:06:08', src: `${RELEASE_BASE}/DJ.Aia.-.Harvest.Festival.-.2017.mp3` },
    ],
  },
  {
    title: 'Nexus - Fable (1995)',
    type: 'album',
    tracks: [
      { title: 'Track 01', num: 1, duration: '3:58', src: '/music/nexus-fable/01 Track01.mp3' },
      { title: 'Track 02', num: 2, duration: '4:12', src: '/music/nexus-fable/02 Track02.mp3' },
      { title: 'Track 03', num: 3, duration: '2:57', src: '/music/nexus-fable/03 Track03.mp3' },
      { title: 'Track 04', num: 4, duration: '4:04', src: '/music/nexus-fable/04 Track04.mp3' },
      { title: 'Track 05', num: 5, duration: '5:31', src: '/music/nexus-fable/05 Track05.mp3' },
      { title: 'Track 06', num: 6, duration: '5:42', src: '/music/nexus-fable/06 Track06.mp3' },
      { title: 'Track 07', num: 7, duration: '3:51', src: '/music/nexus-fable/07 Track07.mp3' },
      { title: 'Track 08', num: 8, duration: '1:16', src: '/music/nexus-fable/08 Track08.mp3' },
      { title: 'Track 09', num: 9, duration: '5:29', src: '/music/nexus-fable/09 Track09.mp3' },
      { title: 'Track 10', num: 10, duration: '5:47', src: '/music/nexus-fable/10 Track10.mp3' },
    ],
  },
  {
    title: 'Nexus - Shiftless (1996)',
    type: 'album',
    tracks: [
      { title: 'Shiftless', num: 1, duration: '5:47', src: '/music/nexus-shiftless/James S. Campbell - 01 - Shiftless.mp3' },
      { title: 'Fragments', num: 2, duration: '4:09', src: '/music/nexus-shiftless/James S. Campbell - 02 - Fragments.mp3' },
      { title: 'Sources', num: 3, duration: '5:27', src: '/music/nexus-shiftless/James S. Campbell - 03 - Sources.mp3' },
      { title: 'Synthetic Orchestra 2', num: 4, duration: '4:38', src: '/music/nexus-shiftless/James S. Campbell - 04 - Synthetic Orchestra 2.mp3' },
      { title: 'Synthetic Orchestra 1', num: 5, duration: '4:14', src: '/music/nexus-shiftless/James S. Campbell - 05 - Synthetic Orchestra 1.mp3' },
      { title: 'Transcendance', num: 6, duration: '2:46', src: '/music/nexus-shiftless/James S. Campbell - 06 - Transcendance.mp3' },
      { title: 'Nicotine', num: 7, duration: '5:11', src: '/music/nexus-shiftless/James S. Campbell - 07 - Nicotine.mp3' },
      { title: 'Sources 2', num: 8, duration: '5:25', src: '/music/nexus-shiftless/James S. Campbell - 08 - Sources 2.mp3' },
      { title: 'Fundamentals', num: 9, duration: '5:12', src: '/music/nexus-shiftless/James S. Campbell - 09 - Fundamentals.mp3' },
    ],
  },
  {
    title: 'Singles & Other Works',
    type: 'singles',
    tracks: [
      { title: 'Solace', year: '2002', duration: '2:26', src: '/music/Solace (2002).mp3' },
      { title: 'Gatwick Drones - Rotor', duration: '2:50', src: '/music/Gatwick Drones - Rotor.mp3' },
      { title: 'Shiftless (Test Remaster)', duration: '5:47', src: '/music/01 Shiftless (Test Remaster).mp3' },
    ],
  },
]

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function MusicPlayer() {
  const audioRef = useRef(null)
  const progressRef = useRef(null)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [loading, setLoading] = useState(false)
  const [expandedAlbum, setExpandedAlbum] = useState(0)

  const allTracks = albums.flatMap((album, albumIdx) =>
    album.tracks.map((track, trackIdx) => ({ ...track, albumIdx, trackIdx, albumTitle: album.title }))
  )

  const currentFlat = currentTrack
    ? allTracks.find(t => t.src === currentTrack.src)
    : null
  const currentFlatIdx = currentFlat ? allTracks.indexOf(currentFlat) : -1

  const playTrack = useCallback((track) => {
    setCurrentTrack(track)
    setLoading(true)
    if (audioRef.current) {
      audioRef.current.src = track.src
      audioRef.current.load()
      audioRef.current.play().catch(() => {})
    }
  }, [])

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {})
    }
  }, [isPlaying, currentTrack])

  const playNext = useCallback(() => {
    if (currentFlatIdx < 0) return
    const next = allTracks[(currentFlatIdx + 1) % allTracks.length]
    playTrack(next)
    setExpandedAlbum(next.albumIdx)
  }, [currentFlatIdx, allTracks, playTrack])

  const playPrev = useCallback(() => {
    if (currentFlatIdx < 0) return
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
      return
    }
    const prev = allTracks[(currentFlatIdx - 1 + allTracks.length) % allTracks.length]
    playTrack(prev)
    setExpandedAlbum(prev.albumIdx)
  }, [currentFlatIdx, allTracks, playTrack])

  const handleProgressClick = useCallback((e) => {
    if (!progressRef.current || !audioRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = pct * duration
  }, [duration])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onDurationChange = () => setDuration(audio.duration)
    const onCanPlay = () => setLoading(false)
    const onEnded = () => playNext()

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('ended', onEnded)
    }
  }, [playNext])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  return (
    <div className="music-player">
      <audio ref={audioRef} preload="none" />

      <div className="player-albums">
        {albums.map((album, albumIdx) => (
          <div key={albumIdx} className="player-album">
            <button
              className={`player-album-header ${expandedAlbum === albumIdx ? 'expanded' : ''}`}
              onClick={() => setExpandedAlbum(expandedAlbum === albumIdx ? -1 : albumIdx)}
            >
              <span className="player-album-toggle">{expandedAlbum === albumIdx ? '-' : '+'}</span>
              <span className="player-album-title">{album.title}</span>
              <span className="player-album-count">{album.tracks.length} tracks</span>
            </button>

            {expandedAlbum === albumIdx && (
              <div className="player-tracklist">
                {album.tracks.map((track, trackIdx) => {
                  const isActive = currentTrack?.src === track.src
                  return (
                    <button
                      key={trackIdx}
                      className={`player-track ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        if (isActive) {
                          togglePlay()
                        } else {
                          playTrack(track)
                        }
                      }}
                    >
                      <span className="player-track-num">
                        {isActive && isPlaying ? (
                          <span className="player-eq">
                            <span /><span /><span />
                          </span>
                        ) : isActive ? (
                          <span className="player-paused-icon">||</span>
                        ) : (
                          track.num || (trackIdx + 1)
                        )}
                      </span>
                      <span className="player-track-title">{track.title}</span>
                      {track.year && <span className="player-track-year">{track.year}</span>}
                      <span className="player-track-duration">{track.duration}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {currentTrack && (
        <div className="player-controls">
          <div className="player-now-playing">
            <span className="player-now-title">{currentTrack.title}</span>
            {loading && <span className="player-loading">loading...</span>}
          </div>

          <div className="player-progress" ref={progressRef} onClick={handleProgressClick}>
            <div
              className="player-progress-fill"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>

          <div className="player-bar">
            <span className="player-time">{formatTime(currentTime)}</span>

            <div className="player-buttons">
              <button className="player-btn" onClick={playPrev} title="Previous">
                &lt;&lt;
              </button>
              <button className="player-btn player-btn-play" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? '||' : '>'}
              </button>
              <button className="player-btn" onClick={playNext} title="Next">
                &gt;&gt;
              </button>
            </div>

            <span className="player-time">{formatTime(duration)}</span>
          </div>

          <div className="player-volume">
            <span className="player-volume-label">vol</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="player-volume-slider"
            />
          </div>
        </div>
      )}
    </div>
  )
}

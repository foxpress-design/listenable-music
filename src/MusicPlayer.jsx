import { useState } from 'react'
import './MusicPlayer.css'
import { albums } from './tracks'

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function MusicPlayer({ player }) {
  const [expandedAlbum, setExpandedAlbum] = useState(0)
  const progressRef = { current: null }

  const {
    currentTrack, isPlaying, currentTime, duration,
    volume, loading, playTrack, togglePlay, playNext,
    playPrev, seekTo, setVolume,
  } = player

  const handleProgressClick = (e) => {
    if (!progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    seekTo(pct)
  }

  return (
    <div className="music-player">
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
                          setExpandedAlbum(albumIdx)
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

          <div className="player-progress" ref={el => progressRef.current = el} onClick={handleProgressClick}>
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

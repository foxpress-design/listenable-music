import { useState, useRef } from 'react'
import './MusicPlayer.css'
import { albums, allTracks } from './tracks'

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function HeaderPlayer({ player }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const progressRef = useRef(null)

  const {
    currentTrack, isPlaying, currentTime, duration,
    volume, loading, error, playTrack, togglePlay, playNext,
    playPrev, seekTo, setVolume,
  } = player

  const handleProgressClick = (e) => {
    if (!progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    seekTo(pct)
  }

  return (
    <div className="hp">
      {/* Desktop: full controls */}
      <div className="hp-desktop">
        <div className="hp-left">
          <div className="hp-buttons">
            <button className="hp-btn" onClick={playPrev} title="Previous">&lt;&lt;</button>
            <button
              className={`hp-btn hp-btn-play ${isPlaying ? 'playing' : ''}`}
              onClick={() => {
                if (currentTrack) togglePlay()
                else playTrack(allTracks[0])
              }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '||' : '>'}
            </button>
            <button className="hp-btn" onClick={playNext} title="Next">&gt;&gt;</button>
          </div>

          <div
            className="hp-track-selector"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <span className="hp-track-name">
              {currentTrack ? currentTrack.title : 'Select a track'}
            </span>
            {loading && <span className="hp-loading">...</span>}
            {error && <span className="hp-error">!</span>}

            {showDropdown && (
              <div className="hp-dropdown">
                {albums.map(album => (
                  <div key={album.title}>
                    <div className="hp-dropdown-cat">{album.title}</div>
                    {album.tracks.map((track, idx) => (
                      <button
                        key={idx}
                        className={`hp-dropdown-item ${currentTrack?.src === track.src ? 'active' : ''}`}
                        onClick={() => {
                          playTrack(track)
                          setShowDropdown(false)
                        }}
                      >
                        <span className="hp-dropdown-item-title">{track.title}</span>
                        <span className="hp-dropdown-item-dur">{track.duration}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hp-center">
          <div className="hp-progress" ref={progressRef} onClick={handleProgressClick}>
            <div
              className="hp-progress-fill"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>
        </div>

        <div className="hp-right">
          <span className="hp-time">{formatTime(currentTime)}</span>
          <span className="hp-time-sep">/</span>
          <span className="hp-time">{formatTime(duration)}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="hp-volume"
          />
        </div>
      </div>

      {/* Mobile: minimal controls */}
      <div className="hp-mobile">
        <button
          className={`hp-btn hp-btn-play ${isPlaying ? 'playing' : ''}`}
          onClick={() => {
            if (currentTrack) togglePlay()
            else playTrack(allTracks[0])
          }}
        >
          {isPlaying ? '||' : '>'}
        </button>
        <div
          className="hp-mobile-info"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span className="hp-track-name">
            {currentTrack ? currentTrack.title : 'Select a track'}
          </span>
          <div className="hp-progress hp-progress-mini" onClick={(e) => { e.stopPropagation(); handleProgressClick(e) }}>
            <div
              className="hp-progress-fill"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>
        </div>
        <div className="hp-mobile-btns">
          <button className="hp-btn" onClick={playPrev}>&lt;&lt;</button>
          <button className="hp-btn" onClick={playNext}>&gt;&gt;</button>
        </div>

        {showDropdown && (
          <div className="hp-dropdown hp-dropdown-mobile">
            {albums.map(album => (
              <div key={album.title}>
                <div className="hp-dropdown-cat">{album.title}</div>
                {album.tracks.map((track, idx) => (
                  <button
                    key={idx}
                    className={`hp-dropdown-item ${currentTrack?.src === track.src ? 'active' : ''}`}
                    onClick={() => {
                      playTrack(track)
                      setShowDropdown(false)
                    }}
                  >
                    <span className="hp-dropdown-item-title">{track.title}</span>
                    <span className="hp-dropdown-item-dur">{track.duration}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MusicPlayer({ player }) {
  const [expandedAlbum, setExpandedAlbum] = useState(0)

  const { currentTrack, isPlaying, playTrack, togglePlay } = player

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
                        if (isActive) togglePlay()
                        else playTrack(track)
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
    </div>
  )
}

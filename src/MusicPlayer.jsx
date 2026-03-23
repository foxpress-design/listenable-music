import { useState, useRef, useEffect } from 'react'
import './MusicPlayer.css'
import { albums, allTracks } from './tracks'
import { downloadTrack, downloadAlbum } from './downloads'
import { trackDownload, trackAlbumDownload } from './analytics'

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
  const mobileDropdownRef = useRef(null)

  useEffect(() => {
    if (!showDropdown) return
    const handleOutsideClick = (e) => {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    // Use requestAnimationFrame so the listener isn't triggered by the same click that opened the dropdown
    const raf = requestAnimationFrame(() => {
      document.addEventListener('click', handleOutsideClick)
    })
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [showDropdown])

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
          <div className="hp-mobile-top">
            <span className="hp-track-name">
              {currentTrack ? currentTrack.title : 'Select a track'}
            </span>
            <span className="hp-mobile-time">
              {isPlaying && <span className="player-eq hp-mobile-eq"><span /><span /><span /></span>}
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
        <div className="hp-mobile-btns">
          <button className="hp-btn" onClick={playPrev}>&lt;&lt;</button>
          <button className="hp-btn" onClick={playNext}>&gt;&gt;</button>
        </div>

        {showDropdown && (
          <div className="hp-dropdown hp-dropdown-mobile" ref={mobileDropdownRef}>
            <div className="hp-dropdown-close" onClick={() => setShowDropdown(false)}>close</div>
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

      {/* Mobile: full-width progress bar at bottom of header */}
      <div className="hp-mobile-progress" ref={progressRef} onClick={handleProgressClick}>
        <div
          className="hp-progress-fill"
          style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
        />
      </div>
    </div>
  )
}

function formatCount(n) {
  if (!n) return '0'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export default function MusicPlayer({ player, counts = {} }) {
  const [expandedAlbum, setExpandedAlbum] = useState(0)
  const [downloading, setDownloading] = useState(null) // 'albumIdx-trackIdx' or 'album-albumIdx'
  const [zipProgress, setZipProgress] = useState(null) // { current, total }

  const { currentTrack, isPlaying, playTrack, togglePlay } = player

  const handleTrackDownload = async (e, track, album) => {
    e.stopPropagation()
    const key = `${track.src}`
    setDownloading(key)
    trackDownload(track, album.title)
    try {
      await downloadTrack(track)
    } catch (err) {
      console.error('Download failed:', err)
    }
    setDownloading(null)
  }

  const handleAlbumDownload = async (e, album, albumIdx) => {
    e.stopPropagation()
    const key = `album-${albumIdx}`
    setDownloading(key)
    setZipProgress({ current: 0, total: album.tracks.length })
    trackAlbumDownload(album.title, album.tracks.length)
    try {
      await downloadAlbum(album, (current, total, zipping) => {
        setZipProgress({ current, total, zipping })
      })
    } catch (err) {
      console.error('Album download failed:', err)
    }
    setDownloading(null)
    setZipProgress(null)
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
              <span className="player-album-plays">
                {formatCount(album.tracks.reduce((sum, t) => sum + (counts[t.src] || 0), 0))} plays
              </span>
              <span className="player-album-count">{album.tracks.length} tracks</span>
              <span
                className={`player-album-dl ${downloading === `album-${albumIdx}` ? 'downloading' : ''}`}
                onClick={(e) => handleAlbumDownload(e, album, albumIdx)}
                title={`Download ${album.title}`}
              >
                {downloading === `album-${albumIdx}`
                  ? (zipProgress?.zipping ? 'zipping...' : `${zipProgress?.current}/${zipProgress?.total}`)
                  : 'download all'
                }
              </span>
            </button>

            {expandedAlbum === albumIdx && (
              <div className="player-tracklist">
                {album.tracks.map((track, trackIdx) => {
                  const isActive = currentTrack?.src === track.src
                  const dlKey = track.src
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
                      <span className="player-track-plays">{formatCount(counts[track.src])} plays</span>
                      <span className="player-track-duration">{track.duration}</span>
                      <span
                        className={`player-track-dl ${downloading === dlKey ? 'downloading' : ''}`}
                        onClick={(e) => handleTrackDownload(e, track, album)}
                        title={`Download ${track.title}`}
                      >
                        {downloading === dlKey ? '...' : 'dl'}
                      </span>
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

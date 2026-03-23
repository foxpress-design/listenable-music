import { useState, useRef, useEffect, useCallback } from 'react'
import { allTracks } from './tracks'

export default function useAudioPlayer() {
  const audioRef = useRef(null)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const pendingPlayRef = useRef(false)

  const currentFlatIdx = currentTrack
    ? allTracks.findIndex(t => t.src === currentTrack.src)
    : -1

  const playTrack = useCallback((track) => {
    setCurrentTrack(track)
    setLoading(true)
    setError(null)
    setCurrentTime(0)
    setDuration(0)
    pendingPlayRef.current = true
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.src = track.src
      audio.load()
    }
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
  }, [isPlaying, currentTrack])

  const playNext = useCallback(() => {
    if (currentFlatIdx < 0) return
    const next = allTracks[(currentFlatIdx + 1) % allTracks.length]
    playTrack(next)
  }, [currentFlatIdx, playTrack])

  const playPrev = useCallback(() => {
    if (currentFlatIdx < 0) return
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    const prev = allTracks[(currentFlatIdx - 1 + allTracks.length) % allTracks.length]
    playTrack(prev)
  }, [currentFlatIdx, playTrack])

  const seekTo = useCallback((fraction) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    audio.currentTime = fraction * duration
  }, [duration])

  // Attach event listeners once, use refs for changing values
  const currentFlatIdxRef = useRef(currentFlatIdx)
  currentFlatIdxRef.current = currentFlatIdx
  const playTrackRef = useRef(playTrack)
  playTrackRef.current = playTrack

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onDurationChange = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration)
      }
    }
    const onCanPlay = () => {
      setLoading(false)
      if (pendingPlayRef.current) {
        pendingPlayRef.current = false
        audio.play().catch((err) => {
          console.error('Play failed:', err)
          setError(err.message)
        })
      }
    }
    const onPlaying = () => setLoading(false)
    const onError = () => {
      setLoading(false)
      const err = audio.error
      const msg = err ? `Error ${err.code}: ${err.message}` : 'Audio error'
      console.error('Audio error:', msg)
      setError(msg)
    }
    const onEnded = () => {
      const idx = currentFlatIdxRef.current
      if (idx >= 0) {
        const next = allTracks[(idx + 1) % allTracks.length]
        playTrackRef.current(next)
      }
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('error', onError)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  return {
    audioRef,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    loading,
    error,
    currentFlatIdx,
    playTrack,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    setVolume,
  }
}

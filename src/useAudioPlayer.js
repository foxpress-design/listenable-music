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

  const currentFlatIdx = currentTrack
    ? allTracks.findIndex(t => t.src === currentTrack.src)
    : -1

  const playTrack = useCallback((track) => {
    setCurrentTrack(track)
    setLoading(true)
    setCurrentTime(0)
    setDuration(0)
    const audio = audioRef.current
    if (audio) {
      audio.src = track.src
      audio.load()
      const playPromise = audio.play()
      if (playPromise) {
        playPromise.catch(() => {
          setLoading(false)
        })
      }
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
    const onCanPlay = () => setLoading(false)
    const onPlaying = () => setLoading(false)
    const onError = () => setLoading(false)
    const onEnded = () => {
      if (currentFlatIdx >= 0) {
        const next = allTracks[(currentFlatIdx + 1) % allTracks.length]
        playTrack(next)
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
  }, [currentFlatIdx, playTrack])

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
    currentFlatIdx,
    playTrack,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    setVolume,
  }
}

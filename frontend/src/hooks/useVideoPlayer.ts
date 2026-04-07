import { useRef, useState, useCallback } from 'react'

export function useVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [muted, setMuted] = useState(false)

  // React synthetic event handlers — wired directly to <video> element props
  // so they fire regardless of when the element mounts (fixes 0:00 / play-state bugs)
  const handleTimeUpdate = useCallback((time: number) => setCurrentTime(time), [])
  const handleDuration = useCallback((dur: number) => {
    if (isFinite(dur) && !isNaN(dur) && dur > 0) setDuration(dur)
  }, [])
  const handlePlay = useCallback(() => setPlaying(true), [])
  const handlePause = useCallback(() => setPlaying(false), [])
  const handleEnded = useCallback(() => setPlaying(false), [])

  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      videoRef.current.play().catch(() => {})
    }
  }, [])

  // Reads paused state directly from the element — avoids stale closure
  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [])

  const skipForward = useCallback((seconds = 10) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + seconds,
        videoRef.current.duration || Infinity
      )
    }
  }, [])

  const skipBackward = useCallback((seconds = 10) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        videoRef.current.currentTime - seconds,
        0
      )
    }
  }, [])

  const changeRate = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
    }
  }, [])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setMuted(videoRef.current.muted)
    }
  }, [])

  return {
    videoRef, currentTime, duration, playing, playbackRate, muted,
    seekTo, togglePlay, skipForward, skipBackward, changeRate, toggleMute,
    handleTimeUpdate, handleDuration, handlePlay, handlePause, handleEnded,
  }
}

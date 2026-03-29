import React, { useEffect, useRef } from 'react'
import { getVideoStreamUrl } from '../services/api'
import { formatTime } from '../utils/formatTime'

export interface VideoPlayerControls {
  videoRef: React.RefObject<HTMLVideoElement | null>
  currentTime: number
  duration: number
  playing: boolean
  playbackRate: number
  seekTo: (time: number) => void
  togglePlay: () => void
  changeRate: (rate: number) => void
}

interface VideoPlayerProps {
  videoId: string
  startTime?: number
  controls: VideoPlayerControls
}

export default function VideoPlayer({ videoId, startTime, controls }: VideoPlayerProps) {
  const { videoRef, currentTime, duration, playing, playbackRate, seekTo, togglePlay, changeRate } = controls

  const prevStartTime = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (startTime !== undefined && startTime !== prevStartTime.current) {
      prevStartTime.current = startTime
      seekTo(startTime)
    }
  }, [startTime, seekTo])

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = x / rect.width
    seekTo(pct * duration)
  }

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0

  const rates = [0.5, 1, 1.5, 2]

  return (
    <div
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(226, 179, 64, 0.18)',
        background: '#0d0d1a',
      }}
    >
      {/* Video element */}
      <div style={{ position: 'relative', background: '#000', aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          src={getVideoStreamUrl(videoId)}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onClick={togglePlay}
        />
        {/* Play overlay when paused */}
        {!playing && (
          <div
            onClick={togglePlay}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: 'rgba(0,0,0,0.15)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(226, 179, 64, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(226, 179, 64, 0.4)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M6 4l14 7-14 7V4z" fill="#1a1a2e" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ background: '#1a1a2e', padding: '12px 16px' }}>
        {/* Progress bar */}
        <div
          onClick={handleProgressClick}
          style={{
            height: '4px',
            background: 'rgba(245, 240, 232, 0.15)',
            borderRadius: '2px',
            cursor: 'pointer',
            marginBottom: '12px',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              background: '#e2b340',
              borderRadius: '2px',
              transition: 'width 0.1s linear',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: '-6px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#e2b340',
                boxShadow: '0 0 0 3px rgba(226,179,64,0.25)',
              }}
            />
          </div>
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: Play + time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={togglePlay}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e2b340',
              }}
            >
              {playing ? (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="5" y="4" width="4" height="14" rx="1" fill="#e2b340" />
                  <rect x="13" y="4" width="4" height="14" rx="1" fill="#e2b340" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M6 4l14 7-14 7V4z" fill="#e2b340" />
                </svg>
              )}
            </button>
            <span
              style={{
                color: 'rgba(245, 240, 232, 0.85)',
                fontSize: '13px',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 400,
                letterSpacing: '0.5px',
              }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right: Playback rate */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {rates.map((rate) => (
              <button
                key={rate}
                onClick={() => changeRate(rate)}
                style={{
                  background: playbackRate === rate ? '#e2b340' : 'rgba(245, 240, 232, 0.1)',
                  color: playbackRate === rate ? '#1a1a2e' : 'rgba(245, 240, 232, 0.6)',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 9px',
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (playbackRate !== rate) {
                    e.currentTarget.style.background = 'rgba(226, 179, 64, 0.2)'
                    e.currentTarget.style.color = '#e2b340'
                  }
                }}
                onMouseLeave={(e) => {
                  if (playbackRate !== rate) {
                    e.currentTarget.style.background = 'rgba(245, 240, 232, 0.1)'
                    e.currentTarget.style.color = 'rgba(245, 240, 232, 0.6)'
                  }
                }}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

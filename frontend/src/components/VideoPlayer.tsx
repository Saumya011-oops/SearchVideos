import React, { useEffect, useRef, useState, useCallback } from 'react'
import { getVideoStreamUrl } from '../services/api'
import { formatTime } from '../utils/formatTime'

export interface VideoPlayerControls {
  videoRef: React.RefObject<HTMLVideoElement | null>
  currentTime: number
  duration: number
  playing: boolean
  playbackRate: number
  muted: boolean
  seekTo: (time: number) => void
  togglePlay: () => void
  skipForward: (seconds?: number) => void
  skipBackward: (seconds?: number) => void
  changeRate: (rate: number) => void
  toggleMute: () => void
  handleTimeUpdate: (time: number) => void
  handleDuration: (dur: number) => void
  handlePlay: () => void
  handlePause: () => void
  handleEnded: () => void
}

interface VideoPlayerProps {
  videoId: string
  startTime?: number
  controls: VideoPlayerControls
}

export default function VideoPlayer({ videoId, startTime, controls }: VideoPlayerProps) {
  const {
    videoRef, currentTime, duration, playing, playbackRate, muted,
    seekTo, togglePlay, skipForward, skipBackward, changeRate, toggleMute,
    handleTimeUpdate, handleDuration, handlePlay, handlePause, handleEnded,
  } = controls

  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Hide overlay immediately on click — don't wait for the play event
  const [overlayVisible, setOverlayVisible] = useState(true)
  useEffect(() => {
    setOverlayVisible(!playing)
  }, [playing])

  const handleToggle = () => {
    setOverlayVisible(false)
    togglePlay()
  }

  const prevStartTime = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (startTime !== undefined && startTime !== prevStartTime.current) {
      prevStartTime.current = startTime
      seekTo(startTime)
    }
  }, [startTime, seekTo])

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFSChange)
    return () => document.removeEventListener('fullscreenchange', onFSChange)
  }, [])

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    seekTo(Math.max(0, Math.min(1, pct)) * duration)
  }

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0
  const rates = [0.5, 1, 1.5, 2]

  return (
    <div
      ref={containerRef}
      style={{
        borderRadius: isFullscreen ? 0 : '12px',
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
          onClick={handleToggle}
          playsInline
          preload="metadata"
          onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => handleDuration(e.currentTarget.duration)}
          onDurationChange={(e) => handleDuration(e.currentTarget.duration)}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
        />

        {/* Play overlay when paused */}
        {overlayVisible && (
          <div
            onClick={handleToggle}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', background: 'rgba(0,0,0,0.15)',
            }}
          >
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(226, 179, 64, 0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 12px rgba(226,179,64,0.15), 0 4px 20px rgba(226, 179, 64, 0.4)',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M7 4.5l16 7.5-16 7.5V4.5z" fill="#1a1a2e" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ background: '#1a1a2e', padding: '10px 16px 14px' }}>
        {/* Progress bar */}
        <div
          onClick={handleProgressClick}
          className="progress-bar-track"
          style={{
            height: '5px', background: 'rgba(245, 240, 232, 0.15)',
            borderRadius: '3px', cursor: 'pointer', marginBottom: '12px', position: 'relative',
          }}
        >
          <div style={{
            height: '100%', width: `${progressPct}%`,
            background: 'linear-gradient(90deg, #e2b340, #f0c96a)',
            borderRadius: '3px', transition: 'width 0.1s linear', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', right: '-6px', top: '50%', transform: 'translateY(-50%)',
              width: '13px', height: '13px', borderRadius: '50%', background: '#e2b340',
              boxShadow: '0 0 0 3px rgba(226,179,64,0.3)',
            }} />
          </div>
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: Mute + Skip back + Play/Pause + Skip forward + time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Mute */}
            <button onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'} style={iconBtnStyle}>
              {muted ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e2b340" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e2b340" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </button>

            {/* Skip backward 10s */}
            <button onClick={() => skipBackward(10)} title="Back 10s" style={iconBtnStyle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12.5 8.14v-4l-5 5 5 5v-4a4.48 4.48 0 014.5 4.5 4.48 4.48 0 01-4.5 4.5 4.48 4.48 0 01-4.5-4.5H6a6.5 6.5 0 006.5 6.5 6.5 6.5 0 006.5-6.5 6.5 6.5 0 00-6.5-6.5z" fill="#e2b340"/>
                <text x="9" y="17.5" fill="#e2b340" fontSize="7" fontFamily="Outfit" fontWeight="600">10</text>
              </svg>
            </button>

            {/* Play / Pause */}
            <button
              onClick={handleToggle}
              title={playing ? 'Pause' : 'Play'}
              style={{
                background: '#e2b340',
                border: 'none',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 2px 10px rgba(226,179,64,0.35)',
              }}
            >
              {playing ? (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <rect x="1.5" y="1" width="3.5" height="11" rx="1" fill="#1a1a2e" />
                  <rect x="8" y="1" width="3.5" height="11" rx="1" fill="#1a1a2e" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2.5 1.5l10 5-10 5V1.5z" fill="#1a1a2e" />
                </svg>
              )}
            </button>

            {/* Skip forward 10s */}
            <button onClick={() => skipForward(10)} title="Forward 10s" style={iconBtnStyle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M11.5 8.14v-4l5 5-5 5v-4A4.48 4.48 0 007 14.64a4.48 4.48 0 004.5 4.5 4.48 4.48 0 004.5-4.5H18a6.5 6.5 0 01-6.5 6.5A6.5 6.5 0 015 14.64a6.5 6.5 0 016.5-6.5z" fill="#e2b340"/>
                <text x="8.5" y="17.5" fill="#e2b340" fontSize="7" fontFamily="Outfit" fontWeight="600">10</text>
              </svg>
            </button>

            {/* Time display */}
            <span style={{
              color: 'rgba(245, 240, 232, 0.85)', fontSize: '12px',
              fontFamily: 'Outfit, sans-serif', fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.5px', marginLeft: '4px', whiteSpace: 'nowrap',
            }}>
              {formatTime(currentTime)} <span style={{ opacity: 0.45 }}>/</span> {formatTime(duration)}
            </span>
          </div>

          {/* Right: Playback rate + Fullscreen */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {rates.map((rate) => (
              <button
                key={rate}
                onClick={() => changeRate(rate)}
                style={{
                  background: playbackRate === rate ? '#e2b340' : 'rgba(245, 240, 232, 0.1)',
                  color: playbackRate === rate ? '#1a1a2e' : 'rgba(245, 240, 232, 0.6)',
                  border: 'none', borderRadius: '14px', fontSize: '11px', fontWeight: 600,
                  padding: '4px 9px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
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

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} style={{ ...iconBtnStyle, marginLeft: '4px' }}>
              {isFullscreen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e2b340" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                  <path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e2b340" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const iconBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2b340',
  flexShrink: 0,
}

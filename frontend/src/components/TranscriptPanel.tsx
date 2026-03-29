import { useEffect, useRef } from 'react'
import { Chunk } from '../types'
import { formatTime } from '../utils/formatTime'

interface TranscriptPanelProps {
  chunks: Chunk[]
  currentTime: number
  onSeek: (time: number) => void
}

export default function TranscriptPanel({ chunks, currentTime, onSeek }: TranscriptPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLDivElement>(null)

  const activeIndex = chunks.findIndex(
    (c) => currentTime >= c.start_time && currentTime < c.end_time
  )

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [activeIndex])

  if (chunks.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          gap: '12px',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="4" y="8" width="32" height="24" rx="3" stroke="rgba(26,26,46,0.2)" strokeWidth="1.8" />
          <rect x="4" y="8" width="5" height="5" fill="rgba(26,26,46,0.1)" />
          <rect x="4" y="16" width="5" height="5" fill="rgba(26,26,46,0.1)" />
          <rect x="4" y="24" width="5" height="5" fill="rgba(26,26,46,0.1)" />
          <path d="M16 16l12 4-12 4V16z" fill="rgba(26,26,46,0.15)" />
        </svg>
        <p style={{ color: 'rgba(26,26,46,0.45)', fontSize: '14px', margin: 0 }}>
          No transcript available
        </p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        overflowY: 'auto',
        maxHeight: '400px',
      }}
    >
      {chunks.map((chunk, idx) => {
        const isActive = idx === activeIndex
        return (
          <div
            key={chunk.id}
            ref={isActive ? activeRef : undefined}
            onClick={() => onSeek(chunk.start_time)}
            style={{
              display: 'flex',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              background: isActive ? 'rgba(226,179,64,0.08)' : 'transparent',
              borderLeft: `3px solid ${isActive ? '#e2b340' : 'transparent'}`,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(26,26,46,0.04)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            {/* Timestamp */}
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: isActive ? '#e2b340' : 'rgba(26,26,46,0.4)',
                flexShrink: 0,
                marginTop: '2px',
                fontFamily: 'Outfit, sans-serif',
                letterSpacing: '0.3px',
              }}
            >
              {formatTime(chunk.start_time)}
            </span>

            {/* Transcript text */}
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                lineHeight: '1.55',
                color: isActive ? '#1a1a2e' : 'rgba(26,26,46,0.65)',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {chunk.transcript_text}
            </p>
          </div>
        )
      })}
    </div>
  )
}

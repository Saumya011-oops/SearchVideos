import React, { useState } from 'react'
import { Chunk } from '../types'
import { formatTime } from '../utils/formatTime'

interface ChunkTimelineProps {
  chunks: Chunk[]
  currentTime: number
  duration: number
  onSeek: (time: number) => void
}

export default function ChunkTimeline({ chunks, currentTime, duration, onSeek }: ChunkTimelineProps) {
  const [hoveredChunkId, setHoveredChunkId] = useState<string | null>(null)

  // Don't render anything until video metadata is loaded and chunks exist
  if (!duration || chunks.length === 0) return null

  const currentChunkIdx = chunks.findIndex(
    (c) => currentTime >= c.start_time && currentTime < c.end_time
  )

  return (
    <div style={{ position: 'relative' }}>
      {/* Label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', color: 'rgba(26,26,46,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
          Chapters · {chunks.length}
        </span>
        {currentChunkIdx >= 0 && (
          <span style={{ fontSize: '11px', color: 'rgba(26,26,46,0.4)' }}>
            {formatTime(chunks[currentChunkIdx].start_time)} — {formatTime(chunks[currentChunkIdx].end_time)}
          </span>
        )}
      </div>

      {/* Timeline bar */}
      <div
        style={{
          height: '36px',
          background: 'rgba(26,26,46,0.08)',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        {chunks.map((chunk, idx) => {
          const left = (chunk.start_time / duration) * 100
          const width = ((chunk.end_time - chunk.start_time) / duration) * 100
          const isHovered = hoveredChunkId === chunk.id
          const isCurrent = idx === currentChunkIdx

          const segmentColor = idx % 2 === 0 ? '#2d6a6a' : '#e2b340'
          const opacity = isCurrent ? 0.9 : isHovered ? 0.7 : 0.4

          return (
            <div
              key={chunk.id}
              style={{
                position: 'absolute',
                left: `${left}%`,
                width: `${width}%`,
                height: '100%',
                background: segmentColor,
                opacity,
                transition: 'opacity 0.2s ease',
                borderRight: '1px solid rgba(245,240,232,0.3)',
              }}
              onClick={() => onSeek(chunk.start_time)}
              onMouseEnter={() => setHoveredChunkId(chunk.id)}
              onMouseLeave={() => setHoveredChunkId(null)}
            />
          )
        })}

        {/* Current time indicator */}
        <div
          style={{
            position: 'absolute',
            left: `${(currentTime / duration) * 100}%`,
            top: 0, bottom: 0,
            width: '2px',
            background: '#fff',
            boxShadow: '0 0 6px rgba(255,255,255,0.9)',
            transition: 'left 0.1s linear',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Tooltip */}
      {hoveredChunkId && (() => {
        const chunk = chunks.find((c) => c.id === hoveredChunkId)
        if (!chunk) return null
        const leftPct = ((chunk.start_time + (chunk.end_time - chunk.start_time) / 2) / duration) * 100

        return (
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: `${leftPct}%`,
              transform: 'translateX(-50%)',
              background: '#1a1a2e',
              color: '#f5f0e8',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              maxWidth: '240px',
              zIndex: 10,
              boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
              pointerEvents: 'none',
              border: '1px solid rgba(226,179,64,0.15)',
            }}
          >
            <div style={{ color: '#e2b340', fontSize: '11px', marginBottom: '4px', fontWeight: 600 }}>
              {formatTime(chunk.start_time)} — {formatTime(chunk.end_time)}
            </div>
            <div style={{
              lineHeight: 1.45, overflow: 'hidden',
              display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', opacity: 0.8,
            } as React.CSSProperties}>
              {chunk.transcript_text}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

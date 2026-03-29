import React, { useState } from 'react'
import { SearchResult as SearchResultType } from '../types'

interface SearchResultProps {
  result: SearchResultType
  onSeek?: (startTime: number) => void
  isActive?: boolean
  index: number
}

export default function SearchResult({ result, onSeek, isActive, index }: SearchResultProps) {
  const [hovered, setHovered] = useState(false)

  const scorePercent = Math.round(result.similarity_score * 100)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: '10px',
        border: `1px solid ${isActive ? 'rgba(226, 179, 64, 0.4)' : 'rgba(226, 179, 64, 0.15)'}`,
        boxShadow: isActive || hovered
          ? '0 8px 32px rgba(226, 179, 64, 0.15)'
          : '0 2px 12px rgba(226, 179, 64, 0.07)',
        display: 'flex',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-1px)' : 'none',
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          width: isActive ? '5px' : '3px',
          background: '#e2b340',
          flexShrink: 0,
          transition: 'width 0.2s ease',
        }}
      />

      {/* Content */}
      <div style={{ padding: '14px 16px', flex: 1, minWidth: 0 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
          {/* Rank */}
          <span
            style={{
              fontSize: '11px',
              color: 'rgba(26,26,46,0.4)',
              fontWeight: 500,
            }}
          >
            #{index + 1}
          </span>

          {/* Timestamp badge */}
          <button
            onClick={() => onSeek && onSeek(result.start_time)}
            style={{
              background: '#2d6a6a',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 500,
              padding: '3px 9px',
              cursor: onSeek ? 'pointer' : 'default',
              fontFamily: 'Outfit, sans-serif',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => { if (onSeek) e.currentTarget.style.background = '#3d8a8a' }}
            onMouseLeave={(e) => { if (onSeek) e.currentTarget.style.background = '#2d6a6a' }}
          >
            {result.start_time_formatted} — {result.end_time_formatted}
          </button>

          {/* Video title */}
          {result.video_title && (
            <span
              style={{
                fontSize: '12px',
                color: 'rgba(26,26,46,0.5)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '200px',
              }}
            >
              {result.video_title}
            </span>
          )}
        </div>

        {/* Transcript text */}
        <p
          style={{
            color: '#1a1a2e',
            fontSize: '14px',
            lineHeight: '1.55',
            margin: '0 0 8px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: '3',
            WebkitBoxOrient: 'vertical',
          } as React.CSSProperties}
        >
          {result.transcript}
        </p>

        {/* Visual context */}
        {result.visual_context && (
          <p
            style={{
              color: '#2d6a6a',
              fontSize: '12px',
              lineHeight: '1.5',
              margin: '0 0 10px',
              fontStyle: 'italic',
              opacity: 0.85,
            }}
          >
            {result.visual_context}
          </p>
        )}

        {/* Similarity score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              flex: 1,
              height: '4px',
              background: 'rgba(26,26,46,0.08)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${scorePercent}%`,
                background: '#e2b340',
                borderRadius: '2px',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
          <span
            style={{
              fontSize: '11px',
              color: 'rgba(26,26,46,0.5)',
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {scorePercent}% match
          </span>
        </div>
      </div>
    </div>
  )
}

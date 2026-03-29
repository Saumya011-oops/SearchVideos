import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Video } from '../types'
import { formatDuration } from '../utils/formatTime'

interface VideoCardProps {
  video: Video
  onClick?: () => void
}

function StatusBadge({ video }: { video: Video }) {
  const [showTooltip, setShowTooltip] = useState(false)

  const badgeStyles: Record<string, React.CSSProperties> = {
    processing: {
      background: 'rgba(226, 179, 64, 0.2)',
      color: '#c49a2a',
      border: '1px solid rgba(226, 179, 64, 0.4)',
    },
    ready: {
      background: 'rgba(45, 106, 106, 0.15)',
      color: '#2d6a6a',
      border: '1px solid rgba(45, 106, 106, 0.3)',
    },
    failed: {
      background: 'rgba(212, 96, 58, 0.15)',
      color: '#d4603a',
      border: '1px solid rgba(212, 96, 58, 0.3)',
    },
    uploading: {
      background: 'rgba(100, 100, 100, 0.1)',
      color: '#666',
      border: '1px solid rgba(100, 100, 100, 0.2)',
    },
  }

  const labels: Record<string, string> = {
    processing: 'Processing...',
    ready: 'Ready',
    failed: 'Failed',
    uploading: 'Uploading...',
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <span
        style={{
          ...badgeStyles[video.status],
          fontSize: '11px',
          fontWeight: 500,
          padding: '3px 8px',
          borderRadius: '20px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          cursor: video.status === 'failed' ? 'help' : 'default',
        }}
        onMouseEnter={() => video.status === 'failed' && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {video.status === 'processing' && (
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#e2b340',
              display: 'inline-block',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        )}
        {video.status === 'ready' && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="#2d6a6a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {labels[video.status]}
      </span>
      {showTooltip && video.error_message && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '6px',
            background: '#1a1a2e',
            color: '#f5f0e8',
            fontSize: '11px',
            padding: '6px 10px',
            borderRadius: '6px',
            maxWidth: '200px',
            whiteSpace: 'normal',
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            pointerEvents: 'none',
          }}
        >
          {video.error_message}
        </div>
      )}
    </div>
  )
}

export default function VideoCard({ video, onClick }: VideoCardProps) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(`/video/${video.id}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: '10px',
        boxShadow: hovered
          ? '0 8px 32px rgba(226, 179, 64, 0.18)'
          : '0 4px 24px rgba(226, 179, 64, 0.10)',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        overflow: 'hidden',
        border: '1px solid rgba(226, 179, 64, 0.15)',
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          height: '160px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d3050 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {video.thumbnail_path ? (
          <img
            src={video.thumbnail_path}
            alt={video.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="10" width="40" height="28" rx="3" stroke="rgba(226,179,64,0.4)" strokeWidth="2" />
            <rect x="4" y="10" width="6" height="6" fill="rgba(226,179,64,0.25)" />
            <rect x="4" y="20" width="6" height="6" fill="rgba(226,179,64,0.25)" />
            <rect x="4" y="30" width="6" height="6" fill="rgba(226,179,64,0.25)" />
            <rect x="38" y="10" width="6" height="6" fill="rgba(226,179,64,0.25)" />
            <rect x="38" y="20" width="6" height="6" fill="rgba(226,179,64,0.25)" />
            <rect x="38" y="30" width="6" height="6" fill="rgba(226,179,64,0.25)" />
            <path d="M20 19l12 5-12 5V19z" fill="rgba(226,179,64,0.5)" />
          </svg>
        )}
        {/* Duration badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'rgba(26, 26, 46, 0.85)',
            color: '#f5f0e8',
            fontSize: '11px',
            fontWeight: 500,
            padding: '2px 7px',
            borderRadius: '4px',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          {formatDuration(video.duration_seconds)}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px 16px' }}>
        <h3
          className="heading"
          style={{
            color: '#1a1a2e',
            fontSize: '16px',
            fontWeight: 400,
            margin: '0 0 8px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={video.title}
        >
          {video.title}
        </h3>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <StatusBadge video={video} />
          <span
            style={{
              fontSize: '11px',
              color: 'rgba(26, 26, 46, 0.4)',
            }}
          >
            {new Date(video.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}

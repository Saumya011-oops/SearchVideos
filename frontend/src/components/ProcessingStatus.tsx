import { useState, useEffect } from 'react'
import { Video } from '../types'

interface ProcessingStatusProps {
  video: Video
}

const STAGES = [
  'Downloading',
  'Extracting Audio',
  'Transcribing',
  'Analyzing Frames',
  'Embedding',
  'Storing',
]

export default function ProcessingStatus({ video }: ProcessingStatusProps) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0)

  useEffect(() => {
    if (video.status !== 'processing') return

    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev))
    }, 3000)

    return () => clearInterval(interval)
  }, [video.status])

  if (video.status === 'uploading') {
    return (
      <div
        style={{
          background: '#fff',
          borderRadius: '10px',
          border: '1px solid rgba(226,179,64,0.2)',
          padding: '20px',
          boxShadow: '0 4px 24px rgba(226,179,64,0.08)',
        }}
      >
        <h4
          className="heading"
          style={{ margin: '0 0 16px', color: '#1a1a2e', fontSize: '18px' }}
        >
          Uploading...
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: '2px solid rgba(226,179,64,0.2)',
              borderTopColor: '#e2b340',
              animation: 'spin 1s linear infinite',
              flexShrink: 0,
            }}
          />
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          <span style={{ color: 'rgba(26,26,46,0.6)', fontSize: '14px' }}>
            Uploading your video...
          </span>
        </div>
      </div>
    )
  }

  if (video.status === 'failed') {
    return (
      <div
        style={{
          background: 'rgba(212,96,58,0.05)',
          borderRadius: '10px',
          border: '1px solid rgba(212,96,58,0.25)',
          padding: '20px',
        }}
      >
        <h4
          className="heading"
          style={{ margin: '0 0 8px', color: '#d4603a', fontSize: '18px' }}
        >
          Processing Failed
        </h4>
        {video.error_message && (
          <p style={{ margin: 0, color: 'rgba(212,96,58,0.85)', fontSize: '14px' }}>
            {video.error_message}
          </p>
        )}
      </div>
    )
  }

  const allDone = video.status === 'ready'

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '10px',
        border: '1px solid rgba(226,179,64,0.2)',
        padding: '20px',
        boxShadow: '0 4px 24px rgba(226,179,64,0.08)',
      }}
    >
      <h4
        className="heading"
        style={{ margin: '0 0 16px', color: '#1a1a2e', fontSize: '18px' }}
      >
        {allDone ? 'Processing Complete' : 'Processing Video'}
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {STAGES.map((stage, idx) => {
          const isDone = allDone || idx < currentStageIdx
          const isCurrent = !allDone && idx === currentStageIdx

          return (
            <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Circle indicator */}
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: isDone
                    ? '#2d6a6a'
                    : isCurrent
                    ? 'rgba(226,179,64,0.15)'
                    : 'rgba(26,26,46,0.07)',
                  border: isCurrent
                    ? '2px solid #e2b340'
                    : isDone
                    ? 'none'
                    : '2px solid rgba(26,26,46,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  animation: isCurrent ? 'stage-pulse 1.2s ease-in-out infinite' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {isDone && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5l2.5 2.5L8 2.5"
                      stroke="#fff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {isCurrent && (
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#e2b340',
                    }}
                  />
                )}
              </div>

              {/* Stage label */}
              <span
                style={{
                  fontSize: '14px',
                  color: isDone
                    ? '#2d6a6a'
                    : isCurrent
                    ? '#1a1a2e'
                    : 'rgba(26,26,46,0.4)',
                  fontWeight: isCurrent ? 500 : 400,
                  transition: 'color 0.3s ease',
                }}
              >
                {stage}
              </span>

              {isCurrent && (
                <span
                  style={{
                    fontSize: '11px',
                    color: '#e2b340',
                    fontWeight: 500,
                    animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
                  }}
                >
                  In progress...
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

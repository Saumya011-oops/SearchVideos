import React, { useRef, useState } from 'react'

interface UploadZoneProps {
  onUpload: (file: File) => void
  uploading?: boolean
  progress?: number
}

export default function UploadZone({ onUpload, uploading = false, progress = 0 }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('video/')) {
      onUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${dragging ? '#e2b340' : 'rgba(226, 179, 64, 0.4)'}`,
          borderRadius: '12px',
          height: '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          cursor: uploading ? 'default' : 'pointer',
          background: dragging ? 'rgba(226, 179, 64, 0.06)' : 'rgba(255,255,255,0.6)',
          transition: 'all 0.2s ease',
          padding: '24px',
        }}
      >
        {uploading ? (
          <>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '3px solid rgba(226,179,64,0.2)',
                borderTopColor: '#e2b340',
                animation: 'spin 1s linear infinite',
              }}
            />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            <p style={{ margin: 0, color: '#1a1a2e', fontSize: '14px', fontWeight: 500 }}>
              Uploading... {progress}%
            </p>
            {/* Progress bar */}
            <div
              style={{
                width: '200px',
                height: '6px',
                background: 'rgba(26,26,46,0.1)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: '#e2b340',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </>
        ) : (
          <>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="22" cy="22" r="20" fill="rgba(226,179,64,0.1)" />
              <path
                d="M22 28V16M16 22l6-6 6 6"
                stroke={dragging ? '#e2b340' : 'rgba(226,179,64,0.7)'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 34h16"
                stroke={dragging ? '#e2b340' : 'rgba(226,179,64,0.7)'}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  margin: '0 0 4px',
                  color: '#1a1a2e',
                  fontSize: '15px',
                  fontWeight: 500,
                }}
              >
                Drag a video here or{' '}
                <span style={{ color: '#e2b340', textDecoration: 'underline' }}>click to browse</span>
              </p>
              <p style={{ margin: 0, color: 'rgba(26,26,46,0.45)', fontSize: '13px' }}>
                Supports MP4, MOV, AVI, MKV and more
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

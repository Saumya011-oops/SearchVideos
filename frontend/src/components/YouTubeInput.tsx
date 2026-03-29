import React, { useState } from 'react'

interface YouTubeInputProps {
  onSubmit: (url: string) => void
  loading?: boolean
}

export default function YouTubeInput({ onSubmit, loading = false }: YouTubeInputProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)

  const isValidYouTubeUrl = (value: string): boolean => {
    return value.includes('youtube.com') || value.includes('youtu.be')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!url.trim()) {
      setError('Please enter a YouTube URL')
      return
    }
    if (!isValidYouTubeUrl(url.trim())) {
      setError('Please enter a valid YouTube URL (youtube.com or youtu.be)')
      return
    }
    onSubmit(url.trim())
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        {/* YouTube icon */}
        <div
          style={{
            flexShrink: 0,
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(212, 96, 58, 0.1)',
            borderRadius: '10px',
            marginTop: '6px',
          }}
        >
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M21.543 2.495A2.76 2.76 0 0 0 19.6.549C17.906 0 11 0 11 0S4.094 0 2.4.549A2.76 2.76 0 0 0 .457 2.495C0 4.19 0 7.737 0 7.737s0 3.547.457 5.242a2.76 2.76 0 0 0 1.943 1.947C4.094 15.474 11 15.474 11 15.474s6.906 0 8.6-.548a2.76 2.76 0 0 0 1.943-1.947C22 11.284 22 7.737 22 7.737s0-3.547-.457-5.242z"
              fill="#d4603a"
            />
            <path d="M8.8 10.968V4.505l5.818 3.232-5.818 3.231z" fill="white" />
          </svg>
        </div>

        {/* Input + button */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div
              style={{
                flex: 1,
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                background: '#fff',
                borderRadius: '10px',
                border: `2px solid ${focused ? '#e2b340' : 'rgba(226, 179, 64, 0.3)'}`,
                boxShadow: focused ? '0 0 0 3px rgba(226,179,64,0.08)' : 'none',
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                paddingLeft: '14px',
              }}
            >
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setError(null)
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="https://youtube.com/watch?v=..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '14px',
                  fontFamily: 'Outfit, sans-serif',
                  color: '#1a1a2e',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                height: '44px',
                padding: '0 20px',
                background: loading ? '#e2b340' : '#d4603a',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'Outfit, sans-serif',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'background 0.2s ease',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#b84e2a'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = '#d4603a'
              }}
            >
              {loading ? (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    style={{ animation: 'spin 1s linear infinite' }}
                  >
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                    <path d="M7 1.5a5.5 5.5 0 0 1 5.5 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Processing...
                </>
              ) : (
                'Add Video'
              )}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <p
              style={{
                margin: '6px 0 0',
                color: '#d4603a',
                fontSize: '12px',
              }}
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </form>
  )
}

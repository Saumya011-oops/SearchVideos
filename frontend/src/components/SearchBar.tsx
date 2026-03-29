import React, { useState, useRef } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  initialValue?: string
  isLoading?: boolean
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search inside your videos...',
  initialValue = '',
  isLoading = false,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (value.trim()) {
      onSearch(value.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '56px',
          background: '#fff',
          borderRadius: '10px',
          border: focused
            ? '2px solid #e2b340'
            : '2px solid rgba(226, 179, 64, 0.3)',
          boxShadow: focused
            ? '0 0 0 4px rgba(226, 179, 64, 0.1), 0 4px 24px rgba(226, 179, 64, 0.10)'
            : '0 4px 24px rgba(226, 179, 64, 0.10)',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {/* Search icon */}
        <div style={{ padding: '0 14px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="9"
              cy="9"
              r="6"
              stroke={focused ? '#e2b340' : 'rgba(26,26,46,0.35)'}
              strokeWidth="1.8"
              style={{ transition: 'stroke 0.2s ease' }}
            />
            <path
              d="M13.5 13.5L17 17"
              stroke={focused ? '#e2b340' : 'rgba(26,26,46,0.35)'}
              strokeWidth="1.8"
              strokeLinecap="round"
              style={{ transition: 'stroke 0.2s ease' }}
            />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '16px',
            fontFamily: 'Outfit, sans-serif',
            color: '#1a1a2e',
            padding: '0',
          }}
        />

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          style={{
            height: '100%',
            padding: '0 24px',
            background: isLoading || !value.trim() ? 'rgba(226, 179, 64, 0.5)' : '#e2b340',
            border: 'none',
            cursor: isLoading || !value.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#1a1a2e',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Outfit, sans-serif',
            transition: 'background 0.2s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!isLoading && value.trim()) {
              e.currentTarget.style.background = '#c49a2a'
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && value.trim()) {
              e.currentTarget.style.background = '#e2b340'
            }
          }}
        >
          {isLoading ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              style={{ animation: 'spin 1s linear infinite' }}
            >
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              <circle cx="9" cy="9" r="7" stroke="rgba(26,26,46,0.3)" strokeWidth="2" />
              <path d="M9 2a7 7 0 0 1 7 7" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <span>Search</span>
          )}
        </button>
      </div>
    </form>
  )
}

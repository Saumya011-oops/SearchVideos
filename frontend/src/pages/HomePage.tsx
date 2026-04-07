import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import VideoCard from '../components/VideoCard'
import { useVideos } from '../hooks/useVideos'
import { getStats } from '../services/api'
import { Stats } from '../types'

export default function HomePage() {
  const navigate = useNavigate()
  const { videos, loading, error, refetch } = useVideos()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => {/* stats are optional */})
  }, [])

  // Poll every 5 seconds if any videos are processing
  useEffect(() => {
    const hasProcessing = videos.some((v) => v.status === 'processing' || v.status === 'uploading')
    if (!hasProcessing) return
    const interval = setInterval(refetch, 5000)
    return () => clearInterval(interval)
  }, [videos, refetch])

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Hero section */}
      <section
        style={{
          background: 'linear-gradient(180deg, rgba(26,26,46,0.04) 0%, transparent 100%)',
          padding: '72px 24px 56px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h1
            className="heading"
            style={{
              fontSize: 'clamp(36px, 5vw, 52px)',
              color: '#1a1a2e',
              margin: '0 0 16px',
              lineHeight: 1.15,
            }}
          >
            Search Inside Your Videos
          </h1>
          <p
            style={{
              fontSize: '17px',
              color: 'rgba(26,26,46,0.6)',
              margin: '0 0 36px',
              lineHeight: 1.6,
            }}
          >
            Natural language search across video content — find any moment instantly
          </p>
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Stats bar */}
      {stats && (
        <section
          style={{
            padding: '16px 24px',
            background: 'rgba(26,26,46,0.04)',
            borderTop: '1px solid rgba(226,179,64,0.12)',
            borderBottom: '1px solid rgba(226,179,64,0.12)',
          }}
        >
          <p
            style={{
              textAlign: 'center',
              margin: 0,
              fontSize: '13px',
              color: 'rgba(26,26,46,0.5)',
            }}
          >
            <span style={{ color: '#2d6a6a', fontWeight: 600 }}>{stats.total_videos}</span> videos indexed
            {' '}&bull;{' '}
            <span style={{ color: '#2d6a6a', fontWeight: 600 }}>{stats.total_chunks}</span> moments searchable
            {' '}&bull;{' '}
            <span style={{ color: '#2d6a6a', fontWeight: 600 }}>{stats.total_searches}</span> searches run
          </p>
        </section>
      )}

      {/* Library section */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 64px' }}>
        {/* Section header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
          }}
        >
          <h2
            className="heading"
            style={{
              fontSize: '28px',
              color: '#1a1a2e',
              margin: 0,
            }}
          >
            Your Library
          </h2>
          <Link
            to="/upload"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              background: '#d4603a',
              color: '#fff',
              textDecoration: 'none',
              padding: '9px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#b84e2a'
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#d4603a'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Upload
          </Link>
        </div>

        {/* Loading state */}
        {loading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 24px rgba(226,179,64,0.08)',
                }}
              >
                <div
                  className="animate-shimmer"
                  style={{ height: '160px' }}
                />
                <div style={{ padding: '14px 16px', background: '#fff' }}>
                  <div
                    className="animate-shimmer"
                    style={{ height: '18px', borderRadius: '4px', marginBottom: '10px', width: '75%' }}
                  />
                  <div
                    className="animate-shimmer"
                    style={{ height: '14px', borderRadius: '4px', width: '40%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              background: 'rgba(212,96,58,0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(212,96,58,0.2)',
            }}
          >
            <p style={{ color: '#d4603a', margin: '0 0 12px' }}>Failed to load videos: {error}</p>
            <button
              onClick={refetch}
              style={{
                background: '#d4603a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && videos.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '64px 24px',
              gap: '20px',
            }}
          >
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="36" fill="rgba(226,179,64,0.08)" stroke="rgba(226,179,64,0.25)" strokeWidth="2" />
              <rect x="18" y="28" width="44" height="28" rx="3" stroke="rgba(226,179,64,0.5)" strokeWidth="2" />
              <rect x="18" y="28" width="7" height="7" fill="rgba(226,179,64,0.3)" />
              <rect x="18" y="38" width="7" height="7" fill="rgba(226,179,64,0.3)" />
              <rect x="18" y="48" width="7" height="7" fill="rgba(226,179,64,0.3)" />
              <rect x="55" y="28" width="7" height="7" fill="rgba(226,179,64,0.3)" />
              <rect x="55" y="38" width="7" height="7" fill="rgba(226,179,64,0.3)" />
              <rect x="55" y="48" width="7" height="7" fill="rgba(226,179,64,0.3)" />
              <path d="M33 36l16 6-16 6V36z" fill="rgba(226,179,64,0.4)" />
            </svg>
            <div style={{ textAlign: 'center' }}>
              <p
                className="heading"
                style={{ color: '#1a1a2e', fontSize: '22px', margin: '0 0 8px' }}
              >
                No videos yet
              </p>
              <p style={{ color: 'rgba(26,26,46,0.5)', fontSize: '15px', margin: '0 0 20px' }}>
                Upload one to get started.
              </p>
              <Link
                to="/upload"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#d4603a',
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '11px 28px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#b84e2a' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#d4603a' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Upload a Video
              </Link>
            </div>
          </div>
        )}

        {/* Video grid */}
        {!loading && !error && videos.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} onDeleted={refetch} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

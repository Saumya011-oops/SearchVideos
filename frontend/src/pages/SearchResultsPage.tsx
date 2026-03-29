import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import SearchResult from '../components/SearchResult'
import { useSearch } from '../hooks/useSearch'

function SkeletonCard() {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '10px',
        border: '1px solid rgba(226,179,64,0.12)',
        display: 'flex',
        overflow: 'hidden',
        height: '120px',
      }}
    >
      <div style={{ width: '3px', background: 'rgba(226,179,64,0.2)', flexShrink: 0 }} />
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="animate-shimmer" style={{ height: '14px', borderRadius: '4px', width: '30%' }} />
        <div className="animate-shimmer" style={{ height: '14px', borderRadius: '4px', width: '90%' }} />
        <div className="animate-shimmer" style={{ height: '14px', borderRadius: '4px', width: '70%' }} />
        <div className="animate-shimmer" style={{ height: '6px', borderRadius: '3px', width: '50%', marginTop: '4px' }} />
      </div>
    </div>
  )
}

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''
  const { results, loading, error, lastQuery, doSearch } = useSearch()

  useEffect(() => {
    if (query) {
      doSearch(query)
    }
  }, [query, doSearch])

  const handleSearch = (newQuery: string) => {
    navigate(`/search?q=${encodeURIComponent(newQuery)}`)
  }

  const handleResultClick = (videoId: string, startTime: number) => {
    navigate(`/video/${videoId}?t=${startTime}`)
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '36px 24px 64px' }}>
      {/* Search bar */}
      <div style={{ marginBottom: '32px' }}>
        <SearchBar
          onSearch={handleSearch}
          initialValue={query}
          isLoading={loading}
          placeholder="Search inside your videos..."
        />
      </div>

      {/* Results header */}
      {!loading && lastQuery && (
        <div style={{ marginBottom: '20px' }}>
          {error ? (
            <p style={{ color: '#d4603a', fontSize: '15px', margin: 0 }}>
              Error: {error}
            </p>
          ) : (
            <p style={{ color: 'rgba(26,26,46,0.55)', fontSize: '15px', margin: 0 }}>
              <span style={{ color: '#1a1a2e', fontWeight: 600 }}>{results.length}</span>
              {results.length === 1 ? ' result' : ' results'} for{' '}
              <span
                className="heading"
                style={{ color: '#1a1a2e', fontSize: '16px' }}
              >
                &ldquo;{lastQuery}&rdquo;
              </span>
            </p>
          )}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && results.length === 0 && lastQuery && (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <circle cx="28" cy="28" r="20" stroke="rgba(26,26,46,0.15)" strokeWidth="2" />
            <path d="M42 42l8 8" stroke="rgba(26,26,46,0.15)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M22 28h12M28 22v12" stroke="rgba(212,96,58,0.4)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div>
            <p
              className="heading"
              style={{ color: '#1a1a2e', fontSize: '20px', margin: '0 0 8px' }}
            >
              No results found
            </p>
            <p style={{ color: 'rgba(26,26,46,0.5)', fontSize: '14px', margin: 0 }}>
              No results found for &ldquo;{lastQuery}&rdquo;. Try different keywords.
            </p>
          </div>
        </div>
      )}

      {/* Results list */}
      {!loading && results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {results.map((result, idx) => (
            <SearchResult
              key={result.chunk_id}
              result={result}
              index={idx}
              onSeek={() => handleResultClick(result.video_id, result.start_time)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

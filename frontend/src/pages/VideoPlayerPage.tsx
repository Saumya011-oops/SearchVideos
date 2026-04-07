import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import VideoPlayer from '../components/VideoPlayer'
import ChunkTimeline from '../components/ChunkTimeline'
import SearchBar from '../components/SearchBar'
import SearchResult from '../components/SearchResult'
import TranscriptPanel from '../components/TranscriptPanel'
import { getVideo, getVideoChunks, search as apiSearch } from '../services/api'
import { Video, Chunk, SearchResult as SearchResultType } from '../types'
import { useVideoPlayer } from '../hooks/useVideoPlayer'
import { formatTime } from '../utils/formatTime'

type RightPanelTab = 'search' | 'transcript'

export default function VideoPlayerPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const tParam = searchParams.get('t')
  const initialSeekTime = tParam ? parseFloat(tParam) : undefined

  const [video, setVideo] = useState<Video | null>(null)
  const [chunks, setChunks] = useState<Chunk[]>([])
  const [loadingVideo, setLoadingVideo] = useState(true)
  const [videoError, setVideoError] = useState<string | null>(null)

  const [searchResults, setSearchResults] = useState<SearchResultType[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [rightTab, setRightTab] = useState<RightPanelTab>('transcript')
  const [seekTime, setSeekTime] = useState<number | undefined>(initialSeekTime)

  // Single useVideoPlayer instance shared with VideoPlayer component
  const playerControls = useVideoPlayer()

  useEffect(() => {
    if (!id) return
    setLoadingVideo(true)
    Promise.all([getVideo(id), getVideoChunks(id)])
      .then(([v, c]) => {
        setVideo(v)
        setChunks(c)
        setVideoError(null)
      })
      .catch((e: unknown) => {
        setVideoError(e instanceof Error ? e.message : 'Failed to load video')
      })
      .finally(() => setLoadingVideo(false))
  }, [id])

  const handleSearch = useCallback(
    async (query: string) => {
      if (!id || !query.trim()) return
      setSearchLoading(true)
      setRightTab('search')
      try {
        const data = await apiSearch(query, id, 10)
        setSearchResults(data.results)
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    },
    [id]
  )

  const handleSeek = useCallback(
    (time: number) => {
      setSeekTime(time)
      playerControls.seekTo(time)
    },
    [playerControls]
  )

  if (loadingVideo) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px', display: 'flex', gap: '24px' }}>
        <div style={{ flex: '0 0 70%' }}>
          <div className="animate-shimmer" style={{ height: '32px', borderRadius: '8px', marginBottom: '20px', width: '60%' }} />
          <div className="animate-shimmer" style={{ aspectRatio: '16/9', borderRadius: '12px', marginBottom: '12px' }} />
          <div className="animate-shimmer" style={{ height: '36px', borderRadius: '8px' }} />
        </div>
        <div style={{ flex: '0 0 30%' }}>
          <div className="animate-shimmer" style={{ height: '56px', borderRadius: '10px', marginBottom: '16px' }} />
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-shimmer" style={{ height: '100px', borderRadius: '8px', marginBottom: '10px' }} />
          ))}
        </div>
      </div>
    )
  }

  if (videoError || !video) {
    return (
      <div style={{ maxWidth: '900px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{
          background: 'rgba(212,96,58,0.08)',
          border: '1px solid rgba(212,96,58,0.2)',
          borderRadius: '12px',
          padding: '32px',
        }}>
          <p style={{ color: '#d4603a', fontSize: '16px', margin: 0 }}>
            {videoError || 'Video not found'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 24px 64px',
        display: 'flex',
        gap: '24px',
        alignItems: 'flex-start',
      }}
    >
      {/* Left panel — 70% */}
      <div style={{ flex: '0 0 calc(70% - 12px)', minWidth: 0 }}>
        {/* Title + metadata */}
        <div style={{ marginBottom: '18px' }}>
          <h1
            className="heading"
            style={{ fontSize: 'clamp(22px, 3vw, 30px)', color: '#1a1a2e', margin: '0 0 8px', lineHeight: 1.2 }}
          >
            {video.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {playerControls.duration > 0 && (
              <span style={{
                fontSize: '12px',
                background: 'rgba(45,106,106,0.1)',
                color: '#2d6a6a',
                padding: '3px 10px',
                borderRadius: '20px',
                fontWeight: 600,
                border: '1px solid rgba(45,106,106,0.2)',
              }}>
                {formatTime(playerControls.duration)}
              </span>
            )}
            {chunks.length > 0 && (
              <span style={{ fontSize: '12px', color: 'rgba(26,26,46,0.4)' }}>
                {chunks.length} chapters
              </span>
            )}
          </div>
        </div>

        {/* Video player */}
        {id && (
          <VideoPlayer
            videoId={id}
            startTime={seekTime}
            controls={playerControls}
          />
        )}

        {/* Chunk timeline — only shown once chunks and duration are available */}
        {chunks.length > 0 && (
          <div style={{
            marginTop: '12px',
            background: 'rgba(255,255,255,0.6)',
            borderRadius: '10px',
            padding: '12px 16px',
            border: '1px solid rgba(226,179,64,0.12)',
          }}>
            <ChunkTimeline
              chunks={chunks}
              currentTime={playerControls.currentTime}
              duration={playerControls.duration}
              onSeek={handleSeek}
            />
          </div>
        )}
      </div>

      {/* Right panel — 30% */}
      <div style={{ flex: '0 0 calc(30% - 12px)', minWidth: 0, position: 'sticky', top: '80px' }}>
        {/* Search bar */}
        <div style={{ marginBottom: '16px' }}>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search in this video..."
            isLoading={searchLoading}
          />
        </div>

        {/* Tab toggle */}
        <div
          style={{
            display: 'flex',
            marginBottom: '14px',
            background: 'rgba(26,26,46,0.05)',
            borderRadius: '10px',
            padding: '3px',
          }}
        >
          {(['search', 'transcript'] as RightPanelTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setRightTab(tab)}
              style={{
                flex: 1,
                padding: '7px 12px',
                borderRadius: '8px',
                border: 'none',
                background: rightTab === tab ? '#fff' : 'transparent',
                color: rightTab === tab ? '#1a1a2e' : 'rgba(26,26,46,0.5)',
                fontSize: '13px',
                fontWeight: rightTab === tab ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
                boxShadow: rightTab === tab ? '0 1px 4px rgba(226,179,64,0.12)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {tab === 'search'
                ? `Search Results${searchResults.length > 0 ? ` (${searchResults.length})` : ''}`
                : 'Transcript'}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div
          style={{
            background: '#fff',
            borderRadius: '10px',
            border: '1px solid rgba(226,179,64,0.15)',
            boxShadow: '0 4px 24px rgba(226,179,64,0.08)',
            overflow: 'hidden',
            maxHeight: 'calc(100vh - 260px)',
            overflowY: 'auto',
          }}
        >
          {rightTab === 'search' ? (
            <div style={{ padding: '12px' }}>
              {searchLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-shimmer" style={{ height: '80px', borderRadius: '8px' }} />
                  ))}
                </div>
              )}
              {!searchLoading && searchResults.length === 0 && (
                <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                  <svg width="44" height="44" viewBox="0 0 48 48" fill="none" style={{ marginBottom: '12px', opacity: 0.2 }}>
                    <circle cx="22" cy="22" r="14" stroke="#1a1a2e" strokeWidth="2.5" />
                    <path d="M32 32l8 8" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <p style={{ color: 'rgba(26,26,46,0.4)', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                    Search to find specific moments in this video
                  </p>
                </div>
              )}
              {!searchLoading && searchResults.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {searchResults.map((result, idx) => (
                    <SearchResult
                      key={result.chunk_id}
                      result={result}
                      index={idx}
                      onSeek={handleSeek}
                      isActive={
                        playerControls.currentTime >= result.start_time &&
                        playerControls.currentTime < result.end_time
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '8px' }}>
              <TranscriptPanel
                chunks={chunks}
                currentTime={playerControls.currentTime}
                onSeek={handleSeek}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

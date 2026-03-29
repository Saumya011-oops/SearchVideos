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
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '48px 24px',
          display: 'flex',
          gap: '24px',
        }}
      >
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
        <p style={{ color: '#d4603a', fontSize: '16px' }}>
          {videoError || 'Video not found'}
        </p>
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
        {/* Title */}
        <h1
          className="heading"
          style={{
            fontSize: 'clamp(22px, 3vw, 30px)',
            color: '#1a1a2e',
            margin: '0 0 20px',
            lineHeight: 1.2,
          }}
        >
          {video.title}
        </h1>

        {/* Video player */}
        {id && (
          <VideoPlayer
            videoId={id}
            startTime={seekTime}
            controls={playerControls}
          />
        )}

        {/* Chunk timeline */}
        {chunks.length > 0 && (
          <div style={{ marginTop: '14px' }}>
            <p
              style={{
                margin: '0 0 8px',
                fontSize: '12px',
                color: 'rgba(26,26,46,0.45)',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Timeline
            </p>
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
            borderRadius: '8px',
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
                borderRadius: '6px',
                border: 'none',
                background: rightTab === tab ? '#fff' : 'transparent',
                color: rightTab === tab ? '#1a1a2e' : 'rgba(26,26,46,0.5)',
                fontSize: '13px',
                fontWeight: rightTab === tab ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
                boxShadow: rightTab === tab ? '0 1px 4px rgba(226,179,64,0.12)' : 'none',
                transition: 'all 0.15s ease',
                textTransform: 'capitalize',
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
                <div
                  style={{
                    padding: '32px 16px',
                    textAlign: 'center',
                    color: 'rgba(26,26,46,0.4)',
                    fontSize: '13px',
                  }}
                >
                  Search to find specific moments in this video
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

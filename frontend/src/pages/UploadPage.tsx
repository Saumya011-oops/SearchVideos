import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import UploadZone from '../components/UploadZone'
import YouTubeInput from '../components/YouTubeInput'
import ProcessingStatus from '../components/ProcessingStatus'
import { uploadVideo, ingestYouTube, getVideo } from '../services/api'
import { Video } from '../types'

export default function UploadPage() {
  const [uploadedVideo, setUploadedVideo] = useState<Video | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [ytVideo, setYtVideo] = useState<Video | null>(null)
  const [ytLoading, setYtLoading] = useState(false)
  const [ytError, setYtError] = useState<string | null>(null)

  // Poll upload video status
  useEffect(() => {
    if (!uploadedVideo || uploadedVideo.status === 'ready' || uploadedVideo.status === 'failed') return
    const interval = setInterval(async () => {
      try {
        const updated = await getVideo(uploadedVideo.id)
        setUploadedVideo(updated)
      } catch {/* ignore */}
    }, 3000)
    return () => clearInterval(interval)
  }, [uploadedVideo])

  // Poll YouTube video status
  useEffect(() => {
    if (!ytVideo || ytVideo.status === 'ready' || ytVideo.status === 'failed') return
    const interval = setInterval(async () => {
      try {
        const updated = await getVideo(ytVideo.id)
        setYtVideo(updated)
      } catch {/* ignore */}
    }, 3000)
    return () => clearInterval(interval)
  }, [ytVideo])

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    setUploadError(null)
    setUploadProgress(0)
    try {
      const video = await uploadVideo(file, (pct) => setUploadProgress(pct))
      setUploadedVideo(video)
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleYouTube = async (url: string) => {
    setYtLoading(true)
    setYtError(null)
    try {
      const video = await ingestYouTube(url)
      setYtVideo(video)
    } catch (e: unknown) {
      setYtError(e instanceof Error ? e.message : 'Failed to add YouTube video')
    } finally {
      setYtLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px 64px' }}>
      <h1
        className="heading"
        style={{ fontSize: '36px', color: '#1a1a2e', margin: '0 0 8px' }}
      >
        Add a Video
      </h1>
      <p style={{ color: 'rgba(26,26,46,0.55)', fontSize: '15px', margin: '0 0 40px' }}>
        Upload a local file or paste a YouTube URL to get started.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
        }}
      >
        {/* Left: Upload file */}
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 4px 24px rgba(226,179,64,0.10)',
            border: '1px solid rgba(226,179,64,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(226,179,64,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2v10M4 7l5-5 5 5" stroke="#e2b340" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 14h14" stroke="#e2b340" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h2
              className="heading"
              style={{ margin: 0, fontSize: '20px', color: '#1a1a2e' }}
            >
              Upload a Video File
            </h2>
          </div>

          <UploadZone
            onUpload={handleFileUpload}
            uploading={uploading}
            progress={uploadProgress}
          />

          {uploadError && (
            <div
              style={{
                marginTop: '14px',
                padding: '12px 14px',
                background: 'rgba(212,96,58,0.08)',
                border: '1px solid rgba(212,96,58,0.25)',
                borderRadius: '8px',
                color: '#d4603a',
                fontSize: '13px',
              }}
            >
              {uploadError}
            </div>
          )}

          {uploadedVideo && !uploadError && (
            <div style={{ marginTop: '20px' }}>
              <ProcessingStatus video={uploadedVideo} />
              {uploadedVideo.status === 'ready' && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '14px',
                    background: 'rgba(45,106,106,0.08)',
                    border: '1px solid rgba(45,106,106,0.25)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <p style={{ margin: '0 0 3px', fontWeight: 500, color: '#2d6a6a', fontSize: '14px' }}>
                      Video ready!
                    </p>
                    <p style={{ margin: 0, color: 'rgba(26,26,46,0.5)', fontSize: '13px' }}>
                      {uploadedVideo.title}
                    </p>
                  </div>
                  <Link
                    to={`/video/${uploadedVideo.id}`}
                    style={{
                      background: '#2d6a6a',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    View Video
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: YouTube */}
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 4px 24px rgba(226,179,64,0.10)',
            border: '1px solid rgba(226,179,64,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(212,96,58,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
                <path
                  d="M17.59 2A2.26 2.26 0 0 0 15.995.449C14.602 0 9 0 9 0S3.398 0 2.005.449A2.26 2.26 0 0 0 .41 2C0 3.38 0 6.25 0 6.25s0 2.87.41 4.25A2.26 2.26 0 0 0 2.005 12.1C3.398 12.55 9 12.55 9 12.55s5.602 0 6.995-.449A2.26 2.26 0 0 0 17.59 10.5C18 9.12 18 6.25 18 6.25s0-2.87-.41-4.25z"
                  fill="#d4603a"
                />
                <path d="M7.2 8.92V3.58l4.8 2.67-4.8 2.67z" fill="white" />
              </svg>
            </div>
            <h2
              className="heading"
              style={{ margin: 0, fontSize: '20px', color: '#1a1a2e' }}
            >
              Add a YouTube Video
            </h2>
          </div>

          <YouTubeInput onSubmit={handleYouTube} loading={ytLoading} />

          {ytError && (
            <div
              style={{
                marginTop: '14px',
                padding: '12px 14px',
                background: 'rgba(212,96,58,0.08)',
                border: '1px solid rgba(212,96,58,0.25)',
                borderRadius: '8px',
                color: '#d4603a',
                fontSize: '13px',
              }}
            >
              {ytError}
            </div>
          )}

          {ytVideo && !ytError && (
            <div style={{ marginTop: '20px' }}>
              <ProcessingStatus video={ytVideo} />
              {ytVideo.status === 'ready' && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '14px',
                    background: 'rgba(45,106,106,0.08)',
                    border: '1px solid rgba(45,106,106,0.25)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <p style={{ margin: '0 0 3px', fontWeight: 500, color: '#2d6a6a', fontSize: '14px' }}>
                      Video ready!
                    </p>
                    <p style={{ margin: 0, color: 'rgba(26,26,46,0.5)', fontSize: '13px' }}>
                      {ytVideo.title}
                    </p>
                  </div>
                  <Link
                    to={`/video/${ytVideo.id}`}
                    style={{
                      background: '#2d6a6a',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    View Video
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      {/* Film strip decoration */}
      <div style={{ marginBottom: '24px', opacity: 0.3 }}>
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="12" width="112" height="56" rx="4" stroke="#1a1a2e" strokeWidth="2.5" />
          <rect x="4" y="12" width="14" height="14" fill="#1a1a2e" opacity="0.5" />
          <rect x="4" y="32" width="14" height="14" fill="#1a1a2e" opacity="0.5" />
          <rect x="4" y="52" width="14" height="14" fill="#1a1a2e" opacity="0.5" />
          <rect x="102" y="12" width="14" height="14" fill="#1a1a2e" opacity="0.5" />
          <rect x="102" y="32" width="14" height="14" fill="#1a1a2e" opacity="0.5" />
          <rect x="102" y="52" width="14" height="14" fill="#1a1a2e" opacity="0.5" />
          <line x1="30" y1="12" x2="30" y2="68" stroke="#1a1a2e" strokeWidth="1.5" opacity="0.3" />
          <line x1="50" y1="12" x2="50" y2="68" stroke="#1a1a2e" strokeWidth="1.5" opacity="0.3" />
          <line x1="70" y1="12" x2="70" y2="68" stroke="#1a1a2e" strokeWidth="1.5" opacity="0.3" />
          <line x1="90" y1="12" x2="90" y2="68" stroke="#1a1a2e" strokeWidth="1.5" opacity="0.3" />
          <path d="M44 32l20 8-20 8V32z" fill="#1a1a2e" opacity="0.4" />
        </svg>
      </div>

      {/* 404 */}
      <h1
        className="heading"
        style={{
          fontSize: 'clamp(80px, 15vw, 120px)',
          color: '#e2b340',
          margin: '0 0 8px',
          lineHeight: 1,
          letterSpacing: '-2px',
        }}
      >
        404
      </h1>

      {/* Subtitle */}
      <h2
        className="heading"
        style={{
          fontSize: 'clamp(20px, 3vw, 26px)',
          color: '#1a1a2e',
          margin: '0 0 12px',
          fontWeight: 400,
        }}
      >
        This frame doesn&apos;t exist in our timeline
      </h2>

      {/* Description */}
      <p
        style={{
          color: 'rgba(26,26,46,0.55)',
          fontSize: '15px',
          maxWidth: '420px',
          lineHeight: 1.65,
          margin: '0 0 32px',
        }}
      >
        The timestamp you&apos;re looking for isn&apos;t in our index. Try searching instead.
      </p>

      {/* CTA */}
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#e2b340',
          color: '#1a1a2e',
          textDecoration: 'none',
          padding: '12px 28px',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 16px rgba(226,179,64,0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#c49a2a'
          e.currentTarget.style.transform = 'scale(1.02)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#e2b340'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Home
      </Link>
    </div>
  )
}

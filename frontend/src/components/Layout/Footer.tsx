import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer
      style={{
        background: '#1a1a2e',
        padding: '28px 24px',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <p
          style={{
            color: 'rgba(245, 240, 232, 0.6)',
            fontSize: '13px',
            margin: 0,
            textAlign: 'center',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          VideoSearch Engine &bull; Built with Whisper, BLIP &amp; ChromaDB
        </p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link
            to="/"
            style={{
              color: 'rgba(226, 179, 64, 0.7)',
              textDecoration: 'none',
              fontSize: '13px',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#e2b340' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(226, 179, 64, 0.7)' }}
          >
            Home
          </Link>
          <Link
            to="/upload"
            style={{
              color: 'rgba(226, 179, 64, 0.7)',
              textDecoration: 'none',
              fontSize: '13px',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#e2b340' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(226, 179, 64, 0.7)' }}
          >
            Upload
          </Link>
        </div>
      </div>
    </footer>
  )
}

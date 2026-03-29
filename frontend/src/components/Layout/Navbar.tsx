import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav
      style={{
        background: '#1a1a2e',
        borderBottom: '2px solid rgba(226, 179, 64, 0.4)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '64px',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          {/* Film strip icon */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="2" y="6" width="24" height="16" rx="2" stroke="#e2b340" strokeWidth="1.8" />
            <rect x="2" y="6" width="4" height="4" rx="0.5" fill="#e2b340" opacity="0.7" />
            <rect x="2" y="12" width="4" height="4" rx="0.5" fill="#e2b340" opacity="0.7" />
            <rect x="2" y="18" width="4" height="4" rx="0.5" fill="#e2b340" opacity="0.7" />
            <rect x="22" y="6" width="4" height="4" rx="0.5" fill="#e2b340" opacity="0.7" />
            <rect x="22" y="12" width="4" height="4" rx="0.5" fill="#e2b340" opacity="0.7" />
            <rect x="22" y="18" width="4" height="4" rx="0.5" fill="#e2b340" opacity="0.7" />
            <path
              d="M11 11l6 3-6 3V11z"
              fill="#e2b340"
            />
          </svg>
          <span
            className="heading"
            style={{
              color: '#e2b340',
              fontSize: '22px',
              fontWeight: 400,
              letterSpacing: '-0.3px',
            }}
          >
            VideoSearch
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            to="/"
            style={{
              color: isActive('/') ? '#e2b340' : 'rgba(245, 240, 232, 0.75)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              padding: '6px 16px',
              borderRadius: '20px',
              border: isActive('/')
                ? '1px solid rgba(226, 179, 64, 0.5)'
                : '1px solid transparent',
              background: isActive('/') ? 'rgba(226, 179, 64, 0.1)' : 'transparent',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive('/')) {
                e.currentTarget.style.color = '#e2b340'
                e.currentTarget.style.background = 'rgba(226, 179, 64, 0.08)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/')) {
                e.currentTarget.style.color = 'rgba(245, 240, 232, 0.75)'
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            Home
          </Link>
          <Link
            to="/upload"
            style={{
              color: isActive('/upload') ? '#1a1a2e' : '#1a1a2e',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              padding: '6px 18px',
              borderRadius: '20px',
              background: isActive('/upload') ? '#e2b340' : 'rgba(226, 179, 64, 0.85)',
              transition: 'all 0.2s ease',
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2b340'
              e.currentTarget.style.transform = 'scale(1.03)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isActive('/upload') ? '#e2b340' : 'rgba(226, 179, 64, 0.85)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            Upload
          </Link>
        </div>
      </div>
    </nav>
  )
}

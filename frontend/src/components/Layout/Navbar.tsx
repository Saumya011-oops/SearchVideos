import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={{
      background: '#1a1a2e', borderBottom: '2px solid rgba(226, 179, 64, 0.4)',
      position: 'sticky', top: 0, zIndex: 50, height: '64px',
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="6" width="24" height="16" rx="2" stroke="#e2b340" strokeWidth="1.8" />
            <rect x="2" y="6" width="4" height="4" rx="0.5" fill="#e2b340" opacity="0.7" />
            <rect x="2" y="12" width="4" height="4" rx="0.5" fill="#e2b340" opacity="0.7" />
            <rect x="2" y="18" width="4" height="4" rx="0.5" fill="#e2b340" opacity="0.7" />
            <rect x="22" y="6" width="4" height="4" rx="0.5" fill="#e2b340" opacity="0.7" />
            <rect x="22" y="12" width="4" height="4" rx="0.5" fill="#e2b340" opacity="0.7" />
            <rect x="22" y="18" width="4" height="4" rx="0.5" fill="#e2b340" opacity="0.7" />
            <path d="M11 11l6 3-6 3V11z" fill="#e2b340" />
          </svg>
          <span className="heading" style={{ color: '#e2b340', fontSize: '22px', fontWeight: 400, letterSpacing: '-0.3px' }}>
            VideoSearch
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user ? (
            <>
              <Link to="/" style={navLink(isActive('/'))}>Home</Link>
              <Link to="/upload" style={uploadLink(isActive('/upload'))}>Upload</Link>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                marginLeft: '8px', paddingLeft: '12px',
                borderLeft: '1px solid rgba(245,240,232,0.15)',
              }}>
                <span style={{ color: 'rgba(245,240,232,0.7)', fontSize: '13px', fontWeight: 500 }}>
                  {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(212,96,58,0.15)', color: '#d4603a',
                    border: '1px solid rgba(212,96,58,0.3)', borderRadius: '20px',
                    fontSize: '12px', fontWeight: 500, padding: '5px 14px', cursor: 'pointer',
                    fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,96,58,0.3)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(212,96,58,0.15)' }}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={navLink(isActive('/login'))}>Sign In</Link>
              <Link to="/register" style={uploadLink(isActive('/register'))}>Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function navLink(active: boolean): React.CSSProperties {
  return {
    color: active ? '#e2b340' : 'rgba(245, 240, 232, 0.75)',
    textDecoration: 'none', fontSize: '14px', fontWeight: 500,
    padding: '6px 16px', borderRadius: '20px',
    border: active ? '1px solid rgba(226, 179, 64, 0.5)' : '1px solid transparent',
    background: active ? 'rgba(226, 179, 64, 0.1)' : 'transparent',
    transition: 'all 0.2s ease',
  }
}

function uploadLink(active: boolean): React.CSSProperties {
  return {
    color: '#1a1a2e', textDecoration: 'none', fontSize: '14px', fontWeight: 500,
    padding: '6px 18px', borderRadius: '20px',
    background: active ? '#e2b340' : 'rgba(226, 179, 64, 0.85)',
    transition: 'all 0.2s ease', border: '1px solid transparent',
  }
}

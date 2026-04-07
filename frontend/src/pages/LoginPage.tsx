import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return
    setLoading(true)
    setError('')
    try {
      const res = await login(username, password)
      setAuth(res.token, res.user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 130px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '48px 40px', width: '100%', maxWidth: '420px',
        boxShadow: '0 8px 32px rgba(226, 179, 64, 0.12)', border: '1px solid rgba(226,179,64,0.15)',
      }}>
        <h1 className="heading" style={{ fontSize: '32px', color: '#1a1a2e', margin: '0 0 8px', textAlign: 'center' }}>
          Welcome Back
        </h1>
        <p style={{ color: 'rgba(26,26,46,0.5)', textAlign: 'center', margin: '0 0 32px', fontSize: '15px' }}>
          Sign in to access your video library
        </p>

        {error && (
          <div style={{
            background: 'rgba(212,96,58,0.08)', border: '1px solid rgba(212,96,58,0.25)',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '20px',
            color: '#d4603a', fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Username</label>
          <input
            type="text" value={username} onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username" style={inputStyle} autoFocus
          />

          <label style={{ ...labelStyle, marginTop: '16px' }}>Password</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password" style={inputStyle}
          />

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', marginTop: '24px', background: '#e2b340',
            color: '#1a1a2e', border: 'none', borderRadius: '8px', fontSize: '15px',
            fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Outfit, sans-serif', opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s ease',
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'rgba(26,26,46,0.5)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2d6a6a', fontWeight: 600, textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgba(26,26,46,0.6)', marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: '8px', fontSize: '14px',
  border: '1.5px solid rgba(226,179,64,0.25)', background: '#faf8f3', outline: 'none',
  fontFamily: 'Outfit, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.2s ease',
}

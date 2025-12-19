import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin } from '../services/auth'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('student')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await apiLogin(email, password)
      // data is expected to include { token, user }
      onLogin(data)
      // redirect based on role returned by server
      const role = data?.user?.role || tab
      if (role === 'instructor') navigate('/instructor')
      else navigate('/student')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '20px'
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 20% 20%, rgba(102,126,234,0.15), transparent 28%), radial-gradient(circle at 80% 10%, rgba(118,75,162,0.12), transparent 30%), radial-gradient(circle at 50% 80%, rgba(102,126,234,0.1), transparent 26%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '18px',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '440px',
        padding: '44px 38px',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 800,
            marginBottom: 12
          }}>
            SGT
          </div>
          <h1 style={{
            fontSize: '30px',
            fontWeight: '700',
            color: 'var(--text)',
            margin: '0 0 6px 0'
          }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '15px' }}>Login to Your Account</p>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '26px',
          padding: '6px',
          background: 'var(--bg)',
          borderRadius: '12px',
          border: '1px solid var(--border)'
        }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: tab === 'student' ? 'var(--surface)' : 'transparent',
              color: tab === 'student' ? '#667eea' : 'var(--text-muted)',
              boxShadow: tab === 'student' ? '0 4px 14px rgba(0,0,0,0.08)' : 'none'
            }}
            onClick={() => setTab('student')}
          >
            Student
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: tab === 'instructor' ? 'var(--surface)' : 'transparent',
              color: tab === 'instructor' ? '#667eea' : 'var(--text-muted)',
              boxShadow: tab === 'instructor' ? '0 4px 14px rgba(0,0,0,0.08)' : 'none'
            }}
            onClick={() => setTab('instructor')}
          >
            Instructor
          </button>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text)'
            }}>Email Address</label>
            <input
              type="email"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                border: '2px solid var(--border)',
                borderRadius: '10px',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                fontFamily: 'inherit',
                background: 'var(--bg)',
                color: 'var(--text)'
              }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={e => {
                e.target.style.borderColor = '#667eea'
                e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.25)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)'
                e.target.style.boxShadow = 'none'
              }}
              placeholder="Enter your email"
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text)'
            }}>Password</label>
            <input
              type="password"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                border: '2px solid var(--border)',
                borderRadius: '10px',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                fontFamily: 'inherit',
                background: 'var(--bg)',
                color: 'var(--text)'
              }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={e => {
                e.target.style.borderColor = '#667eea'
                e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.25)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)'
                e.target.style.boxShadow = 'none'
              }}
              placeholder="Enter your password"
            />
          </div>
          {error && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '20px',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              color: '#c33',
              fontSize: '14px'
            }}>{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>

          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Forgot Password?
            </button>
          </div>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Don't have an account? </span>
          <button
            type="button"
            onClick={() => navigate('/register')}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '14px'
            }}
          >
            Register Now
          </button>
        </div>
      </div>
    </div>
  )
}

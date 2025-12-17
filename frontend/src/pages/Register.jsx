import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register as apiRegister } from '../services/auth'

export default function Register({ onRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await apiRegister(email, password, role)
      // data: { token, user }
      if (onRegister) onRegister(data)
      // redirect based on role
      const r = data?.user?.role || role
      if (r === 'instructor') navigate('/instructor')
      else navigate('/student')
    } catch (err) {
      setError(err.message || 'Registration failed')
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '440px',
        padding: '48px 40px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1a202c',
            margin: '0 0 8px 0'
          }}>Create Account</h1>
          <p style={{ color: '#718096', margin: 0, fontSize: '15px' }}>Join Student Grade Tracker today</p>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2d3748'
            }}>Email Address</label>
            <input
              type="email"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'inherit'
              }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              placeholder="you@example.com"
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2d3748'
            }}>Password</label>
            <input
              type="password"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'inherit'
              }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              placeholder="At least 6 characters"
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2d3748'
            }}>Account Type</label>
            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '6px',
              background: '#f7fafc',
              borderRadius: '12px'
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
                  background: role === 'student' ? 'white' : 'transparent',
                  color: role === 'student' ? '#667eea' : '#718096',
                  boxShadow: role === 'student' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                }}
                onClick={() => setRole('student')}
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
                  background: role === 'instructor' ? 'white' : 'transparent',
                  color: role === 'instructor' ? '#667eea' : '#718096',
                  boxShadow: role === 'instructor' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                }}
                onClick={() => setRole('instructor')}
              >
                Instructor
              </button>
            </div>
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{
          marginTop: '32px',
          textAlign: 'center',
          paddingTop: '24px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <p style={{ color: '#718096', fontSize: '14px', margin: '0 0 16px 0' }}>
            Already have an account?
          </p>
          <button
            type="button"
            style={{
              padding: '12px 32px',
              fontSize: '15px',
              fontWeight: '600',
              color: '#667eea',
              background: 'white',
              border: '2px solid #667eea',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => navigate('/login')}
            onMouseEnter={e => {
              e.target.style.background = '#667eea'
              e.target.style.color = 'white'
            }}
            onMouseLeave={e => {
              e.target.style.background = 'white'
              e.target.style.color = '#667eea'
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}

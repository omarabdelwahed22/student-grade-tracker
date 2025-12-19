import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register as apiRegister } from '../services/auth'

export default function Register({ onRegister }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [studentId, setStudentId] = useState('')
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
      if (!name.trim()) {
        setError('Full name is required')
        setLoading(false)
        return
      }
      const trimmedStudentId = studentId.trim()
      if (role === 'student' && !trimmedStudentId) {
        setError('Student ID is required for student accounts')
        setLoading(false)
        return
      }
      if (role === 'student' && !/^\d{9}$/.test(trimmedStudentId)) {
        setError('Student ID must be exactly 9 digits')
        setLoading(false)
        return
      }
      const data = await apiRegister(email, password, role, name, trimmedStudentId)
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
          }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '15px' }}>Join Student Grade Tracker today</p>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Full Name</label>
            <input
              type="text"
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
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={e => {
                e.target.style.borderColor = '#667eea'
                e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.25)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)'
                e.target.style.boxShadow = 'none'
              }}
              placeholder="Mohamed Hassan"
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Email Address</label>
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
              placeholder="you@example.com"
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
              minLength={6}
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
              placeholder="At least 6 characters"
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text)'
            }}>Account Type</label>
            <div style={{
              display: 'flex',
              gap: '10px',
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
                  background: role === 'student' ? 'var(--surface)' : 'transparent',
                  color: role === 'student' ? '#667eea' : 'var(--text-muted)',
                  boxShadow: role === 'student' ? '0 4px 14px rgba(0,0,0,0.08)' : 'none'
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
                  background: role === 'instructor' ? 'var(--surface)' : 'transparent',
                  color: role === 'instructor' ? '#667eea' : 'var(--text-muted)',
                  boxShadow: role === 'instructor' ? '0 4px 14px rgba(0,0,0,0.08)' : 'none'
                }}
                onClick={() => setRole('instructor')}
              >
                Instructor
              </button>
            </div>
          </div>
          {role === 'student' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text)'
              }}>Student ID (9 digits)</label>
              <input
                type="text"
                required
                pattern="\d{9}"
                maxLength={9}
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
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                onFocus={e => {
                  e.target.style.borderColor = '#667eea'
                  e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.25)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'var(--border)'
                  e.target.style.boxShadow = 'none'
                }}
                placeholder="e.g., 123456789"
              />
              <div style={{ marginTop: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Students must provide their 9-digit institutional ID for enrollment and grading.
              </div>
            </div>
          )}
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
          borderTop: '1px solid var(--border)'
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 16px 0' }}>
            Already have an account?
          </p>
          <button
            type="button"
            style={{
              padding: '12px 32px',
              fontSize: '15px',
              fontWeight: '600',
              color: '#667eea',
              background: 'var(--surface)',
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
              e.target.style.background = 'var(--surface)'
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

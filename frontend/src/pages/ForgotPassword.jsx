import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { forgotPassword } from '../services/auth'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [tempPassword, setTempPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setSent(false)
    setTempPassword('')
    setLoading(true)
    try {
      const res = await forgotPassword(email)
      setTempPassword(res.tempPassword)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Failed to send reset link')
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
        padding: '40px 36px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#1a202c' }}>Reset Password</h1>
          <p style={{ margin: '6px 0 0 0', color: '#718096', fontSize: 14 }}>
            Enter your email to receive a reset link
          </p>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#2d3748' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 15,
                border: '2px solid #e2e8f0',
                borderRadius: 10,
                outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px 14px',
              marginBottom: 12,
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: 10,
              color: '#c33'
            }}>
              {error}
            </div>
          )}

          {sent && (
            <div style={{
              padding: '12px 14px',
              marginBottom: 12,
              background: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: 10,
              color: '#065f46'
            }}>
              Temporary password: <strong>{tempPassword}</strong>
              <div style={{ fontSize: 13, marginTop: 6 }}>Use it to log in, then change your password from Settings.</div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: 16,
              fontWeight: 700,
              borderRadius: 10,
              border: 'none',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

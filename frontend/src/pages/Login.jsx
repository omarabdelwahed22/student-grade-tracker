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
      onLogin(data)
      const role = data?.user?.role || tab
      if (role === 'instructor') navigate('/instructor')
      else navigate('/student')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    },
    card: {
      background: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      padding: '48px 40px',
      width: '100%',
      maxWidth: '440px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1a202c',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '14px',
      color: '#718096',
      margin: 0
    },
    tabContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      background: '#f7fafc',
      padding: '4px',
      borderRadius: '10px'
    },
    tab: {
      flex: 1,
      padding: '10px',
      border: 'none',
      background: 'transparent',
      color: '#4a5568',
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    tabActive: {
      background: '#ffffff',
      color: '#667eea',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#2d3748',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '15px',
      transition: 'all 0.2s',
      outline: 'none'
    },
    inputFocus: {
      borderColor: '#667eea'
    },
    error: {
      background: '#fed7d7',
      color: '#c53030',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '16px',
      border: '1px solid #fc8181'
    },
    button: {
      width: '100%',
      padding: '14px',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginBottom: '12px'
    },
    buttonPrimary: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(102,126,234,0.4)'
    },
    buttonSecondary: {
      background: '#f7fafc',
      color: '#4a5568',
      border: '2px solid #e2e8f0'
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '24px 0',
      color: '#a0aec0',
      fontSize: '14px'
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      background: '#e2e8f0'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your account to continue</p>
        </div>

        <div style={styles.tabContainer}>
          <button
            type="button"
            style={{...styles.tab, ...(tab === 'student' ? styles.tabActive : {})}}
            onClick={() => setTab('student')}
          >
            Student
          </button>
          <button
            type="button"
            style={{...styles.tab, ...(tab === 'instructor' ? styles.tabActive : {})}}
            onClick={() => setTab('instructor')}
          >
            Instructor
          </button>
        </div>

        <form onSubmit={submit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              style={styles.input}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              style={styles.input}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            style={{...styles.button, ...styles.buttonPrimary, ...(loading ? styles.buttonDisabled : {})}}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={{padding: '0 16px'}}>or</span>
            <div style={styles.dividerLine}></div>
          </div>

          <button
            type="button"
            style={{...styles.button, ...styles.buttonSecondary}}
            onClick={() => navigate('/register')}
          >
            Create New Account
          </button>
        </form>
      </div>
    </div>
  )
}

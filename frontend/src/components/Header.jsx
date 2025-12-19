import React from 'react'
import ThemeToggle from './ThemeToggle'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
    window.location.reload()
  }
  
  const styles = {
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '16px 32px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderBottom: 'none',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      margin: 0,
      fontSize: '20px',
      fontWeight: '700',
      color: '#ffffff',
      letterSpacing: '-0.5px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'rgba(255, 255, 255, 0.15)',
      padding: '8px 16px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#ffffff'
    },
    logoutBtn: {
      background: '#ffffff',
      color: '#667eea',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }
  }

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.2)',
          fontWeight: 800,
          fontSize: 14
        }}>
          SGT
        </div>
        Student Grade Tracker
      </h1>
      <div style={styles.rightSection}>
        <ThemeToggle />
        {user.name && (
          <>
            <div style={styles.userSection}>
              <span style={styles.userName}>{user.name}</span>
            </div>
            <button 
              style={styles.logoutBtn}
              onClick={handleLogout}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  )
}

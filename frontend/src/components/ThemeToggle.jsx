import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '8px 12px',
        background: 'rgba(255, 255, 255, 0.2)',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '18px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s',
        backdropFilter: 'blur(10px)'
      }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}

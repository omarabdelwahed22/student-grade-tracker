import React from 'react'

export default function Header() {
  const styles = {
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '16px 24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderBottom: 'none'
    },
    title: {
      margin: 0,
      fontSize: '20px',
      fontWeight: '700',
      color: '#ffffff',
      letterSpacing: '-0.5px'
    }
  }

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>Student Grade Tracker</h1>
    </header>
  )
}

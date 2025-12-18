import React, { useState, useEffect } from 'react'
import { updateProfile, changePassword } from '../services/users'

export default function Settings() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'))
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
    studentId: user.studentId || ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const data = await updateProfile(profileData)
      // Update local storage
      const updatedUser = { ...user, ...data.user }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setMessage('Profile updated successfully!')
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      setMessage('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Settings</h1>
        <p style={{ margin: '8px 0 0 0', color: '#718096' }}>Manage your account settings and preferences</p>
      </div>

      {message && (
        <div style={{
          padding: 14,
          marginBottom: 20,
          background: '#d1fae5',
          border: '1px solid #6ee7b7',
          color: '#065f46',
          borderRadius: 10,
          fontWeight: 500
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          padding: 14,
          marginBottom: 20,
          background: '#fee',
          border: '1px solid #fcc',
          color: '#c33',
          borderRadius: 10,
          fontWeight: 500
        }}>
          {error}
        </div>
      )}

      {/* Profile Section */}
      <div style={{
        background: 'white',
        borderRadius: 14,
        padding: 32,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        marginBottom: 24
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 600 }}>Profile Information</h2>
        <form onSubmit={handleProfileUpdate}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#2d3748' }}>
              Full Name
            </label>
            <input
              required
              type="text"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: 10,
                fontSize: 15
              }}
              value={profileData.name}
              onChange={e => setProfileData({ ...profileData, name: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#2d3748' }}>
              Email Address
            </label>
            <input
              required
              type="email"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: 10,
                fontSize: 15
              }}
              value={profileData.email}
              onChange={e => setProfileData({ ...profileData, email: e.target.value })}
            />
          </div>

          {user.role === 'student' && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#2d3748' }}>
                Student ID
              </label>
              <input
                type="text"
                disabled
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 15,
                  background: '#f7fafc',
                  cursor: 'not-allowed'
                }}
                value={profileData.studentId}
              />
              <p style={{ margin: '6px 0 0 0', fontSize: 13, color: '#718096' }}>
                Student ID cannot be changed
              </p>
            </div>
          )}

          <div style={{
            padding: 16,
            background: '#f7fafc',
            borderRadius: 10,
            marginBottom: 20
          }}>
            <p style={{ margin: 0, fontSize: 14, color: '#4a5568' }}>
              <strong>Role:</strong> {user.role === 'student' ? 'Student' : 'Instructor'}
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: 14, color: '#4a5568' }}>
              <strong>User ID:</strong> {user.id}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 32px',
              fontSize: 16,
              fontWeight: 600,
              background: loading ? '#cbd5e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div style={{
        background: 'white',
        borderRadius: 14,
        padding: 32,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 600 }}>Change Password</h2>
        <form onSubmit={handlePasswordChange}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#2d3748' }}>
              Current Password
            </label>
            <input
              required
              type="password"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: 10,
                fontSize: 15
              }}
              value={passwordData.currentPassword}
              onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#2d3748' }}>
              New Password
            </label>
            <input
              required
              type="password"
              minLength={6}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: 10,
                fontSize: 15
              }}
              value={passwordData.newPassword}
              onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#2d3748' }}>
              Confirm New Password
            </label>
            <input
              required
              type="password"
              minLength={6}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: 10,
                fontSize: 15
              }}
              value={passwordData.confirmPassword}
              onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 32px',
              fontSize: 16,
              fontWeight: 600,
              background: loading ? '#cbd5e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } from '../services/notifications'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // 'all' or 'unread'

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await getNotifications(filter === 'unread')
      setNotifications(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      await fetchNotifications()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      await fetchNotifications()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id)
      await fetchNotifications()
    } catch (err) {
      setError(err.message)
    }
  }

  const styles = {
    container: {
      padding: '24px',
      maxWidth: '900px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: 'var(--text)',
      margin: 0
    },
    actions: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    filterBtn: (active) => ({
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '600',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      background: active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'var(--bg)',
      color: active ? 'white' : 'var(--text)',
      border: active ? 'none' : '1px solid var(--border)',
      transition: 'all 0.2s'
    }),
    markAllBtn: {
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '600',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      cursor: 'pointer',
      background: 'var(--surface)',
      color: 'var(--text)',
      transition: 'all 0.2s'
    },
    notificationCard: (read) => ({
      background: read ? 'var(--surface)' : 'var(--bg)',
      border: '1px solid var(--border)',
      borderLeft: read ? '1px solid var(--border)' : '4px solid #667eea',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '12px',
      boxShadow: 'var(--shadow-sm)',
      transition: 'all 0.2s'
    }),
    notifHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '8px'
    },
    notifTitle: {
      fontSize: '16px',
      fontWeight: '700',
      color: 'var(--text)',
      margin: 0
    },
    notifMeta: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    badge: (type) => {
      const colors = {
        grade: { bg: '#ddd6fe', color: '#5b21b6' },
        assignment: { bg: '#fef3c7', color: '#92400e' },
        course: { bg: '#dbeafe', color: '#1e40af' },
        system: { bg: '#e5e7eb', color: '#374151' }
      }
      const style = colors[type] || colors.system
      return {
        padding: '3px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        background: style.bg,
        color: style.color
      }
    },
    notifMessage: {
      fontSize: '14px',
      color: 'var(--text-muted)',
      margin: '0 0 12px 0',
      lineHeight: '1.5'
    },
    notifFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    notifDate: {
      fontSize: '13px',
      color: 'var(--text-muted)'
    },
    notifActions: {
      display: 'flex',
      gap: '8px'
    },
    actionBtn: {
      padding: '6px 12px',
      fontSize: '13px',
      fontWeight: '600',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      cursor: 'pointer',
      background: 'var(--surface)',
      color: 'var(--text)',
      transition: 'all 0.2s'
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px 24px',
      color: 'var(--text-muted)'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  if (loading) return <div style={{ padding: 20 }}>Loading notifications...</div>
  if (error) return <div style={{ padding: 20, color: 'var(--danger)' }}>Error: {error}</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Notifications</h1>
        <div style={styles.actions}>
          <button
            style={styles.filterBtn(filter === 'all')}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            style={styles.filterBtn(filter === 'unread')}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          {notifications.some(n => !n.read) && (
            <button style={styles.markAllBtn} onClick={handleMarkAllAsRead}>
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          </div>
          <div style={{ fontSize: 14 }}>You're all caught up!</div>
        </div>
      ) : (
        <div>
          {notifications.map((notif) => (
            <div key={notif._id} style={styles.notificationCard(notif.read)}>
              <div style={styles.notifHeader}>
                <h3 style={styles.notifTitle}>{notif.title}</h3>
                <div style={styles.notifMeta}>
                  <span style={styles.badge(notif.type)}>{notif.type}</span>
                  {notif.priority === 'high' && (
                    <span style={{ ...styles.badge('system'), background: '#fee2e2', color: '#991b1b' }}>
                      High
                    </span>
                  )}
                </div>
              </div>
              <p style={styles.notifMessage}>{notif.message}</p>
              <div style={styles.notifFooter}>
                <span style={styles.notifDate}>{formatDate(notif.createdAt)}</span>
                <div style={styles.notifActions}>
                  {!notif.read && (
                    <button
                      style={styles.actionBtn}
                      onClick={() => handleMarkAsRead(notif._id)}
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    style={{ ...styles.actionBtn, color: '#dc2626' }}
                    onClick={() => handleDelete(notif._id)}
                  >
                    Delete
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

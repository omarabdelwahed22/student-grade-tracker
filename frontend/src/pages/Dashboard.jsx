import React, { useEffect, useState } from 'react'
import { getHealth } from '../services/api'

function Dashboard() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await getHealth()
        setHealth(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchHealth()
  }, [])

  return (
    <section className="dashboard">
      <h2>Dashboard</h2>
      <p>Welcome to the Student Grade Tracker application.</p>

      <div className="card">
        <h3>API Health Status</h3>
        {loading && <p>Checking health...</p>}
        {error && <p className="error">Error: {error}</p>}
        {health && (
          <div className="health-info">
            <p><strong>Status:</strong> {health.status}</p>
            <p><strong>Uptime:</strong> {health.uptime.toFixed(2)}s</p>
            <p><strong>Timestamp:</strong> {health.timestamp}</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default Dashboard

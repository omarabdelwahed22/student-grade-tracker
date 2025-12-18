import React, { useEffect, useState } from 'react'
import { getHealth } from '../services/api'
import { getGpa } from '../services/grades'

export default function Dashboard() {
  const [health, setHealth] = useState(null)
  const [gpa, setGpa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isStudent = user.role === 'student'

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [healthRes, gpaRes] = await Promise.all([
          getHealth(),
          isStudent ? getGpa() : Promise.resolve(null)
        ])
        setHealth(healthRes)
        setGpa(gpaRes)
        setError(null)
      } catch (err) {
        setError(err.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [isStudent])

  return (
    <section className="dashboard" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, color: '#718096', marginBottom: 6 }}>Welcome back</div>
          <h2 style={{ margin: 0 }}>Dashboard</h2>
        </div>
        <div style={{ fontSize: 13, color: '#4a5568' }}>{user.name || user.email || 'User'}</div>
      </div>

      {error && (
        <div style={{
          padding: 12,
          marginBottom: 14,
          background: '#fff5f5',
          border: '1px solid #fed7d7',
          color: '#c53030',
          borderRadius: 10
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isStudent ? '1fr 1fr' : '1fr', gap: 16 }}>
        <div style={{ background: 'white', borderRadius: 14, padding: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Backend Health</h3>
            {loading && <span style={{ fontSize: 12, color: '#718096' }}>Loading...</span>}
          </div>
          <pre style={{ background: '#f7fafc', padding: 12, borderRadius: 10, marginTop: 10, maxHeight: 240, overflow: 'auto' }}>
            {health ? JSON.stringify(health, null, 2) : 'No data'}
          </pre>
        </div>

        {isStudent && (
          <div style={{ background: 'white', borderRadius: 14, padding: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Your GPA</h3>
              {gpa && <span style={{ fontSize: 12, color: '#718096' }}>{gpa.totalCredits} credits</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
              <div style={{ fontSize: 40, fontWeight: 700, color: '#2b6cb0' }}>
                {gpa ? gpa.gpa.toFixed(2) : loading ? '...' : '0.00'}
              </div>
              <div style={{ color: '#4a5568' }}>on a 4.0 scale</div>
            </div>
            <div style={{ marginTop: 12, maxHeight: 220, overflow: 'auto' }}>
              {gpa && gpa.breakdown && gpa.breakdown.length > 0 ? (
                gpa.breakdown.map(item => (
                  <div key={item.courseId} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.courseCode}</div>
                      <div style={{ color: '#4a5568', fontSize: 13 }}>{item.courseName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>{item.points.toFixed(2)}</div>
                      <div style={{ color: '#4a5568', fontSize: 13 }}>{item.percentage}%</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: '#4a5568' }}>No grades yet.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

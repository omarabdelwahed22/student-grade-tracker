import React, { useEffect, useState } from 'react'
import { getMyCourses, updateCourse } from '../services/courses'
import { getGpa } from '../services/grades'

export default function Dashboard() {
  const [courses, setCourses] = useState([])
  const [gpa, setGpa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isInstructor = user.role === 'instructor'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [coursesRes, gpaRes] = await Promise.all([
        getMyCourses(),
        getGpa()
      ])
      setCourses(coursesRes.courses || [])
      setGpa(gpaRes)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const letterFromPercentage = (pct) => {
    if (pct >= 90) return 'A'
    if (pct >= 80) return 'B'
    if (pct >= 70) return 'C'
    if (pct >= 60) return 'D'
    return 'F'
  }

  const letterColors = (letter) => {
    switch (letter) {
      case 'A': return { fg: '#065f46', bg: '#d1fae5', border: '#10b981' }
      case 'B': return { fg: '#1e3a8a', bg: '#dbeafe', border: '#60a5fa' }
      case 'C': return { fg: '#92400e', bg: '#fef3c7', border: '#f59e0b' }
      case 'D': return { fg: '#7f1d1d', bg: '#fee2e2', border: '#f87171' }
      default: return { fg: '#111827', bg: '#e5e7eb', border: '#d1d5db' }
    }
  }

  const toggleCourseStatus = async (course) => {
    const newStatus = course.status === 'completed' ? 'in-progress' : 'completed'
    const confirmMsg = newStatus === 'completed' 
      ? `Mark "${course.name}" as completed? This will include it in your GPA calculation.`
      : `Mark "${course.name}" as in progress? This will exclude it from your GPA calculation.`
    
    if (!confirm(confirmMsg)) return

    try {
      await updateCourse(course._id, { status: newStatus })
      await loadData()
    } catch (err) {
      alert(err.message || 'Failed to update course status')
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading dashboard...</div>
  const computedCredits = courses.reduce((sum, c) => sum + (Number(c.credits) || 3), 0)

  return (
    <section className="dashboard" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Welcome back</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>Dashboard</h1>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user.name || user.email || 'User'}</div>
      </div>

      {error && (
        <div style={{
          padding: 12,
          marginBottom: 16,
          background: 'var(--error-light)',
          border: '1px solid var(--error)',
          color: 'var(--error)',
          borderRadius: 8
        }}>
          {error}
        </div>
      )}

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard 
          title="GPA" 
          value={gpa ? gpa.gpa.toFixed(2) : '0.00'} 
          subtitle="on a 4.0 scale"
          icon="📊" 
        />
        {gpa && gpa.projectedGpa && gpa.projectedGpa !== gpa.gpa && (
          <StatCard 
            title="Projected GPA" 
            value={gpa.projectedGpa.toFixed(2)} 
            subtitle="including in-progress"
            icon="📈" 
          />
        )}
        <StatCard 
          title="Courses" 
          value={courses.length} 
          icon="📘" 
        />
        <StatCard 
          title="Total Credits" 
          value={computedCredits} 
          icon="⭐" 
        />
      </div>

      {/* My Courses */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>My Courses</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginBottom: 24 }}>
        {courses.map(c => {
          const courseGpa = gpa?.breakdown?.find(b => String(b.courseId) === String(c._id))
          const percentage = courseGpa?.percentage || 0
          const status = c.status || 'in-progress'
          const statusColor = status === 'completed' ? '#10b981' : '#f59e0b'
          const statusBg = status === 'completed' ? '#d1fae5' : '#fef3c7'
          
          return (
            <div key={c._id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ background: '#e6f3ff', color: '#1e40af', padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{c.code}</span>
                {c.semester && <span style={{ background: 'var(--bg)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{c.semester}</span>}
                <span style={{ 
                  background: statusBg, 
                  color: statusColor, 
                  padding: '3px 8px', 
                  borderRadius: 999, 
                  fontSize: 11, 
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {status === 'completed' ? '✓ Completed' : '↻ In Progress'}
                </span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>{c.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>Instructor: {c.instructor?.name || c.instructor?.email || 'N/A'}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Your Grade</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#667eea' }}>{percentage}%</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>GPA Points</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#667eea' }}>{courseGpa?.points.toFixed(2) || '0.00'}</div>
                </div>
              </div>
              {status === 'completed' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  {(() => {
                    const letter = letterFromPercentage(percentage)
                    const colors = letterColors(letter)
                    return (
                      <span style={{
                        padding: '6px 10px',
                        borderRadius: 999,
                        border: `1px solid ${colors.border}`,
                        background: colors.bg,
                        color: colors.fg,
                        fontSize: 13,
                        fontWeight: 800
                      }}>
                        {letter}
                      </span>
                    )
                  })()}
                </div>
              )}
              {isInstructor && (
                <button
                  onClick={() => toggleCourseStatus(c)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1px solid ${statusColor}`,
                    background: statusBg,
                    color: statusColor,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                    transition: 'all 0.2s'
                  }}
                >
                  {status === 'completed' ? '↻ Mark as In Progress' : '✓ Mark as Completed'}
                </button>
              )}
            </div>
          )
        })}
        {courses.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No courses yet.</div>}
      </div>

      {/* Grade Breakdown */}
      {gpa && gpa.breakdown && gpa.breakdown.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>Grade Breakdown</h2>
          <div style={{ background: 'var(--surface)', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, color: 'var(--text)' }}>
              <div>Course</div>
              <div>Status</div>
              <div>Credits</div>
              <div>Percentage</div>
              <div>GPA Points</div>
            </div>
            {gpa.breakdown.map(item => {
              const status = item.status || 'in-progress'
              const statusColor = status === 'completed' ? '#10b981' : '#f59e0b'
              const statusBg = status === 'completed' ? '#d1fae5' : '#fef3c7'
              
              return (
                <div key={item.courseId} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{item.courseName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.courseCode}</div>
                  </div>
                  <div>
                    <span style={{ 
                      background: statusBg, 
                      color: statusColor, 
                      padding: '3px 8px', 
                      borderRadius: 999, 
                      fontSize: 11, 
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      display: 'inline-block'
                    }}>
                      {status === 'completed' ? '✓ Done' : '↻ Active'}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text)' }}>{item.credits}</div>
                  <div style={{ color: 'var(--text)' }}>{item.percentage}%</div>
                  <div style={{ fontWeight: 600, color: status === 'completed' ? '#2b6cb0' : '#94a3b8' }}>{item.points.toFixed(2)}</div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e6f3ff', display: 'grid', placeItems: 'center', fontSize: 18 }}>
        <span>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</div>}
      </div>
    </div>
  )
}

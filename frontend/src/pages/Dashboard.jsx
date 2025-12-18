import React, { useEffect, useState } from 'react'
import { getMyCourses } from '../services/courses'
import { getGpa } from '../services/grades'

export default function Dashboard() {
  const [courses, setCourses] = useState([])
  const [gpa, setGpa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const load = async () => {
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

    load()
  }, [])

  if (loading) return <div style={{ padding: 24 }}>Loading dashboard...</div>
  const computedCredits = courses.reduce((sum, c) => sum + (Number(c.credits) || 3), 0)

  return (
    <section className="dashboard" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: '#718096', marginBottom: 6 }}>Welcome back</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Dashboard</h1>
        </div>
        <div style={{ fontSize: 13, color: '#4a5568' }}>{user.name || user.email || 'User'}</div>
      </div>

      {error && (
        <div style={{
          padding: 12,
          marginBottom: 16,
          background: '#fee',
          border: '1px solid #fcc',
          color: '#c33',
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
        <StatCard 
          title="Courses" 
          value={courses.length} 
          icon="📘" 
        />
        <StatCard 
          title="Total Credits" 
          value={(gpa?.totalCredits && gpa.totalCredits > 0) ? gpa.totalCredits : computedCredits} 
          icon="⭐" 
        />
      </div>

      {/* My Courses */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>My Courses</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginBottom: 24 }}>
        {courses.map(c => {
          const courseGpa = gpa?.breakdown?.find(b => String(b.courseId) === String(c._id))
          const percentage = courseGpa?.percentage || 0
          return (
            <div key={c._id} style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <span style={{ background: '#e6f3ff', color: '#1e40af', padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{c.code}</span>
                {c.semester && <span style={{ background: '#edf2f7', color: '#4a5568', padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{c.semester}</span>}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{c.name}</div>
              <div style={{ fontSize: 13, color: '#718096', marginBottom: 10 }}>Instructor: {c.instructor?.name || c.instructor?.email || 'N/A'}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#718096' }}>Your Grade</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#2b6cb0' }}>{percentage}%</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#718096' }}>GPA Points</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#2b6cb0' }}>{courseGpa?.points.toFixed(2) || '0.00'}</div>
                </div>
              </div>
            </div>
          )
        })}
        {courses.length === 0 && <div style={{ color: '#718096' }}>No courses yet.</div>}
      </div>

      {/* Grade Breakdown */}
      {gpa && gpa.breakdown && gpa.breakdown.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Grade Breakdown</h2>
          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#4a5568' }}>
              <div>Course</div>
              <div>Credits</div>
              <div>Percentage</div>
              <div>GPA Points</div>
            </div>
            {gpa.breakdown.map(item => (
              <div key={item.courseId} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '12px 16px', borderBottom: '1px solid #edf2f7' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.courseName}</div>
                  <div style={{ fontSize: 12, color: '#718096' }}>{item.courseCode}</div>
                </div>
                <div>{item.credits}</div>
                <div>{item.percentage}%</div>
                <div style={{ fontWeight: 600, color: '#2b6cb0' }}>{item.points.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e6f3ff', display: 'grid', placeItems: 'center', fontSize: 18 }}>
        <span>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#718096', fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
        {subtitle && <div style={{ fontSize: 12, color: '#718096' }}>{subtitle}</div>}
      </div>
    </div>
  )
}

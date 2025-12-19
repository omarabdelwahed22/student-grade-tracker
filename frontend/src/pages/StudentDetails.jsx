import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUserById } from '../services/users'
import { getMyCourses } from '../services/courses'
import { getGrades } from '../services/grades'

export default function StudentDetails(){
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [courses, setCourses] = useState([])
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [uRes, cRes, gRes] = await Promise.all([
          getUserById(id),
          getMyCourses(),
          getGrades({ studentId: id })
        ])
        setUser(uRes.user || uRes)
        setCourses(cRes.courses || [])
        setGrades(gRes.grades || [])
        setError(null)
      } catch (err) {
        setError(err.message || 'Failed to load student')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const enrolledCourses = useMemo(() => {
    return courses.filter(c => (c.students || []).some(s => String(s._id || s) === String(id)))
  }, [courses, id])

  const gradeSummary = useMemo(() => {
    let sum = 0, maxSum = 0
    grades.forEach(g => { sum += (g.score || 0); maxSum += (g.maxScore || 0) })
    const avg = maxSum > 0 ? Number(((sum / maxSum) * 100).toFixed(1)) : 0
    return { count: grades.length, avg }
  }, [grades])

  if (loading) return <div style={{ padding: 24 }}>Loading student...</div>
  if (error) return <div style={{ padding: 24, color: 'var(--error)' }}>{error}</div>
  if (!user) return <div style={{ padding: 24 }}>Student not found.</div>

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Student Details</h1>
        <Link to="/students" style={{ textDecoration: 'none', padding: '8px 12px', background: 'var(--gray-100)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}>Back to Students</Link>
      </div>

      <div className="card" style={{ marginTop: 16, background: 'var(--surface)', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e6fffa', color: '#159', display: 'grid', placeItems: 'center', fontWeight: 800 }}>
            {String(user.name || '?').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{user.name}</div>
            <div style={{ color: 'var(--text-muted)' }}>{user.email}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>ID: {user.studentId || '-'}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Enrolled Courses ({enrolledCourses.length})</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {enrolledCourses.length ? enrolledCourses.map(c => (
              <span key={c._id} style={{ padding: '6px 10px', background: '#f0f5ff', color: '#3749a9', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{c.code || c.name}</span>
            )) : <span style={{ color: 'var(--text-muted)' }}>No courses</span>}
          </div>
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Grades Summary</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Grades</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{gradeSummary.count}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Average</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{gradeSummary.avg}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
  if (error) return <div style={{ padding: 24, color: '#c33' }}>{error}</div>
  if (!user) return <div style={{ padding: 24 }}>Student not found.</div>

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Student Details</h1>
        <Link to="/students" style={{ textDecoration: 'none', padding: '8px 12px', background: '#edf2f7', border: '1px solid #e2e8f0', borderRadius: 8 }}>Back to Students</Link>
      </div>

      <div className="card" style={{ marginTop: 16, background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e6fffa', color: '#159', display: 'grid', placeItems: 'center', fontWeight: 800 }}>
            {String(user.name || '?').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{user.name}</div>
            <div style={{ color: '#718096' }}>{user.email}</div>
            <div style={{ color: '#a0aec0', fontSize: 12 }}>ID: {user.studentId || '-'}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Enrolled Courses ({enrolledCourses.length})</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {enrolledCourses.length ? enrolledCourses.map(c => (
              <span key={c._id} style={{ padding: '6px 10px', background: '#f0f5ff', color: '#3749a9', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{c.code || c.name}</span>
            )) : <span style={{ color: '#a0aec0' }}>No courses</span>}
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Grades Summary</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: '#718096' }}>Total Grades</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{gradeSummary.count}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#718096' }}>Average</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{gradeSummary.avg}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
  const [selectedCourseId, setSelectedCourseId] = useState(null)
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
    return courses.filter(c => (c.students || []).some(s => {
      const sid = s.student?._id || s._id || s
      return String(sid) === String(id)
    }))
  }, [courses, id])

  useEffect(() => {
    if (!selectedCourseId && enrolledCourses.length) {
      setSelectedCourseId(enrolledCourses[0]._id)
    }
  }, [enrolledCourses, selectedCourseId])

  const gradesByCourse = useMemo(() => {
    const map = {}
    grades.forEach(g => {
      const courseId = g.course?._id || g.course
      if (!courseId) return
      if (!map[courseId]) map[courseId] = []
      map[courseId].push(g)
    })
    Object.keys(map).forEach(cid => {
      map[cid] = map[cid]
        .slice()
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    })
    return map
  }, [grades])

  const gradeSummary = useMemo(() => {
    let sum = 0, maxSum = 0
    grades.forEach(g => { sum += (g.score || 0); maxSum += (g.maxScore || 0) })
    const avg = maxSum > 0 ? Number(((sum / maxSum) * 100).toFixed(1)) : 0
    return { count: grades.length, avg }
  }, [grades])

  const selectedCourse = enrolledCourses.find(c => c._id === selectedCourseId)
  const recentGrades = selectedCourseId ? (gradesByCourse[selectedCourseId] || []).slice(0, 3) : []

  const formatStatus = (status) => {
    if (status === 'completed') return { label: 'Completed', color: '#10b981', bg: '#ecfdf3' }
    if (status === 'archived') return { label: 'Archived', color: '#6b7280', bg: '#f3f4f6' }
    return { label: 'In Progress', color: '#2563eb', bg: '#eff6ff' }
  }

  const formatDate = (value) => {
    if (!value) return '—'
    const d = new Date(value)
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString()
  }

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
          {enrolledCourses.length ? (
            <div style={{ display: 'grid', gap: 8 }}>
              {enrolledCourses.map(c => {
                const status = formatStatus(c.status)
                const gradeCount = (gradesByCourse[c._id] || []).length
                return (
                  <button
                    key={c._id}
                    onClick={() => setSelectedCourseId(c._id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: c._id === selectedCourseId ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: 'var(--bg)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      gap: 12
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text)' }}>{c.code || c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.name}</div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          color: status.color,
                          background: status.bg
                        }}>
                          {status.label}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Grades: {gradeCount}</span>
                      </div>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>›</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>No courses</span>
          )}
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

      <div style={{ marginTop: 16 }}>
        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, color: 'var(--text)' }}>Course Details</div>
            {selectedCourse && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedCourse.semester} {selectedCourse.year}</span>
            )}
          </div>

          {!selectedCourse && (
            <div style={{ color: 'var(--text-muted)', marginTop: 8 }}>Select a course to view status and recent grades.</div>
          )}

          {selectedCourse && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{selectedCourse.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedCourse.code}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status</div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    color: formatStatus(selectedCourse.status).color,
                    background: formatStatus(selectedCourse.status).bg
                  }}>
                    {formatStatus(selectedCourse.status).label}
                  </span>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Completed at: {formatDate(selectedCourse.completedAt)}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Recent Grades</div>
                {recentGrades.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {recentGrades.map(g => (
                      <div key={g._id} style={{
                        padding: 12,
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        background: 'var(--bg)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text)' }}>{g.category || 'Grade'}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(g.createdAt)}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--text)' }}>
                          {g.score}/{g.maxScore}
                          {g.weight ? <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>({g.weight}% weight)</span> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No grades yet for this course.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

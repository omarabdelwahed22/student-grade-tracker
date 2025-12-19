import React, { useEffect, useMemo, useState } from 'react'
import { getMyCourses } from '../services/courses'
import { getGrades } from '../services/grades'

export default function InstructorHome(){
  const [courses, setCourses] = useState([])
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [cRes, gRes] = await Promise.all([
          getMyCourses(),
          getGrades()
        ])
        setCourses(cRes.courses || [])
        setGrades(gRes.grades || [])
        setError(null)
      } catch (err) {
        setError(err.message || 'Failed to load instructor data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const totalCourses = courses.length
    const uniqueStudents = new Set()
    courses.forEach(c => (c.students || []).forEach(s => uniqueStudents.add(String(s._id || s))))
    const totalStudents = uniqueStudents.size
    let sum = 0, maxSum = 0
    grades.forEach(g => { sum += (g.score || 0); maxSum += (g.maxScore || 0) })
    const classAverage = maxSum > 0 ? Number(((sum / maxSum) * 100).toFixed(1)) : 0
    return { totalCourses, totalStudents, classAverage }
  }, [courses, grades])

  const gradeByCourse = useMemo(() => {
    const map = new Map()
    grades.forEach(g => {
      const cid = String(g.course?._id || g.course)
      if (!map.has(cid)) map.set(cid, [])
      map.get(cid).push(g)
    })
    return map
  }, [grades])

  if (loading) return <div style={{ padding: 24 }}>Loading dashboard...</div>

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0, fontSize: 28, fontWeight: 700 }}>Instructor Dashboard</h1>

      {error && (
        <div style={{ marginBottom: 16, padding: 12, border: '1px solid #fcc', background: 'var(--error-light)', borderRadius: 8, color: 'var(--error)' }}>{error}</div>
      )}

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard title="Total Courses" value={stats.totalCourses} icon="📘" />
        <StatCard title="Total Students" value={stats.totalStudents} icon="👥" />
        <StatCard title="Class Average" value={stats.classAverage + '%'} icon="📈" />
      </div>

      {/* My Courses */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>My Courses</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16, marginBottom: 24 }}>
        {courses.map(c => (
          <div key={c._id} style={{ background: 'var(--surface)', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span style={{ background: '#e6fffa', color: '#116466', padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{c.code}</span>
                  {c.semester && <span style={{ background: 'var(--gray-100)', color: 'var(--text)', padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{c.semester} {c.year}</span>}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{c.name}</div>
                <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>{(c.students?.length || 0)} students enrolled</div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>Avg {courseAverage(gradeByCourse.get(String(c._id)))}%</div>
            </div>
          </div>
        ))}
        {courses.length === 0 && (<div style={{ color: 'var(--text-muted)' }}>No courses yet.</div>)}
      </div>

      {/* Quick stats table */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>Quick Stats by Course</h2>
      <div style={{ background: 'var(--surface)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, color: 'var(--text)' }}>
          <div>Course</div>
          <div>Enrolled</div>
          <div>Avg Grade</div>
          <div>Assignments</div>
          <div>Semester</div>
        </div>
        {courses.map(c => {
          const g = gradeByCourse.get(String(c._id)) || []
          const avg = courseAverage(g)
          const assignments = new Set(g.map(x => x.assignment)).size
          return (
            <div key={c._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.code}</div>
              </div>
              <div style={{ color: 'var(--text)' }}>{c.students?.length || 0}</div>
              <div style={{ color: 'var(--text)' }}>{avg}%</div>
              <div style={{ color: 'var(--text)' }}>{assignments}</div>
              <div style={{ color: 'var(--text)' }}>{c.semester ? `${c.semester} ${c.year}` : '-'}</div>
            </div>
          )
        })}
        {courses.length === 0 && <div style={{ padding: 16, color: 'var(--text-muted)' }}>No course stats yet.</div>}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e6fffa', display: 'grid', placeItems: 'center', fontSize: 18 }}>
        <span>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
      </div>
    </div>
  )
}

function courseAverage(list = []){
  let s = 0, m = 0
  list.forEach(g => { s += (g.score || 0); m += (g.maxScore || 0) })
  return m > 0 ? Number(((s/m)*100).toFixed(1)) : 0
}


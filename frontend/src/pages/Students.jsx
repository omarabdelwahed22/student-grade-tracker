import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyCourses } from '../services/courses'
import { getGrades } from '../services/grades'

export default function Students() {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [coursesRes, gradesRes] = await Promise.all([
          getMyCourses(),
          getGrades()
        ])
        const courseList = coursesRes.courses || []
        setCourses(courseList)
        setGrades(gradesRes.grades || [])
        // Build enrolled-only unique student list from instructor's courses
        const unique = new Map()
        courseList.forEach(c => {
          (c.students || []).forEach(enrollment => {
            // Handle new nested structure {student: {...}, enrolledBy: {...}}
            const studentData = enrollment.student || enrollment
            const id = String(studentData._id || studentData)
            if (!unique.has(id)) unique.set(id, studentData)
          })
        })
        setStudents(Array.from(unique.values()))
        setError(null)
      } catch (err) {
        setError(err.message || 'Failed to load students')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const courseMap = useMemo(() => {
    const m = new Map()
    courses.forEach(c => m.set(String(c._id), c))
    return m
  }, [courses])

  const enrollmentIndex = useMemo(() => {
    // Build map studentId -> Set(courseId)
    const idx = new Map()
    courses.forEach(c => {
      (c.students || []).forEach(enrollment => {
        // Handle nested structure {student: {...}, enrolledBy: {...}}
        const studentData = enrollment.student || enrollment
        const key = String(studentData._id || studentData)
        if (!idx.has(key)) idx.set(key, new Set())
        idx.get(key).add(String(c._id))
      })
    })
    return idx
  }, [courses])

  const gradeCountByStudent = useMemo(() => {
    const map = new Map()
    grades.forEach(g => {
      const sid = String(g.student?._id || g.student)
      map.set(sid, (map.get(sid) || 0) + 1)
    })
    return map
  }, [grades])

  const stats = useMemo(() => {
    const totalStudents = students.length
    const totalCourses = courses.length
    // Class average computed from instructor-scoped grades
    let sum = 0, maxSum = 0
    grades.forEach(g => { sum += (g.score || 0); maxSum += (g.maxScore || 0) })
    const classAverage = maxSum > 0 ? Number(((sum / maxSum) * 100).toFixed(1)) : 0
    return {
      totalStudents,
      totalCourses,
      classAverage
    }
  }, [students, courses, grades])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return students.filter(s => {
      const matchesQuery = !q || [s.name, s.email, s.studentId].some(v => String(v || '').toLowerCase().includes(q))
      if (!matchesQuery) return false
      if (courseFilter === 'all') return true
      const enrolledIn = enrollmentIndex.get(String(s._id)) || new Set()
      return enrolledIn.has(courseFilter)
    })
  }, [students, query, courseFilter, enrollmentIndex])

  if (loading) return <div style={{ padding: 24 }}>Loading students...</div>

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0, fontSize: 28, fontWeight: 700 }}>Students</h1>

      {error && (
        <div style={{
          marginBottom: 16,
          padding: 12,
          border: '1px solid #fcc',
          background: '#fee',
          borderRadius: 8,
          color: '#c33'
        }}>{error}</div>
      )}

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard title="Total Students" value={stats.totalStudents} icon="👥" />
        <StatCard title="Total Courses" value={stats.totalCourses} icon="📘" />
        <StatCard title="Class Average" value={stats.classAverage + '%'} icon="📈" />
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <span style={{ color: 'var(--text-muted)' }}>🔍</span>
          <input
            placeholder="Search by name, email, or student ID..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 10, background: 'var(--surface)', color: 'var(--text)' }}
          />
        </div>
        <div>
          <select
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            style={{ padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 10, background: 'var(--surface)', color: 'var(--text)' }}
          >
            <option value="all">All Courses</option>
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.code || c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 2fr 1fr 1fr', padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text)' }}>
          <div>Student</div>
          <div>Student ID</div>
          <div>Email</div>
          <div>Courses</div>
          <div>Total Grades</div>
          <div>Actions</div>
        </div>
        {filtered.map(s => {
          const enrolledSet = enrollmentIndex.get(String(s._id)) || new Set()
          const enrolledCourses = Array.from(enrolledSet).map(id => courseMap.get(id)).filter(Boolean)
          const gradeCount = gradeCountByStudent.get(String(s._id)) || 0
          return (
            <div key={s._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 2fr 1fr 1fr', padding: '12px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e6fffa', color: '#159' , display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                  {String(s.name || '?').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{enrolledSet.size} course(s)</div>
                </div>
              </div>
              <div style={{ color: 'var(--text)' }}>{s.studentId || '-'}</div>
              <div style={{ color: 'var(--text)' }}>{s.email}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {enrolledCourses.length ? enrolledCourses.map(c => (
                  <span key={c._id} style={{ padding: '4px 8px', background: '#f0f5ff', color: '#3749a9', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                    {c.code || c.name}
                  </span>
                )) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
              </div>
              <div>{gradeCount}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => navigate(`/students/${s._id}`)}
                  style={{ padding: '6px 10px', fontSize: 12, background: 'var(--gray-100)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--text)' }}
                >
                  View Details
                </button>
                <a
                  href={`mailto:${s.email}`}
                  style={{ padding: '6px 10px', fontSize: 12, background: '#e6fffa', border: '1px solid #c6f6d5', borderRadius: 6, color: '#2f855a', textDecoration: 'none' }}
                >
                  Contact
                </a>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 24, color: 'var(--text-muted)' }}>No students match your filters.</div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--border)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eef2ff', display: 'grid', placeItems: 'center', fontSize: 18 }}>
        <span>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
      </div>
    </div>
  )
}

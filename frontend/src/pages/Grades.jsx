import React, { useEffect, useMemo, useState } from 'react'
import { getGrades, createGrade, deleteGrade } from '../services/grades'
import { getMyCourses } from '../services/courses'

export default function Grades() {
  const [grades, setGrades] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filterCourse, setFilterCourse] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    courseId: '',
    studentId: '',
    assignment: '',
    score: '',
    maxScore: 100,
    feedback: ''
  })

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isInstructor = user.role === 'instructor'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [gradesData, coursesData] = await Promise.all([
        getGrades(filterCourse ? { courseId: filterCourse } : {}),
        getMyCourses()
      ])
      setGrades(gradesData.grades || [])
      setCourses(coursesData.courses || [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const selectedCourseStudents = useMemo(() => {
    const course = courses.find(c => c._id === formData.courseId)
    return course?.students || []
  }, [courses, formData.courseId])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createGrade({
        ...formData,
        score: parseFloat(formData.score),
        maxScore: parseFloat(formData.maxScore)
      })
      setShowCreateForm(false)
      setFormData({
        courseId: '',
        studentId: '',
        assignment: '',
        score: '',
        maxScore: 100,
        feedback: ''
      })
      loadData()
    } catch (err) {
      alert(err.message || 'Failed to create grade')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this grade?')) return
    try {
      await deleteGrade(id)
      loadData()
    } catch (err) {
      alert(err.message || 'Failed to delete grade')
    }
  }

  const filteredGrades = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return grades.filter(g => {
      const matchesCourse = filterCourse ? g.course?._id === filterCourse : true
      const haystack = [
        g.student?.name,
        g.student?.email,
        g.student?.studentId,
        g.course?.name,
        g.course?.code,
        g.assignment
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchesSearch = term ? haystack.includes(term) : true
      return matchesCourse && matchesSearch
    })
  }, [grades, filterCourse, searchTerm])

  const getLetterGradeColor = (grade) => {
    const colors = { A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#ef4444', F: '#dc2626' }
    return colors[grade] || '#718096'
  }

  if (loading) return <div style={{ padding: 24 }}>Loading grades...</div>

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, color: '#718096', marginBottom: 6 }}>Instructor Dashboard</div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>Grades</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              background: 'white',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#4a5568'
            }}
            onClick={loadData}
          >
            Refresh
          </button>
          {isInstructor && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
            >
              {showCreateForm ? 'Cancel' : 'Add Grade'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          padding: 14,
          marginBottom: 16,
          background: '#fff5f5',
          border: '1px solid #fed7d7',
          color: '#c53030',
          borderRadius: 10
        }}>
          {error}
        </div>
      )}

      <div style={{
        background: 'white',
        borderRadius: 14,
        padding: 16,
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        marginBottom: 16,
        display: 'flex',
        gap: 12,
        alignItems: 'center'
      }}>
        <select
          value={filterCourse}
          onChange={e => setFilterCourse(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            minWidth: 200
          }}
        >
          <option value="">All Courses</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>
              {c.code} - {c.name}
            </option>
          ))}
        </select>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search students by name, email, or ID"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              fontSize: 14
            }}
          />
        </div>
        <button
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            background: '#f7fafc',
            cursor: 'pointer',
            fontWeight: 600,
            color: '#4a5568'
          }}
        >
          Filters
        </button>
      </div>

      {showCreateForm && isInstructor && (
        <div style={{
          background: 'white',
          borderRadius: 14,
          padding: 20,
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          marginBottom: 18
        }}>
          <h3 style={{ marginTop: 0, marginBottom: 14 }}>Add Grade</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Course</label>
                <select
                  required
                  value={formData.courseId}
                  onChange={e => setFormData({ ...formData, courseId: e.target.value, studentId: '' })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <option value="">Select course...</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Student</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                  disabled={!formData.courseId || selectedCourseStudents.length === 0}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    background: !formData.courseId ? '#f7fafc' : 'white'
                  }}
                >
                  <option value="">{!formData.courseId ? 'Select a course first' : 'Select student...'}</option>
                  {selectedCourseStudents.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name || 'Student'}  {s.studentId || 'N/A'}  {s.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Assignment</label>
              <input
                required
                value={formData.assignment}
                onChange={e => setFormData({ ...formData, assignment: e.target.value })}
                placeholder="e.g., Midterm Exam"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Score</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.score}
                  onChange={e => setFormData({ ...formData, score: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Max Score</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={formData.maxScore}
                  onChange={e => setFormData({ ...formData, maxScore: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Feedback (optional)</label>
              <textarea
                value={formData.feedback}
                onChange={e => setFormData({ ...formData, feedback: e.target.value })}
                placeholder="Feedback for the student..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  minHeight: 80,
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '12px 18px',
                border: 'none',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
            >
              Add Grade
            </button>
          </form>
        </div>
      )}

      {filteredGrades.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 48,
          background: 'white',
          borderRadius: 14,
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          <p style={{ margin: 0, color: '#718096' }}>
            {isInstructor ? 'No grades yet. Use "Add Grade" to begin.' : 'No grades available yet.'}
          </p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={thStyle}>Student</th>
                <th style={thStyle}>Student ID</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Course</th>
                <th style={thStyle}>Assignment</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Score</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Grade</th>
                <th style={thStyle}>Feedback</th>
                {isInstructor && <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredGrades.map((grade, idx) => (
                <tr key={grade._id} style={{ borderBottom: idx < filteredGrades.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                  <td style={tdStyle}>{grade.student?.name || 'Student'}</td>
                  <td style={tdStyle}>{grade.student?.studentId || ''}</td>
                  <td style={tdStyle}>{grade.student?.email}</td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600 }}>{grade.course?.code}</div>
                    <div style={{ fontSize: 13, color: '#718096' }}>{grade.course?.name}</div>
                  </td>
                  <td style={tdStyle}>{grade.assignment}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ fontWeight: 700 }}>{grade.score}/{grade.maxScore}</div>
                    <div style={{ fontSize: 12, color: '#718096' }}>{((grade.score / grade.maxScore) * 100).toFixed(1)}%</div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: 16,
                      fontWeight: 700,
                      background: getLetterGradeColor(grade.letterGrade) + '20',
                      color: getLetterGradeColor(grade.letterGrade)
                    }}>
                      {grade.letterGrade}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, maxWidth: 260, color: '#4a5568' }}>
                    {grade.feedback || ''}
                  </td>
                  {isInstructor && (
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(grade._id)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 8,
                          border: '1px solid #fed7d7',
                          background: '#fff5f5',
                          color: '#c53030',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const thStyle = {
  padding: '14px 16px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#4a5568'
}

const tdStyle = {
  padding: '14px 16px',
  fontSize: 14,
  verticalAlign: 'middle'
}

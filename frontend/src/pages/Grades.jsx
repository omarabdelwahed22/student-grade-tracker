import React, { useEffect, useMemo, useState } from 'react'
import { getGrades, createGrade, updateGrade, deleteGrade } from '../services/grades'
import { getMyCourses } from '../services/courses'

export default function Grades() {
  const [grades, setGrades] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingGrade, setEditingGrade] = useState(null)
  const [filterCourse, setFilterCourse] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState({
    courseId: '',
    studentId: '',
    category: 'Assignment',
    weight: 10,
    score: '',
    maxScore: 100,
    feedback: ''
  })

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isInstructor = user.role === 'instructor'
  const isStudent = user.role === 'student'

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
    if (!course?.students) return []
    return course.students
      .map(enrollment => {
        const student = enrollment?.student || enrollment
        if (!student?._id) return null
        return {
          _id: student._id,
          name: student.name || student.fullName || 'Student',
          email: student.email || '',
          studentId: student.studentId || student.id || ''
        }
      })
      .filter(Boolean)
  }, [courses, formData.courseId])

  const handleCreate = async (e) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!formData.courseId || !formData.studentId || !formData.category || formData.score === '' || !formData.maxScore) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const gradeData = {
        courseId: formData.courseId,
        studentId: formData.studentId,
        category: formData.category,
        weight: parseFloat(formData.weight) || 10,
        score: parseFloat(formData.score),
        maxScore: parseFloat(formData.maxScore),
        feedback: formData.feedback
      }
      console.log('Sending grade data:', gradeData)
      await createGrade(gradeData)
      setShowCreateForm(false)
      setFormData({
        courseId: '',
        studentId: '',
        category: 'Assignment',
        weight: 10,
        score: '',
        maxScore: 100,
        feedback: ''
      })
      loadData()
      setSuccessMessage('✅ Grade created successfully!')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err) {
      console.error('Grade creation error:', err)
      setError(err.message || 'Failed to create grade')
      setTimeout(() => setError(null), 4000)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this grade?')) return
    try {
      await deleteGrade(id)
      loadData()
      setSuccessMessage('✅ Grade deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err) {
      setError(err.message || 'Failed to delete grade')
      setTimeout(() => setError(null), 4000)
    }
  }

  const handleEdit = (grade) => {
    setEditingGrade(grade)
    setFormData({
      courseId: grade.course?._id || '',
      studentId: grade.student?._id || '',
      category: grade.category || 'Assignment',
      weight: grade.weight || 10,
      score: grade.score || '',
      maxScore: grade.maxScore || 100,
      feedback: grade.feedback || ''
    })
    setShowEditForm(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    
    if (!formData.courseId || !formData.studentId || !formData.category || formData.score === '' || !formData.maxScore) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const gradeData = {
        courseId: formData.courseId,
        studentId: formData.studentId,
        category: formData.category,
        weight: parseFloat(formData.weight) || 10,
        score: parseFloat(formData.score),
        maxScore: parseFloat(formData.maxScore),
        feedback: formData.feedback
      }
      await updateGrade(editingGrade._id, gradeData)
      setShowEditForm(false)
      setEditingGrade(null)
      setFormData({
        courseId: '',
        studentId: '',
        category: 'Assignment',
        weight: 10,
        score: '',
        maxScore: 100,
        feedback: ''
      })
      loadData()
      setSuccessMessage('✅ Grade updated successfully!')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err) {
      console.error('Grade update error:', err)
      setError(err.message || 'Failed to update grade')
      setTimeout(() => setError(null), 4000)
    }
  }

  const filteredGrades = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return grades.filter(g => {
      const matchesCourse = filterCourse ? g.course?._id === filterCourse : true
      const matchesCategory = filterCategory ? g.category === filterCategory : true
      const haystack = [
        g.student?.name,
        g.student?.email,
        g.student?.studentId,
        g.course?.name,
        g.course?.code,
        g.category
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchesSearch = term ? haystack.includes(term) : true
      return matchesCourse && matchesCategory && matchesSearch
    })
  }, [grades, filterCourse, filterCategory, searchTerm])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterCourse, filterCategory, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredGrades.length / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const paginatedGrades = filteredGrades.slice(startIndex, startIndex + pageSize)

  const getLetterGradeColor = (grade) => {
    const colors = { A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#ef4444', F: '#dc2626' }
    return colors[grade] || '#718096'
  }

  // Compute grade statistics for students based on filtered grades
  const gradeStats = useMemo(() => {
    if (isStudent && filteredGrades.length > 0) {
      const percentages = filteredGrades.map(g => (g.score / g.maxScore) * 100)
      const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length
      return {
        average: avg.toFixed(1),
        highest: Math.max(...percentages).toFixed(1),
        lowest: Math.min(...percentages).toFixed(1)
      }
    }
    return null
  }, [filteredGrades, isStudent])

  if (loading) return <div style={{ padding: 24 }}>Loading grades...</div>

  return (
    <div style={{ padding: 24 }}>
      {/* Success Notification Banner */}
      {successMessage && (
        <div style={{
          position: 'fixed',
          top: 80,
          right: 24,
          zIndex: 9999,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
          fontWeight: 600,
          fontSize: 15,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span style={{ fontSize: 20 }}>✓</span>
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
            {isStudent ? 'My Dashboard' : 'Instructor Dashboard'}
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>All Grades</h1>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: 14 }}>
            Complete overview of your academic performance
          </p>
        </div>
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

      {/* Summary cards for students */}
      {isStudent && gradeStats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
          {/* Average Grade Card */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: 20,
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24
            }}>
              📊
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Average Grade</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{gradeStats.average}%</div>
            </div>
          </div>

          {/* Highest Grade Card */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: 20,
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24
            }}>
              📈
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Highest Grade</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{gradeStats.highest}%</div>
            </div>
          </div>

          {/* Lowest Grade Card */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: 20,
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#fed7aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24
            }}>
              📉
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Lowest Grade</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{gradeStats.lowest}%</div>
            </div>
          </div>
        </div>
      )}

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

      {/* Filters */}
      {(isInstructor || isStudent) && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 16,
          boxShadow: 'var(--shadow-lg)',
          marginBottom: 16,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>🔍 Filters:</span>
          <select
            value={filterCourse}
            onChange={e => setFilterCourse(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              minWidth: 180,
              fontSize: 14
            }}
          >
            <option value="">All Courses</option>
            {courses.map(c => (
              <option key={c._id} value={c._id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              minWidth: 180,
              fontSize: 14
            }}
          >
            <option value="">All Categories</option>
            <option value="Assignment">Assignment</option>
            <option value="Quiz">Quiz</option>
            <option value="Midterm">Midterm</option>
            <option value="Final">Final</option>
            <option value="Project">Project</option>
            <option value="Lab">Lab</option>
            <option value="Exam">Exam</option>
            <option value="Other">Other</option>
          </select>
          <div style={{ flex: 1 }}></div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Showing {filteredGrades.length} of {grades.length} grades</span>
        </div>
      )}

      {/* Create Grade Form for instructors */}
      {showCreateForm && isInstructor && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 20,
          boxShadow: 'var(--shadow-lg)',
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
                    border: '1px solid var(--border)'
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
                    border: '1px solid var(--border)',
                    background: !formData.courseId ? 'var(--gray-100)' : 'var(--surface)'
                  }}
                >
                  <option value="">{!formData.courseId ? 'Select a course first' : 'Select student...'}</option>
                  {selectedCourseStudents.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name || 'Student'} • {s.studentId || 'No ID'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid var(--border)'
                  }}
                >
                  <option value="Assignment">Assignment</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Midterm">Midterm</option>
                  <option value="Final">Final</option>
                  <option value="Exam">Exam</option>
                  <option value="Project">Project</option>
                  <option value="Lab">Lab</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Weight (%)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
                />
              </div>
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
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
                  border: '1px solid var(--border)',
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

      {/* Edit Grade Form */}
      {showEditForm && editingGrade && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 20,
          boxShadow: 'var(--shadow-lg)',
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>✏️ Edit Grade</h3>
            <button
              onClick={() => {
                setShowEditForm(false)
                setEditingGrade(null)
                setFormData({
                  courseId: '',
                  studentId: '',
                  category: 'Assignment',
                  weight: 10,
                  score: '',
                  maxScore: 100,
                  feedback: ''
                })
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600
              }}
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Course</label>
                <select
                  required
                  value={formData.courseId}
                  onChange={e => setFormData({ ...formData, courseId: e.target.value, studentId: '' })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
                  disabled
                >
                  <option value="">Select a course</option>
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
                  disabled
                >
                  <option value="">Select a student</option>
                  {selectedCourseStudents.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name || 'Student'} • {s.studentId || 'No ID'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
                >
                  <option value="Assignment">Assignment</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Midterm">Midterm</option>
                  <option value="Final">Final</option>
                  <option value="Project">Project</option>
                  <option value="Lab">Lab</option>
                  <option value="Exam">Exam</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Weight (%)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
                />
              </div>
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
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
                  border: '1px solid var(--border)',
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
              Update Grade
            </button>
          </form>
        </div>
      )}

      {/* Grades Table */}
      {filteredGrades.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 48,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          boxShadow: 'var(--shadow-lg)'
        }}>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            {isInstructor ? 'No grades yet. Use "Add Grade" to begin.' : 'No grades available yet.'}
          </p>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0 }}>Grades Table</h3>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Showing {filteredGrades.length === 0 ? 0 : `${startIndex + 1}-${Math.min(startIndex + paginatedGrades.length, filteredGrades.length)}`} of {filteredGrades.length} grades
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-100)', borderBottom: '1px solid var(--border)' }}>
                <th style={thStyle}>Course</th>
                <th style={thStyle}>Category</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Score</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Percentage</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Letter Grade</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Weight</th>
                {isInstructor && <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedGrades.map((grade, idx) => {
                const percentage = ((grade.score / grade.maxScore) * 100).toFixed(1)
                return (
                  <tr key={grade._id} style={{ borderBottom: idx < paginatedGrades.length - 1 ? '1px solid var(--border)' : 'none', hover: { background: 'var(--gray-100)' } }}>
                    <td style={tdStyle}>{grade.course ? `${grade.course.code || ''}` : 'N/A'}</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: 'var(--gray-100)',
                        color: 'var(--text)'
                      }}>
                        {grade.category || 'N/A'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600 }}>
                      {grade.score} / {grade.maxScore}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center', color: '#3b82f6', fontWeight: 700 }}>
                      {percentage}%
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: 14,
                        background: getLetterGradeColor(grade.letterGrade) + '20',
                        color: getLetterGradeColor(grade.letterGrade)
                      }}>
                        {grade.letterGrade}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600 }}>{grade.weight ? grade.weight + '%' : '10%'}</td>
                    {isInstructor && (
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEdit(grade)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 8,
                              border: '1px solid #bfdbfe',
                              background: '#eff6ff',
                              color: '#2563eb',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: 12
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(grade._id)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 8,
                              border: '1px solid #fed7d7',
                              background: '#fff5f5',
                              color: '#c53030',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: 12
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {currentPage} of {totalPages}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: currentPage === 1 ? 'var(--gray-100)' : 'var(--surface)',
                  color: 'var(--text)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: currentPage === totalPages ? 'var(--gray-100)' : 'var(--surface)',
                  color: 'var(--text)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
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

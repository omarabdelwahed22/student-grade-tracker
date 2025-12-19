import React, { useState, useEffect } from 'react'
import { getMyCourses, getAllCourses, createCourse, updateCourse, deleteCourse, enrollStudent, unenrollStudent } from '../services/courses'
import { getGrades } from '../services/grades'
import { getAllUsers } from '../services/users'

export default function Courses() {
  const [myCourses, setMyCourses] = useState([]) // Courses I created
  const [allCourses, setAllCourses] = useState([]) // All courses for dropdown
  const [allStudents, setAllStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedManagingCourse, setSelectedManagingCourse] = useState(null) // Selected from dropdown
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [notification, setNotification] = useState(null)
  const [courseDetails, setCourseDetails] = useState(null)
  const [courseGrades, setCourseGrades] = useState([])
  const [courseLoading, setCourseLoading] = useState(false)
  const [courseError, setCourseError] = useState(null)
  const [courseAverages, setCourseAverages] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: 3,
    semester: '',
    year: new Date().getFullYear()
  })

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isInstructor = user.role === 'instructor'
  const isStudent = user.role === 'student'

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

  const computeAverages = (grades) => {
    const map = {}
    grades.forEach(g => {
      const courseId = g.course?._id || g.course
      if (!courseId) return
      const percentage = g.maxScore ? (g.score / g.maxScore) * 100 : 0
      const weight = g.weight || 0
      if (!map[courseId]) {
        map[courseId] = { weightedSum: 0, weightTotal: 0, sum: 0, count: 0 }
      }
      map[courseId].sum += percentage
      map[courseId].count += 1
      map[courseId].weightedSum += percentage * weight
      map[courseId].weightTotal += weight
    })

    const letter = (pct) => {
      if (pct >= 90) return 'A'
      if (pct >= 80) return 'B'
      if (pct >= 70) return 'C'
      if (pct >= 60) return 'D'
      return 'F'
    }

    const result = {}
    Object.keys(map).forEach(cid => {
      const data = map[cid]
      const pct = data.weightTotal > 0
        ? data.weightedSum / data.weightTotal
        : data.count > 0 ? data.sum / data.count : 0
      result[cid] = {
        percentage: Math.round(pct * 100) / 100,
        letter: letter(pct)
      }
    })
    return result
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

  useEffect(() => {
    loadCourses()
    if (isInstructor) {
      loadStudents()
    }
  }, [])

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const loadStudents = async () => {
    try {
      const data = await getAllUsers()
      setAllStudents(data.users.filter(u => u.role === 'student'))
    } catch (err) {
      console.error('Failed to load students:', err)
    }
  }

  const loadCourses = async () => {
    try {
      setLoading(true)
      let data

      if (isInstructor) {
        // Load all courses to find courses where instructor enrolled students
        const allData = await getAllCourses()
        const allCoursesData = allData.courses || []
        setAllCourses(allCoursesData)
        
        // Filter courses: instructor created OR has enrolled at least one student
        const myCoursesFiltered = allCoursesData.filter(course => {
          // Course instructor is me
          const isMyCreatedCourse = course.instructor?._id === user.id
          // I enrolled at least one student in this course
          const hasMyStudents = course.students?.some(s => s.enrolledBy?._id === user.id)
          return isMyCreatedCourse || hasMyStudents
        })
        setMyCourses(myCoursesFiltered)
      } else {
        // Students see their enrolled courses
        data = await getMyCourses()
        setMyCourses(data.courses || [])
        try {
          const gRes = await getGrades({ studentId: user.id })
          const averages = computeAverages(gRes.grades || [])
          setCourseAverages(averages)
        } catch (err) {
          console.warn('Failed to load student grades for averages', err)
        }
      }
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createCourse(formData)
      setShowCreateForm(false)
      setFormData({
        name: '',
        code: '',
        description: '',
        credits: 3,
        semester: '',
        year: new Date().getFullYear()
      })
      loadCourses()
      showNotification('Course created successfully', 'success')
    } catch (err) {
      showNotification(err.message || 'Failed to create course', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return
    try {
      await deleteCourse(id)
      loadCourses()
      showNotification('Course deleted successfully', 'success')
    } catch (err) {
      showNotification(err.message || 'Failed to delete course', 'error')
    }
  }

  const handleEnrollStudent = async (studentId) => {
    try {
      await enrollStudent(selectedManagingCourse._id, studentId)
      // Reload ALL courses to refresh everything
      await loadCourses()
      showNotification('Student enrolled successfully', 'success')
    } catch (err) {
      showNotification(err.message || 'Failed to enroll student', 'error')
    }
  }

  const handleUnenrollStudent = async (studentId) => {
    try {
      await unenrollStudent(selectedManagingCourse._id, studentId)
      // Reload ALL courses to refresh everything
      await loadCourses()
      showNotification('Student unenrolled successfully', 'success')
    } catch (err) {
      showNotification(err.message || 'Failed to unenroll student', 'error')
    }
  }

  const handleOpenCourse = async (course) => {
    setCourseDetails(course)
    setCourseGrades([])
    setCourseError(null)
    try {
      setCourseLoading(true)
      const params = { courseId: course._id }
      if (isStudent && user?.id) {
        params.studentId = user.id
      }
      const res = await getGrades(params)
      const grades = (res.grades || []).slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      setCourseGrades(grades)
    } catch (err) {
      setCourseError(err.message || 'Failed to load grades')
    } finally {
      setCourseLoading(false)
    }
  }

  const handleToggleStatus = async (courseId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'in-progress' : 'completed'
      await updateCourse(courseId, { status: newStatus })
      await loadCourses()
      showNotification(`Course marked as ${newStatus === 'completed' ? 'completed' : 'in progress'}`, 'success')
    } catch (err) {
      showNotification(err.message || 'Failed to update course status', 'error')
    }
  }

  const handleSelectDropdownCourse = (courseId) => {
    const course = allCourses.find(c => c._id === courseId)
    setSelectedManagingCourse(course)
  }

  // Get students I enrolled in the selected course
  const getMyEnrolledStudents = () => {
    if (!selectedManagingCourse) return []
    return selectedManagingCourse.students?.filter(enrollment => 
      enrollment.enrolledBy?._id === user.id
    ) || []
  }

  // Get available students (not enrolled by ANY instructor in this course)
  const getAvailableStudents = () => {
    if (!selectedManagingCourse) return []
    // Get ALL enrolled student IDs (by any instructor)
    const allEnrolledIds = selectedManagingCourse.students?.map(e => e.student?._id) || []
    return allStudents.filter(s => !allEnrolledIds.includes(s._id))
  }

  if (loading) return <div style={{ padding: 24 }}>Loading courses...</div>

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>
          {isInstructor ? 'My Courses' : 'Enrolled Courses'}
        </h1>
        {isInstructor && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: '12px 24px',
              fontSize: 15,
              fontWeight: 600,
              background: 'var(--primary-gradient)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-primary)'
            }}
          >
            {showCreateForm ? 'Cancel' : '+ Create Course'}
          </button>
        )}
      </div>

      {error && (
        <div style={{
          padding: 16,
          marginBottom: 24,
          background: 'var(--error-light)',
          border: '1px solid var(--error)',
          borderRadius: 10,
          color: 'var(--error)'
        }}>
          {error}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && isInstructor && (
        <div style={{
          marginBottom: 24,
          padding: 32,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h2 style={{ marginTop: 0, fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>Create New Course</h2>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Course Name *</label>
                <input
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 15, background: 'var(--bg)', color: 'var(--text)' }}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Data Structures"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Course Code *</label>
                <input
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 15, background: 'var(--bg)', color: 'var(--text)' }}
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., CS201"
                />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Description</label>
              <textarea
                style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 15, minHeight: 80, fontFamily: 'inherit', background: 'var(--bg)', color: 'var(--text)' }}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Course description..."
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Credits</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 15, background: 'var(--bg)', color: 'var(--text)' }}
                  value={formData.credits}
                  onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Semester</label>
                <input
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 15, background: 'var(--bg)', color: 'var(--text)' }}
                  value={formData.semester}
                  onChange={e => setFormData({ ...formData, semester: e.target.value })}
                  placeholder="e.g., Fall"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Year</label>
                <input
                  type="number"
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 15, background: 'var(--bg)', color: 'var(--text)' }}
                  value={formData.year}
                  onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <button
              type="submit"
              style={{
                padding: '12px 32px',
                fontSize: 16,
                fontWeight: 600,
                background: 'var(--primary-gradient)',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-primary)'
              }}
            >
              Create Course
            </button>
          </form>
        </div>
      )}

      {/* Manage Existing Courses (Instructor Only) */}
      {isInstructor && allCourses.length > 0 && (
        <div style={{
          marginBottom: 32,
          padding: 20,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h2 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Manage Existing Courses</h2>
          <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--text-muted)' }}>Select a course to manage student enrollments</p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, maxWidth: 400 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Choose Course</label>
              <select
                value={selectedManagingCourse?._id || ''}
                onChange={(e) => handleSelectDropdownCourse(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  fontSize: 15,
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select a course...</option>
                {allCourses.filter(c => !myCourses.find(mc => mc._id === c._id)).map(course => (
                  <option key={course._id} value={course._id}>
                    {course.code} — {course.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedManagingCourse && (
              <button
                onClick={() => setShowEnrollModal(true)}
                style={{
                  padding: '12px 24px',
                  fontSize: 15,
                  fontWeight: 600,
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
              >
                Manage Students
              </button>
            )}
          </div>

          {/* Selected Course Name Display */}
          {selectedManagingCourse && !showEnrollModal && (
            <div style={{
              marginTop: 16,
              padding: 16,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 20,
                fontWeight: 700
              }}>
                📚
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {selectedManagingCourse.code}
                </div>
                <div style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                  {selectedManagingCourse.name}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Courses Grid */}
      {myCourses.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 64,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          boxShadow: 'var(--shadow-lg)'
        }}>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', margin: 0 }}>
            {isInstructor ? 'No courses created yet. Click "Create Course" to get started!' : 'You are not enrolled in any courses yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {myCourses.map(course => (
            <div
              key={course._id}
              style={{
                padding: 24,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                boxShadow: 'var(--shadow-lg)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
              }}
              onClick={() => {
                if (!isInstructor) {
                  handleOpenCourse(course)
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{course.code}</div>
                    <span style={{
                      padding: '3px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 6,
                      background: course.status === 'completed' 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : course.status === 'archived' 
                        ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {course.status === 'completed' ? '✓ Completed' : course.status === 'archived' ? 'Archived' : 'In Progress'}
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                    {course.name}
                  </h3>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {course.semester} {course.year}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  {course.status === 'completed' && courseAverages[course._id] && (() => {
                    const letter = courseAverages[course._id].letter
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

                  {isInstructor && (
                    <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!isInstructor) return
                            setSelectedManagingCourse(course)
                            setShowEnrollModal(true)
                          }}
                          style={{
                            padding: '6px 12px',
                            fontSize: 13,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          Manage
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(course._id)
                          }}
                          style={{
                            padding: '6px 12px',
                            fontSize: 13,
                            background: 'var(--error-light)',
                            color: 'var(--error)',
                            border: '1px solid var(--error)',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          Delete
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleStatus(course._id, course.status)
                        }}
                        style={{
                          padding: '6px 12px',
                          fontSize: 13,
                          background: course.status === 'completed' 
                            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontWeight: 600,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {course.status === 'completed' ? '↺ Reopen' : '✓ Complete'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {course.description && (
                <p style={{ margin: '12px 0', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {course.description}
                </p>
              )}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)' }}>
                <span>Credits: {course.credits}</span>
                <span>Students: {course.students?.length || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Detail Modal (Student) */}
      {isStudent && courseDetails && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 24,
            width: 'min(640px, 92%)',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{courseDetails.code}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{courseDetails.name}</div>
              </div>
              <button
                onClick={() => setCourseDetails(null)}
                style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-muted)' }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <span style={{
                padding: '4px 10px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                color: formatStatus(courseDetails.status).color,
                background: formatStatus(courseDetails.status).bg
              }}>
                {formatStatus(courseDetails.status).label}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{courseDetails.semester} {courseDetails.year}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Credits: {courseDetails.credits}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Completed at: {formatDate(courseDetails.completedAt)}</span>
            </div>

            <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
              {courseDetails.description || 'No description provided.'}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, color: 'var(--text)' }}>Recent Grades</div>
                {courseLoading && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading...</span>}
              </div>
              {courseError && (
                <div style={{ color: 'var(--error)', fontSize: 13, marginBottom: 8 }}>{courseError}</div>
              )}
              {!courseLoading && courseGrades.length === 0 && !courseError && (
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No grades yet for this course.</div>
              )}
              {courseGrades.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {courseGrades.slice(0, 5).map(g => (
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {showEnrollModal && selectedManagingCourse && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 32,
            maxWidth: 600,
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>Manage Students - {selectedManagingCourse.name}</h2>
              <button
                onClick={() => setShowEnrollModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                ×
              </button>
            </div>

            {/* My Enrolled Students */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>
                Your Students ({getMyEnrolledStudents().length})
              </h3>
              {getMyEnrolledStudents().length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {getMyEnrolledStudents().map(enrollment => (
                    <div key={enrollment._id} style={{
                      padding: 12,
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{enrollment.student?.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{enrollment.student?.email}</div>
                        {enrollment.student?.studentId && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID: {enrollment.student?.studentId}</div>
                        )}
                      </div>
                      <button
                        onClick={() => handleUnenrollStudent(enrollment.student?._id)}
                        style={{
                          padding: '6px 12px',
                          fontSize: 13,
                          background: 'var(--error-light)',
                          color: 'var(--error)',
                          border: '1px solid var(--error)',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Unenroll
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No students enrolled by you yet.</p>
              )}
            </div>

            {/* Available Students */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text)' }}>Available Students</h3>
              {getAvailableStudents().length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {getAvailableStudents().map(student => (
                    <div key={student._id} style={{
                      padding: 12,
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{student.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{student.email}</div>
                        {student.studentId && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID: {student.studentId}</div>
                        )}
                      </div>
                      <button
                        onClick={() => handleEnrollStudent(student._id)}
                        style={{
                          padding: '6px 12px',
                          fontSize: 13,
                          background: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Enroll
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>All students are enrolled.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          padding: '16px 24px',
          background: notification.type === 'success' ? 'var(--success)' : 'var(--error)',
          color: 'white',
          borderRadius: 12,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          fontSize: 14,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 2000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span style={{ fontSize: 18 }}>
            {notification.type === 'success' ? '✓' : '!'}
          </span>
          {notification.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

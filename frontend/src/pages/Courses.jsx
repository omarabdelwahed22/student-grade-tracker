import React, { useState, useEffect } from 'react'
import { getMyCourses, createCourse, deleteCourse, enrollStudent, unenrollStudent } from '../services/courses'
import { getAllUsers } from '../services/users'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
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

  useEffect(() => {
    loadCourses()
    if (isInstructor) {
      loadStudents()
    }
  }, [])

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
      const data = await getMyCourses()
      setCourses(data.courses || [])
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
    } catch (err) {
      alert(err.message || 'Failed to create course')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return
    try {
      await deleteCourse(id)
      loadCourses()
    } catch (err) {
      alert(err.message || 'Failed to delete course')
    }
  }

  const handleEnrollStudent = async (studentId) => {
    try {
      await enrollStudent(selectedCourse._id, studentId)
      loadCourses()
      alert('Student enrolled successfully')
    } catch (err) {
      alert(err.message || 'Failed to enroll student')
    }
  }

  const handleUnenrollStudent = async (studentId) => {
    try {
      await unenrollStudent(selectedCourse._id, studentId)
      loadCourses()
      alert('Student unenrolled successfully')
    } catch (err) {
      alert(err.message || 'Failed to unenroll student')
    }
  }

  const openEnrollModal = (course) => {
    setSelectedCourse(course)
    setShowEnrollModal(true)
  }

  if (loading) return <div style={{ padding: 24 }}>Loading courses...</div>

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
          {isInstructor ? 'My Courses' : 'Enrolled Courses'}
        </h1>
        {isInstructor && (
          <button
            className="btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: '12px 24px',
              fontSize: 15,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
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
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: 10,
          color: '#c33'
        }}>
          {error}
        </div>
      )}

      {showCreateForm && isInstructor && (
        <div className="card" style={{
          marginBottom: 24,
          padding: 32,
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ marginTop: 0, fontSize: 20, fontWeight: 600 }}>Create New Course</h2>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                  Course Name *
                </label>
                <input
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 15
                  }}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Data Structures"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                  Course Code *
                </label>
                <input
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 15
                  }}
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., CS201"
                />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                Description
              </label>
              <textarea
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 15,
                  minHeight: 80,
                  fontFamily: 'inherit'
                }}
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
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 15
                  }}
                  value={formData.credits}
                  onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Semester</label>
                <input
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 15
                  }}
                  value={formData.semester}
                  onChange={e => setFormData({ ...formData, semester: e.target.value })}
                  placeholder="e.g., Fall"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Year</label>
                <input
                  type="number"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 15
                  }}
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
            >
              Create Course
            </button>
          </form>
        </div>
      )}

      {courses.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 64,
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          <p style={{ fontSize: 18, color: '#718096', margin: 0 }}>
            {isInstructor ? 'No courses created yet. Click "Create Course" to get started!' : 'You are not enrolled in any courses yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {courses.map(course => (
            <div
              key={course._id}
              className="card"
              style={{
                padding: 24,
                background: 'white',
                borderRadius: 16,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: 18, fontWeight: 600 }}>{course.name}</h3>
                  <p style={{ margin: 0, fontSize: 14, color: '#667eea', fontWeight: 600 }}>{course.code}</p>
                </div>
                {isInstructor && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(course._id)
                    }}
                    style={{
                      padding: '6px 12px',
                      fontSize: 13,
                      background: '#fee',
                      color: '#c33',
                      border: '1px solid #fcc',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
              {course.description && (
                <p style={{ margin: '12px 0', fontSize: 14, color: '#718096', lineHeight: 1.6 }}>
                  {course.description}
                </p>
              )}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#718096' }}>
                  <span>Credits: {course.credits}</span>
                  {course.semester && <span>{course.semester} {course.year}</span>}
                </div>
                {isInstructor ? (
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#718096' }}>
                      Students: {course.students?.length || 0}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEnrollModal(course)
                      }}
                      style={{
                        padding: '6px 12px',
                        fontSize: 13,
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Manage Students
                    </button>
                  </div>
                ) : (
                  course.instructor?.email && (
                    <div style={{ marginTop: 8, fontSize: 13, color: '#718096' }}>
                      Instructor: {course.instructor.email}
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Enrollment Modal */}
      {showEnrollModal && selectedCourse && (
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
            background: 'white',
            borderRadius: 16,
            padding: 32,
            maxWidth: 600,
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
                Manage Students - {selectedCourse.name}
              </h2>
              <button
                onClick={() => setShowEnrollModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: '#718096'
                }}
              >
                ×
              </button>
            </div>

            {/* Enrolled Students */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                Enrolled Students ({selectedCourse.students?.length || 0})
              </h3>
              {selectedCourse.students && selectedCourse.students.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedCourse.students.map(student => (
                    <div key={student._id} style={{
                      padding: 12,
                      background: '#f7fafc',
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{student.name}</div>
                        <div style={{ fontSize: 13, color: '#718096' }}>{student.email}</div>
                        {student.studentId && (
                          <div style={{ fontSize: 12, color: '#a0aec0' }}>ID: {student.studentId}</div>
                        )}
                      </div>
                      <button
                        onClick={() => handleUnenrollStudent(student._id)}
                        style={{
                          padding: '6px 12px',
                          fontSize: 13,
                          background: '#fee',
                          color: '#c33',
                          border: '1px solid #fcc',
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
                <p style={{ color: '#718096', fontSize: 14 }}>No students enrolled yet.</p>
              )}
            </div>

            {/* Available Students to Enroll */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                Available Students
              </h3>
              {allStudents.filter(s => !selectedCourse.students?.some(enrolled => enrolled._id === s._id)).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {allStudents
                    .filter(s => !selectedCourse.students?.some(enrolled => enrolled._id === s._id))
                    .map(student => (
                      <div key={student._id} style={{
                        padding: 12,
                        background: '#f7fafc',
                        borderRadius: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{student.name}</div>
                          <div style={{ fontSize: 13, color: '#718096' }}>{student.email}</div>
                          {student.studentId && (
                            <div style={{ fontSize: 12, color: '#a0aec0' }}>ID: {student.studentId}</div>
                          )}
                        </div>
                        <button
                          onClick={() => handleEnrollStudent(student._id)}
                          style={{
                            padding: '6px 12px',
                            fontSize: 13,
                            background: '#667eea',
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
                <p style={{ color: '#718096', fontSize: 14 }}>All students are enrolled in this course.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

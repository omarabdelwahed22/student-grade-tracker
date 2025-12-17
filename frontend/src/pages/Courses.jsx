import React, { useState, useEffect } from 'react'
import { getMyCourses, createCourse, deleteCourse } from '../services/courses'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
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
  }, [])

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
                  <div style={{ marginTop: 8, fontSize: 13, color: '#718096' }}>
                    Students: {course.students?.length || 0}
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
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { getMyCourses } from '../services/courses'
import { createAssignment, getAssignmentsByCourse, getUpcomingAssignments, updateAssignment, deleteAssignment } from '../services/assignments'

export default function Assignments() {
  const [assignments, setAssignments] = useState([])
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    category: 'Homework',
    maxScore: 100,
    weight: 10
  })

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isInstructor = user.role === 'instructor'
  const isStudent = user.role === 'student'

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      loadAssignments(selectedCourse._id)
    }
  }, [selectedCourse])

  const loadData = async () => {
    try {
      setLoading(true)
      const coursesData = await getMyCourses()
      setCourses(coursesData.courses || [])
      
      if (isStudent) {
        const upcomingData = await getUpcomingAssignments()
        setAssignments(upcomingData)
      } else if (coursesData.courses?.length > 0) {
        setSelectedCourse(coursesData.courses[0])
      }
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const loadAssignments = async (courseId) => {
    try {
      setLoading(true)
      const data = await getAssignmentsByCourse(courseId)
      setAssignments(data)
    } catch (err) {
      setError(err.message || 'Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      if (editingAssignment) {
        await updateAssignment(editingAssignment._id, formData)
      } else {
        await createAssignment(
          formData.title,
          formData.description,
          formData.courseId,
          formData.dueDate,
          formData.category,
          formData.maxScore,
          formData.weight
        )
      }
      setShowCreateForm(false)
      setEditingAssignment(null)
      resetForm()
      if (selectedCourse) loadAssignments(selectedCourse._id)
    } catch (err) {
      alert(err.message || 'Failed to save assignment')
    }
  }

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment)
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      courseId: assignment.course._id,
      dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
      category: assignment.category,
      maxScore: assignment.maxScore,
      weight: assignment.weight
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return
    try {
      await deleteAssignment(id)
      if (selectedCourse) loadAssignments(selectedCourse._id)
    } catch (err) {
      alert(err.message || 'Failed to delete assignment')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      courseId: selectedCourse?._id || '',
      dueDate: '',
      category: 'Homework',
      maxScore: 100,
      weight: 10
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date()
  }

  const getDaysUntilDue = (dueDate) => {
    const diff = new Date(dueDate) - new Date()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days < 0) return `${Math.abs(days)} days overdue`
    if (days === 0) return 'Due today'
    if (days === 1) return 'Due tomorrow'
    return `Due in ${days} days`
  }

  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: 'var(--text)',
      margin: 0
    },
    courseSelector: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      flexWrap: 'wrap'
    },
    courseBtn: (active) => ({
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '600',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      background: active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'var(--surface)',
      color: active ? 'white' : 'var(--text)',
      border: active ? 'none' : '1px solid var(--border)',
      transition: 'all 0.2s',
      boxShadow: active ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
    }),
    createBtn: {
      padding: '12px 24px',
      fontSize: '15px',
      fontWeight: '600',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
    },
    form: {
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: 'var(--shadow-sm)'
    },
    formRow: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '600',
      color: 'var(--text)'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '15px',
      border: '2px solid var(--border)',
      borderRadius: '10px',
      outline: 'none',
      transition: 'border-color 0.2s',
      background: 'var(--bg)',
      color: 'var(--text)'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '15px',
      border: '2px solid var(--border)',
      borderRadius: '10px',
      outline: 'none',
      background: 'var(--bg)',
      color: 'var(--text)'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '15px',
      border: '2px solid var(--border)',
      borderRadius: '10px',
      outline: 'none',
      resize: 'vertical',
      minHeight: '100px',
      background: 'var(--bg)',
      color: 'var(--text)'
    },
    formActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end'
    },
    assignmentCard: (status) => ({
      background: 'var(--surface)',
      border: status === 'overdue' ? '1px solid #fca5a5' : '1px solid var(--border)',
      borderLeft: status === 'overdue' ? '4px solid #dc2626' : 
                   status === 'upcoming' ? '4px solid #fbbf24' : '4px solid #667eea',
      borderRadius: '14px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: 'var(--shadow-sm)',
      transition: 'all 0.2s'
    }),
    assignmentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    assignmentTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: 'var(--text)',
      margin: '0 0 4px 0'
    },
    assignmentMeta: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      marginBottom: '12px'
    },
    badge: (type) => {
      const colors = {
        Homework: { bg: '#dbeafe', color: '#1e40af' },
        Quiz: { bg: '#fef3c7', color: '#92400e' },
        Midterm: { bg: '#fce7f3', color: '#9f1239' },
        Final: { bg: '#fee2e2', color: '#991b1b' },
        Project: { bg: '#ddd6fe', color: '#5b21b6' },
        Lab: { bg: '#d1fae5', color: '#065f46' },
        Exam: { bg: '#ffe4e6', color: '#9f1239' },
        Other: { bg: '#e5e7eb', color: '#374151' }
      }
      const style = colors[type] || colors.Other
      return {
        padding: '4px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        background: style.bg,
        color: style.color
      }
    },
    assignmentDescription: {
      fontSize: '14px',
      color: 'var(--text-muted)',
      marginBottom: '12px',
      lineHeight: '1.5'
    },
    assignmentFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    dueDate: (overdue) => ({
      fontSize: '14px',
      fontWeight: '600',
      color: overdue ? '#dc2626' : 'var(--text-muted)'
    }),
    actions: {
      display: 'flex',
      gap: '8px'
    },
    actionBtn: {
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: '600',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      cursor: 'pointer',
      background: 'var(--surface)',
      color: 'var(--text)',
      transition: 'all 0.2s'
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>
  if (error) return <div style={{ padding: 20, color: 'var(--danger)' }}>Error: {error}</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          {isInstructor ? 'Assignment Management' : 'Upcoming Assignments'}
        </h1>
        {isInstructor && selectedCourse && (
          <button style={styles.createBtn} onClick={() => {
            setShowCreateForm(!showCreateForm)
            setEditingAssignment(null)
            resetForm()
          }}>
            {showCreateForm ? 'Cancel' : '+ Create Assignment'}
          </button>
        )}
      </div>

      {isInstructor && courses.length > 0 && (
        <div style={styles.courseSelector}>
          {courses.map(course => (
            <button
              key={course._id}
              style={styles.courseBtn(selectedCourse?._id === course._id)}
              onClick={() => setSelectedCourse(course)}
            >
              {course.code}
            </button>
          ))}
        </div>
      )}

      {showCreateForm && (
        <form style={styles.form} onSubmit={handleCreate}>
          <div style={styles.formRow}>
            <label style={styles.label}>Title</label>
            <input
              style={styles.input}
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Assignment title"
            />
          </div>

          <div style={styles.formRow}>
            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Assignment instructions..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={styles.label}>Course</label>
              <select
                style={styles.select}
                required
                value={formData.courseId}
                onChange={e => setFormData({ ...formData, courseId: e.target.value })}
              >
                <option value="">Select course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>Due Date</label>
              <input
                style={styles.input}
                type="datetime-local"
                required
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={styles.label}>Category</label>
              <select
                style={styles.select}
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {['Homework', 'Quiz', 'Midterm', 'Final', 'Project', 'Lab', 'Exam', 'Other'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>Max Score</label>
              <input
                style={styles.input}
                type="number"
                min="1"
                required
                value={formData.maxScore}
                onChange={e => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label style={styles.label}>Weight (%)</label>
              <input
                style={styles.input}
                type="number"
                min="0"
                max="100"
                required
                value={formData.weight}
                onChange={e => setFormData({ ...formData, weight: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div style={styles.formActions}>
            <button
              type="button"
              style={{ ...styles.actionBtn, color: '#dc2626' }}
              onClick={() => {
                setShowCreateForm(false)
                setEditingAssignment(null)
                resetForm()
              }}
            >
              Cancel
            </button>
            <button type="submit" style={styles.createBtn}>
              {editingAssignment ? 'Update' : 'Create'} Assignment
            </button>
          </div>
        </form>
      )}

      {assignments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            No assignments {isStudent ? 'due soon' : 'found'}
          </div>
          <div style={{ fontSize: 14 }}>
            {isStudent ? 'You\'re all caught up!' : 'Create your first assignment to get started'}
          </div>
        </div>
      ) : (
        <div>
          {assignments.map(assignment => {
            const overdue = isOverdue(assignment.dueDate) && assignment.status === 'pending'
            const upcoming = getDaysUntilDue(assignment.dueDate).includes('days') && parseInt(getDaysUntilDue(assignment.dueDate)) <= 3
            const status = overdue ? 'overdue' : upcoming ? 'upcoming' : 'normal'

            return (
              <div key={assignment._id} style={styles.assignmentCard(status)}>
                <div style={styles.assignmentHeader}>
                  <div>
                    <h3 style={styles.assignmentTitle}>{assignment.title}</h3>
                    {isStudent && (
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {assignment.course.code} - {assignment.course.name}
                      </div>
                    )}
                  </div>
                  {isInstructor && (
                    <div style={styles.actions}>
                      <button
                        style={styles.actionBtn}
                        onClick={() => handleEdit(assignment)}
                      >
                        Edit
                      </button>
                      <button
                        style={{ ...styles.actionBtn, color: '#dc2626' }}
                        onClick={() => handleDelete(assignment._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <div style={styles.assignmentMeta}>
                  <span style={styles.badge(assignment.category)}>{assignment.category}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Max: {assignment.maxScore} pts
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Weight: {assignment.weight}%
                  </span>
                </div>

                {assignment.description && (
                  <p style={styles.assignmentDescription}>{assignment.description}</p>
                )}

                <div style={styles.assignmentFooter}>
                  <div style={styles.dueDate(overdue)}>
                    📅 {formatDate(assignment.dueDate)}
                    <span style={{ marginLeft: 8, fontSize: 13 }}>
                      ({getDaysUntilDue(assignment.dueDate)})
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

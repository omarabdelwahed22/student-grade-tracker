import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { getCourseAnalytics } from '../services/grades'
import { getMyCourses } from '../services/courses'

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isInstructor = user.role === 'instructor'

  useEffect(() => {
    if (isInstructor) {
      loadInstructorData()
    } else {
      fetchStudentAnalytics()
    }
  }, [])

  const fetchStudentAnalytics = async () => {
    try {
      setLoading(true)
      const data = await api.get('/grades/analytics')
      setAnalytics(data.analytics)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadInstructorData = async () => {
    try {
      setLoading(true)
      const data = await getMyCourses()
      const ownedCourses = data.courses || []
      setCourses(ownedCourses)

      if (ownedCourses.length) {
        const initialCourseId = ownedCourses[0]._id
        setSelectedCourse(initialCourseId)
        await fetchCourseAnalytics(initialCourseId)
      } else {
        setAnalytics(null)
      }
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourseAnalytics = async (courseId) => {
    try {
      setLoading(true)
      const data = await getCourseAnalytics(courseId)
      setAnalytics(data.analytics)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '24px',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px'
    },
    titleGroup: {
      minWidth: '260px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: 'var(--text)',
      margin: '0 0 6px 0'
    },
    subtitle: {
      fontSize: '15px',
      color: 'var(--text-muted)',
      margin: 0
    },
    select: {
      padding: '12px 14px',
      borderRadius: '10px',
      border: '1px solid var(--border)',
      fontSize: 15,
      minWidth: '220px',
      background: 'var(--surface)',
      color: 'var(--text)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '18px',
      boxShadow: 'var(--shadow-sm)'
    },
    statLabel: {
      fontSize: '12px',
      fontWeight: '700',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '6px'
    },
    statValue: {
      fontSize: '30px',
      fontWeight: '800',
      color: 'var(--text)',
      margin: 0
    },
    statHint: {
      marginTop: 6,
      fontSize: 13,
      color: 'var(--text-muted)'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: 'var(--text)',
      marginBottom: '16px'
    },
    card: {
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: 'var(--shadow-sm)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: '12px',
      borderBottom: '2px solid var(--border)',
      fontSize: '13px',
      fontWeight: '700',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid var(--border)',
      fontSize: '14px',
      color: 'var(--text)'
    },
    badge: {
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '700'
    },
    badgeMuted: {
      background: 'var(--bg)',
      color: 'var(--text-muted)'
    },
    chartContainer: {
      marginTop: '12px'
    },
    bar: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '10px',
      gap: '12px'
    },
    barLabel: {
      minWidth: '120px',
      fontSize: '14px',
      fontWeight: '600',
      color: 'var(--text)'
    },
    barTrack: {
      flex: 1,
      height: '24px',
      background: 'var(--bg)',
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative'
    },
    barFill: (percentage) => ({
      height: '100%',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      width: `${percentage}%`,
      transition: 'width 0.4s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: '8px'
    }),
    barValue: {
      color: 'white',
      fontSize: '12px',
      fontWeight: '700'
    }
  }

  const getGradeBadgeColor = (percentage) => {
    const pct = parseFloat(percentage)
    if (pct >= 90) return { background: '#d1fae5', color: '#065f46' }
    if (pct >= 80) return { background: '#ddd6fe', color: '#5b21b6' }
    if (pct >= 70) return { background: '#fef3c7', color: '#92400e' }
    return { background: '#fee2e2', color: '#991b1b' }
  }

  const renderInstructorView = () => {
    if (!courses.length) {
      return <div style={{ padding: 20 }}>No courses found. Create a course to see analytics.</div>
    }

    if (!analytics) {
      return <div style={{ padding: 20 }}>Select a course to view analytics.</div>
    }

    return (
      <>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Course</div>
            <div style={styles.statValue}>
              {analytics.course?.code || ''}
            </div>
            <div style={styles.statHint}>{analytics.course?.name}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Overall Average</div>
            <div style={styles.statValue}>{analytics.averageScore}%</div>
            <div style={styles.statHint}>Weighted across all grades</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Grades</div>
            <div style={styles.statValue}>{analytics.totalGrades}</div>
            <div style={styles.statHint}>All recorded items</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Unique Students</div>
            <div style={styles.statValue}>{analytics.totalStudents}</div>
            <div style={{ ...styles.statHint, textTransform: 'capitalize' }}>
              Status: {analytics.course?.status || 'in-progress'}
            </div>
          </div>
        </div>

        {analytics.gradeDistribution && analytics.gradeDistribution.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Grade Distribution</h2>
            <div style={styles.chartContainer}>
              {analytics.gradeDistribution.map((bucket, idx) => (
                <div key={idx} style={styles.bar}>
                  <div style={styles.barLabel}>{bucket.label}</div>
                  <div style={styles.barTrack}>
                    <div style={styles.barFill(parseFloat(bucket.percentage))}>
                      <span style={styles.barValue}>{bucket.percentage}%</span>
                    </div>
                  </div>
                  <span style={{ ...styles.badge, ...styles.badgeMuted }}>{bucket.count} students</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {analytics.byCategory && analytics.byCategory.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Performance by Category</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Average</th>
                  <th style={styles.th}>Items</th>
                </tr>
              </thead>
              <tbody>
                {analytics.byCategory.map((cat, idx) => (
                  <tr key={idx}>
                    <td style={styles.td}>{cat.category}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...getGradeBadgeColor(cat.average) }}>
                        {cat.average}%
                      </span>
                    </td>
                    <td style={styles.td}>{cat.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {analytics.recentGrades && analytics.recentGrades.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Recent Grades</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Assignment</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Score</th>
                  <th style={styles.th}>Grade</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentGrades.map((grade, idx) => (
                  <tr key={idx}>
                    <td style={styles.td}>{grade.studentName}</td>
                    <td style={styles.td}>{grade.assignmentName}</td>
                    <td style={styles.td}>{grade.category}</td>
                    <td style={styles.td}>{grade.score}/{grade.maxScore}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...getGradeBadgeColor(grade.percentage) }}>
                        {grade.percentage}%
                      </span>
                    </td>
                    <td style={styles.td}>{new Date(grade.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    )
  }

  const renderStudentView = () => {
    if (!analytics) return <div style={{ padding: 20 }}>No analytics data available</div>

    return (
      <>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Grades</div>
            <div style={styles.statValue}>{analytics.totalGrades}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Overall Average</div>
            <div style={styles.statValue}>{analytics.averageScore}%</div>
          </div>
        </div>

        {analytics.byCourse && analytics.byCourse.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Performance by Course</h2>
            <div style={styles.chartContainer}>
              {analytics.byCourse.map((course, idx) => (
                <div key={idx} style={styles.bar}>
                  <div style={styles.barLabel}>{course.courseCode}</div>
                  <div style={styles.barTrack}>
                    <div style={styles.barFill(parseFloat(course.average))}>
                      <span style={styles.barValue}>{course.average}%</span>
                    </div>
                  </div>
                  <span style={{ ...styles.badge, ...getGradeBadgeColor(course.average) }}>
                    {course.letterGrade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {analytics.byCategory && analytics.byCategory.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Performance by Category</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Average</th>
                  <th style={styles.th}>Count</th>
                </tr>
              </thead>
              <tbody>
                {analytics.byCategory.map((cat, idx) => (
                  <tr key={idx}>
                    <td style={styles.td}>{cat.category}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...getGradeBadgeColor(cat.average) }}>
                        {cat.average}%
                      </span>
                    </td>
                    <td style={styles.td}>{cat.count} grades</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {analytics.recentGrades && analytics.recentGrades.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Recent Grades</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Course</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Score</th>
                  <th style={styles.th}>Grade</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentGrades.map((grade, idx) => (
                  <tr key={idx}>
                    <td style={styles.td}>{grade.courseName}</td>
                    <td style={styles.td}>{grade.category}</td>
                    <td style={styles.td}>{grade.score}/{grade.maxScore}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...getGradeBadgeColor(grade.percentage) }}>
                        {grade.percentage}%
                      </span>
                    </td>
                    <td style={styles.td}>{new Date(grade.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    )
  }

  if (loading) return <div style={{ padding: 20 }}>Loading analytics...</div>
  if (error) return <div style={{ padding: 20, color: 'var(--danger)' }}>Error: {error}</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <h1 style={styles.title}>{isInstructor ? 'Instructor Analytics' : 'Grade Analytics'}</h1>
          <p style={styles.subtitle}>
            {isInstructor ? 'Select a course to view detailed performance.' : 'Comprehensive view of your academic performance.'}
          </p>
        </div>

        {isInstructor && courses.length > 0 && (
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value)
              fetchCourseAnalytics(e.target.value)
            }}
            style={styles.select}
          >
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.code} — {course.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {isInstructor ? renderInstructorView() : renderStudentView()}
    </div>
  )
}

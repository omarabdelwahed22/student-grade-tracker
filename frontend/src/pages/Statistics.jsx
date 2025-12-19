import React, { useEffect, useMemo, useState } from 'react'
import { getMyCourses } from '../services/courses'
import { getGrades, getGpa } from '../services/grades'

export default function Statistics() {
  const [courses, setCourses] = useState([])
  const [grades, setGrades] = useState([])
  const [gpa, setGpa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isInstructor = user.role === 'instructor'

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        if (isInstructor) {
          const [cRes, gRes] = await Promise.all([
            getMyCourses(),
            getGrades()
          ])
          setCourses(cRes.courses || [])
          setGrades(gRes.grades || [])
        } else {
          const [cRes, gRes, gpaRes] = await Promise.all([
            getMyCourses(),
            getGrades(),
            getGpa()
          ])
          setCourses(cRes.courses || [])
          setGrades(gRes.grades || [])
          setGpa(gpaRes)
        }
      } catch (err) {
        setError(err.message || 'Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isInstructor])

  if (loading) return <div style={{ padding: 24 }}>Loading statistics...</div>

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>
          {isInstructor ? 'Teaching Statistics' : 'Academic Statistics'}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
          {isInstructor ? 'Comprehensive overview of your courses and students' : 'Your academic performance overview'}
        </p>
      </div>

      {error && (
        <div style={{
          padding: 16,
          marginBottom: 24,
          background: 'var(--error-light)',
          border: '1px solid var(--error)',
          color: 'var(--error)',
          borderRadius: 12
        }}>
          {error}
        </div>
      )}

      {isInstructor ? <InstructorStats courses={courses} grades={grades} /> : <StudentStats courses={courses} grades={grades} gpa={gpa} />}
    </div>
  )
}

function StudentStats({ courses, grades, gpa }) {
  // Grade distribution
  const gradeDistribution = grades.reduce((acc, grade) => {
    const letter = grade.letterGrade || 'N/A'
    acc[letter] = (acc[letter] || 0) + 1
    return acc
  }, {})

  // Category performance
  const categoryStats = grades.reduce((acc, grade) => {
    const cat = grade.category || 'Other'
    if (!acc[cat]) acc[cat] = { total: 0, count: 0, scores: [] }
    const pct = (grade.score / grade.maxScore) * 100
    acc[cat].total += pct
    acc[cat].count++
    acc[cat].scores.push(pct)
    return acc
  }, {})

  const categoryData = Object.entries(categoryStats).map(([name, data]) => ({
    name,
    average: (data.total / data.count).toFixed(1),
    count: data.count
  }))

  // Course-level performance derived from GPA breakdown when available
  const courseLookup = courses.reduce((acc, course) => {
    const id = String(course._id || course.id || course.courseId || '')
    if (id) acc[id] = course
    return acc
  }, {})

  const courseBreakdown = (gpa?.breakdown || []).map(entry => {
    const meta = courseLookup[String(entry.courseId)] || {}
    return {
      ...entry,
      displayName: entry.courseName || meta.name || meta.title || 'Course',
      code: meta.code || meta.courseCode || entry.courseCode || 'N/A',
      credits: meta.credits || entry.credits || '—'
    }
  })

  const completedCourses = courseBreakdown.filter(c => c.status === 'completed')
  const inProgressCourses = courseBreakdown.filter(c => c.status !== 'completed')

  const topCourseSource = completedCourses.length ? completedCourses : courseBreakdown
  const topCourse = topCourseSource.reduce((best, current) => {
    if (current?.percentage == null || Number.isNaN(current.percentage)) return best
    if (!best || current.percentage > best.percentage) return current
    return best
  }, null)

  return (
    <div>
      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard
          title="Completed GPA"
          value={gpa?.gpa?.toFixed(2) || '0.00'}
          subtitle="completed courses only"
          icon="🎯"
          color="#667eea"
        />
        <StatCard
          title="Projected GPA"
          value={gpa?.projectedGpa?.toFixed(2) || gpa?.gpa?.toFixed(2) || '0.00'}
          subtitle="including in-progress"
          icon="📈"
          color="#10b981"
        />
        <StatCard
          title="Total Courses"
          value={courses.length}
          subtitle="enrolled"
          icon="📚"
          color="#0ea5e9"
        />
        {topCourse && (
          <StatCard
            title="Best Course"
            value={`${topCourse.percentage.toFixed(1)}%`}
            subtitle={`${topCourse.displayName} • ${topCourse.code}`}
            icon="🏆"
            color="#f59e0b"
          />
        )}
        <StatCard
          title="Total Credits"
          value={gpa?.totalCredits || 0}
          subtitle="completed"
          icon="⭐"
          color="#8b5cf6"
        />
      </div>

      {/* Grade Distribution */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
          Grade Distribution
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16 }}>
          {['A', 'B', 'C', 'D', 'F'].map(letter => (
            <div key={letter} style={{
              textAlign: 'center',
              padding: 16,
              background: 'var(--bg)',
              borderRadius: 12,
              border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: getGradeColor(letter) }}>
                {gradeDistribution[letter] || 0}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginTop: 4 }}>
                Grade {letter}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Performance */}
      {categoryData.length > 0 && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
          boxShadow: 'var(--shadow-lg)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
            Performance by Category
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {categoryData.map(cat => (
              <div key={cat.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 12,
                background: 'var(--bg)',
                borderRadius: 10,
                border: '1px solid var(--border)'
              }}>
                <div style={{ minWidth: 120, fontWeight: 600, color: 'var(--text)' }}>
                  {cat.name}
                </div>
                <div style={{ flex: 1, height: 32, background: 'var(--border)', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    height: '100%',
                    width: `${cat.average}%`,
                    background: `linear-gradient(90deg, ${getCategoryColor(parseFloat(cat.average))} 0%, ${getCategoryColor(parseFloat(cat.average))}dd 100%)`,
                    transition: 'width 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: 12
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
                      {cat.average}%
                    </span>
                  </div>
                </div>
                <div style={{ minWidth: 80, textAlign: 'right', fontSize: 13, color: 'var(--text-muted)' }}>
                  {cat.count} grades
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Performance */}
      {courseBreakdown && courseBreakdown.length > 0 && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 24,
          boxShadow: 'var(--shadow-lg)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
            Course Performance
          </h2>
          <div style={{ display: 'grid', gap: 20 }}>
            {completedCourses.length > 0 && (
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>Completed</div>
                {completedCourses.map(course => (
                  <CoursePerformanceCard key={course.courseId} course={course} />
                ))}
              </div>
            )}

            {inProgressCourses.length > 0 && (
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>In Progress (Projected)</div>
                {inProgressCourses.map(course => (
                  <CoursePerformanceCard key={course.courseId} course={course} projected />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CoursePerformanceCard({ course, projected = false }) {
  return (
    <div style={{
      padding: 16,
      background: 'var(--bg)',
      borderRadius: 12,
      border: '1px solid var(--border)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
            {course.displayName}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {course.code} • {course.credits} credits
          </div>
          <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
            <span style={{
              padding: '4px 8px',
              borderRadius: 999,
              background: course.status === 'completed' ? '#10b98122' : '#f59e0b22',
              color: course.status === 'completed' ? '#10b981' : '#f59e0b',
              border: `1px solid ${course.status === 'completed' ? '#10b98144' : '#f59e0b44'}`
            }}>
              {course.status === 'completed' ? 'Completed' : 'In Progress'}
            </span>
            {projected && (
              <span style={{ color: 'var(--text-muted)' }}>Projected</span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: getCategoryColor(course.percentage) }}>
            {course.percentage}%
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
            {course.points.toFixed(2)} GPA
          </div>
        </div>
      </div>
    </div>
  )
}

function InstructorStats({ courses, grades }) {
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Calculate stats
  const uniqueStudents = new Set()
  courses.forEach(c => {
    const students = c.students || []
    students.forEach(enrollment => {
      const student = enrollment.student || enrollment
      uniqueStudents.add(String(student._id || student))
    })
  })
  
  let totalScore = 0, totalMaxScore = 0
  grades.forEach(g => {
    totalScore += g.score || 0
    totalMaxScore += g.maxScore || 0
  })
  const overallAverage = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(1) : 0

  // Map grades by course for quick lookup
  const gradesByCourse = useMemo(() => {
    const map = new Map()
    grades.forEach(g => {
      const cid = String(g.course?._id || g.course || '')
      if (!cid) return
      if (!map.has(cid)) map.set(cid, [])
      map.get(cid).push(g)
    })
    return map
  }, [grades])

  // Compute final (weighted) course grade per student for a course
  const finalCourseDistribution = useMemo(() => {
    const cid = selectedCourseId ? String(selectedCourseId) : ''
    if (!cid) return { distribution: {}, count: 0 }
    const courseGrades = gradesByCourse.get(cid) || []
    const perStudent = new Map()
    courseGrades.forEach(g => {
      const sid = String(g.student?._id || g.student || '')
      if (!sid) return
      const current = perStudent.get(sid) || { weighted: 0, weightSum: 0 }
      const weight = Number.isFinite(g.weight) ? g.weight : 10
      const pct = (g.score / g.maxScore) * weight
      current.weighted += pct
      current.weightSum += weight
      perStudent.set(sid, current)
    })

    const distribution = {}
    perStudent.forEach(({ weighted, weightSum }) => {
      if (!weightSum) return
      const pct = (weighted / weightSum) * 100
      const letter = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F'
      distribution[letter] = (distribution[letter] || 0) + 1
    })

    return { distribution, count: perStudent.size, courseId: cid }
  }, [selectedCourseId, gradesByCourse])

  // Get unique categories for selected course
  const categoriesForCourse = useMemo(() => {
    if (!selectedCourseId) return []
    const set = new Set()
    grades.forEach(g => {
      if (String(g.course?._id || g.course) === selectedCourseId && g.category) {
        set.add(g.category)
      }
    })
    return Array.from(set)
  }, [selectedCourseId, grades])

  // Filter grades based on selections
  let filteredGrades = grades
  if (selectedCourseId) {
    filteredGrades = filteredGrades.filter(g => String(g.course?._id || g.course) === selectedCourseId)
  } else {
    filteredGrades = []
  }
  if (selectedCategory) {
    filteredGrades = filteredGrades.filter(g => g.category === selectedCategory)
  }

  // Grade distribution for filtered grades
  const gradeDistribution = filteredGrades.reduce((acc, grade) => {
    const letter = grade.letterGrade || 'N/A'
    acc[letter] = (acc[letter] || 0) + 1
    return acc
  }, {})

  // Course statistics
  const courseStats = courses.map(course => {
    const courseGrades = grades.filter(g => String(g.course?._id || g.course) === String(course._id))
    let sum = 0, maxSum = 0
    courseGrades.forEach(g => {
      sum += g.score || 0
      maxSum += g.maxScore || 0
    })
    const average = maxSum > 0 ? ((sum / maxSum) * 100).toFixed(1) : 0
    return {
      ...course,
      gradeCount: courseGrades.length,
      average: parseFloat(average),
      studentCount: course.students?.length || 0
    }
  }).sort((a, b) => b.average - a.average)

  return (
    <div>
      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard
          title="Total Courses"
          value={courses.length}
          subtitle="teaching"
          icon="📚"
          color="#667eea"
        />
        <StatCard
          title="Total Students"
          value={uniqueStudents.size}
          subtitle="enrolled"
          icon="👥"
          color="#10b981"
        />
        <StatCard
          title="Class Average"
          value={`${overallAverage}%`}
          subtitle="across all courses"
          icon="📊"
          color="#f59e0b"
        />
        <StatCard
          title="Total Grades"
          value={grades.length}
          subtitle="posted"
          icon="✅"
          color="#8b5cf6"
        />
      </div>

      {/* Grade Distribution */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
          Grade Distribution
        </h2>
        <p style={{ margin: '0 0 16px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          Pick a course to see its final grade distribution. Optionally filter by category to see how students performed.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              Select Course (required)
            </label>
            <select
              value={selectedCourseId}
              onChange={e => {
                setSelectedCourseId(e.target.value)
                setSelectedCategory('')
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: 14
              }}
            >
              <option value="">Choose a course</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCourseId && (
            <>
              <div style={{ flex: 1, minWidth: 240 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Select Category (optional)
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: 14
                  }}
                >
                  <option value="">All categories</option>
                  {categoriesForCourse.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 16
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
              Final Course Grade Distribution
            </h3>
            {!selectedCourseId && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Select a course to view final grade breakdown.</div>
            )}
            {selectedCourseId && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12 }}>
                {['A', 'B', 'C', 'D', 'F'].map(letter => (
                  <div key={letter} style={{
                    textAlign: 'center',
                    padding: 12,
                    background: 'var(--surface)',
                    borderRadius: 10,
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: getGradeColor(letter) }}>
                      {finalCourseDistribution.distribution[letter] || 0}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                      Grade {letter}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {finalCourseDistribution.count > 0 ? ((finalCourseDistribution.distribution[letter] || 0) / finalCourseDistribution.count * 100).toFixed(0) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 16
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
              Assignment/Exam Distribution
            </h3>
            {!selectedCourseId && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Select a course to see distribution.</div>
            )}
            {selectedCourseId && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12 }}>
                  {['A', 'B', 'C', 'D', 'F'].map(letter => (
                    <div key={letter} style={{
                      textAlign: 'center',
                      padding: 12,
                      background: 'var(--surface)',
                      borderRadius: 10,
                      border: '1px solid var(--border)'
                    }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: getGradeColor(letter) }}>
                        {gradeDistribution[letter] || 0}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                        Grade {letter}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {filteredGrades.length > 0 ? ((gradeDistribution[letter] || 0) / filteredGrades.length * 100).toFixed(0) : 0}%
                      </div>
                    </div>
                  ))}
                </div>
                {filteredGrades.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 16, color: 'var(--text-muted)', fontSize: 13 }}>
                    No grades available for selected filters
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Course Performance */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 24,
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
          Course Performance Overview
        </h2>
        {courseStats.length > 0 ? (
          <div style={{ display: 'grid', gap: 12 }}>
            {courseStats.map(course => (
              <div key={course._id} style={{
                padding: 16,
                background: 'var(--bg)',
                borderRadius: 12,
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>
                    {course.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {course.code} • {course.studentCount} students • {course.gradeCount} grades
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: getCategoryColor(course.average) }}>
                    {course.average}%
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Average
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
            No course data available
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: 20,
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 12,
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
}

function getGradeColor(grade) {
  const colors = {
    'A': '#10b981',
    'B': '#3b82f6',
    'C': '#f59e0b',
    'D': '#ef4444',
    'F': '#dc2626'
  }
  return colors[grade] || '#6b7280'
}

function getCategoryColor(percentage) {
  if (percentage >= 90) return '#10b981'
  if (percentage >= 80) return '#3b82f6'
  if (percentage >= 70) return '#f59e0b'
  if (percentage >= 60) return '#ef4444'
  return '#dc2626'
}

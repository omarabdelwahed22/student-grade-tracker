import api from './api'

export const getGrades = (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  return api.get(`/grades${queryString ? '?' + queryString : ''}`)
}

export const getGradeById = (id) => {
  return api.get(`/grades/${id}`)
}

export const createGrade = (data) => {
  return api.post('/grades', data)
}

export const updateGrade = (id, data) => {
  return api.put(`/grades/${id}`, data)
}

export const deleteGrade = (id) => {
  return api.delete(`/grades/${id}`)
}

export const getCourseStats = (courseId) => {
  return api.get(`/grades/course/${courseId}/stats`)
}

export const getCourseAnalytics = (courseId) => {
  return api.get(`/grades/course/${courseId}/analytics`)
}

export const getGpa = (studentId) => {
  const qs = studentId ? `?studentId=${studentId}` : ''
  return api.get(`/grades/gpa${qs}`)
}

export default {
  getGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
  getCourseStats,
  getCourseAnalytics,
  getGpa
}

import api from './api'

export async function getMyCourses() {
  return api.get('/courses/my')
}

export async function getAllCourses() {
  return api.get('/courses')
}

export async function getCourseById(id) {
  return api.get(`/courses/${id}`)
}

export async function createCourse(data) {
  return api.post('/courses', data)
}

export async function updateCourse(id, data) {
  return api.put(`/courses/${id}`, data)
}

export async function deleteCourse(id) {
  return api.delete(`/courses/${id}`)
}

export async function enrollStudent(courseId, studentId) {
  return api.post(`/courses/${courseId}/enroll`, { studentId })
}

export async function unenrollStudent(courseId, studentId) {
  return api.post(`/courses/${courseId}/unenroll`, { studentId })
}

export default {
  getMyCourses,
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent
}

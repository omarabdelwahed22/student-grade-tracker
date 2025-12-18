import api from './api'

export const getAllUsers = () => {
  return api.get('/users')
}

export const getStudents = () => {
  return api.get('/users/students')
}

export const getInstructors = () => {
  return api.get('/users/instructors')
}

export const getUserById = (id) => {
  return api.get(`/users/${id}`)
}

export const updateProfile = (data) => {
  return api.put('/auth/profile', data)
}

export const changePassword = (data) => {
  return api.put('/auth/password', data)
}

export default {
  getAllUsers,
  getStudents,
  getInstructors,
  getUserById,
  updateProfile,
  changePassword
}

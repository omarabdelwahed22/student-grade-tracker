import api from './api'

export const getAllUsers = () => {
  return api.get('/users')
}

export const updateProfile = (data) => {
  return api.put('/auth/profile', data)
}

export const changePassword = (data) => {
  return api.put('/auth/password', data)
}

export default {
  getAllUsers,
  updateProfile,
  changePassword
}

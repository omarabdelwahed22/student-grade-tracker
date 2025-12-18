import api from './api'

export async function login(email, password) {
  return api.post('/auth/login', { email, password })
}

export async function register(email, password, role='student', name='', studentId='') {
  return api.post('/auth/register', { email, password, role, name, studentId })
}

export default { login, register }

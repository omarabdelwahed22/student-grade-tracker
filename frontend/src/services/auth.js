import api from './api'

export async function login(email, password) {
  return api.post('/auth/login', { email, password })
}

export async function register(email, password, role='student') {
  return api.post('/auth/register', { email, password, role })
}

export default { login, register }

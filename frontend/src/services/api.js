const API_BASE = '/api'

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`, { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error('Network error')
  return res.json()
}

export async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) })
  if (!res.ok) {
    const err = await res.json().catch(()=>({message:res.statusText}))
    throw new Error(err.message || 'Network error')
  }
  return res.json()
}

export default {
  getHealth,
  post
}

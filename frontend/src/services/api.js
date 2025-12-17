const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

export async function getHealth() {
  const response = await fetch(`${API_BASE}/health`)
  if (!response.ok) {
    throw new Error('Failed to fetch health status')
  }
  return response.json()
}

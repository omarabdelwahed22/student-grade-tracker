// Prefer deployed API base URL from env; when missing on Netlify, default to Railway prod URL; fall back to /api for local dev
const netlifyHost = typeof window !== 'undefined' ? window.location.hostname : '';
const inferredProd = netlifyHost.includes('netlify.app')
  ? 'https://student-grade-tracker-production.up.railway.app'
  : '';
const apiRoot = import.meta?.env?.VITE_API_URL || inferredProd;
const API_BASE = apiRoot ? `${apiRoot.replace(/\/$/, '')}/api` : '/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

export async function get(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { ...authHeaders() } });
  if (!res.ok) {
    const ct = res.headers.get('content-type') || '';
    let err;
    if (ct.includes('application/json')) {
      err = await res.json().catch(()=>({ message: res.statusText }));
    } else {
      err = { message: res.status === 502 || res.status === 500 ? 'Backend unreachable. Please ensure the server is running on port 4000.' : res.statusText };
    }
    throw new Error(err.message || 'Network error');
  }
  return res.json();
}

export async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) });
  if (!res.ok) {
    const ct = res.headers.get('content-type') || '';
    let err;
    if (ct.includes('application/json')) {
      try {
        err = await res.json();
      } catch {
        err = { message: res.statusText };
      }
    } else {
      err = { message: res.status === 502 || res.status === 500 ? 'Backend unreachable. Please ensure the server is running on port 4000.' : res.statusText };
    }
    const message = err.message
      || err.error
      || (Array.isArray(err.errors) && err.errors[0]?.msg)
      || (typeof err === 'string' ? err : null)
      || 'Network error';
    throw new Error(message);
  }
  return res.json();
}

export async function put(path, body) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) });
  if (!res.ok) {
    const ct = res.headers.get('content-type') || '';
    let err;
    if (ct.includes('application/json')) {
      err = await res.json().catch(()=>({ message: res.statusText }));
    } else {
      err = { message: res.status === 502 || res.status === 500 ? 'Backend unreachable. Please ensure the server is running on port 4000.' : res.statusText };
    }
    throw new Error(err.message || 'Network error');
  }
  return res.json();
}

export async function del(path) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: { ...authHeaders() } });
  if (!res.ok) {
    const ct = res.headers.get('content-type') || '';
    let err;
    if (ct.includes('application/json')) {
      err = await res.json().catch(()=>({ message: res.statusText }));
    } else {
      err = { message: res.status === 502 || res.status === 500 ? 'Backend unreachable. Please ensure the server is running on port 4000.' : res.statusText };
    }
    throw new Error(err.message || 'Network error');
  }
  return res.json();
}

export default {
  getHealth,
  get,
  post,
  put,
  delete: del
};

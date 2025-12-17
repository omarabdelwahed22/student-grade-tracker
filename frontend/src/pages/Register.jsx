import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register as apiRegister } from '../services/auth'

export default function Register({ onRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await apiRegister(email, password, role)
      // data: { token, user }
      if (onRegister) onRegister(data)
      // redirect based on role
      const r = data?.user?.role || role
      if (r === 'instructor') navigate('/instructor')
      else navigate('/student')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{padding:24,maxWidth:420,margin:'40px auto'}}>
      <div className="card">
        <h2>Register</h2>
        <form onSubmit={submit}>
          <div style={{marginBottom:8}}>
            <label>Email</label>
            <input style={{width:'100%',padding:8}} value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div style={{marginBottom:8}}>
            <label>Password</label>
            <input type="password" style={{width:'100%',padding:8}} value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <div style={{marginBottom:8}}>
            <label>Role</label>
            <select value={role} onChange={e=>setRole(e.target.value)} style={{width:'100%',padding:8}}>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>
          {error && <div style={{color:'red',marginBottom:8}}>{error}</div>}
          <div style={{display:'flex',gap:8}}>
            <button className="btn" disabled={loading} type="submit">{loading ? 'Registering...' : 'Register'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

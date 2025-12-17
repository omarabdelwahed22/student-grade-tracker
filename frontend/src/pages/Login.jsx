import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin } from '../services/auth'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('student')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await apiLogin(email, password)
      // data is expected to include { token, user }
      onLogin(data)
      // redirect based on role returned by server
      const role = data?.user?.role || tab
      if (role === 'instructor') navigate('/instructor')
      else navigate('/student')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{padding:24,maxWidth:420,margin:'40px auto'}}>
      <div className="card">
        <h2>Login</h2>

        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <button type="button" className={tab==='student'? 'btn' : ''} onClick={() => setTab('student')}>Student</button>
          <button type="button" className={tab==='instructor'? 'btn secondary' : ''} onClick={() => setTab('instructor')}>Instructor</button>
        </div>

        <form onSubmit={submit}>
          <div style={{marginBottom:8}}>
            <label>Email</label>
            <input style={{width:'100%',padding:8}} value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div style={{marginBottom:8}}>
            <label>Password</label>
            <input type="password" style={{width:'100%',padding:8}} value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          {error && <div style={{color:'red',marginBottom:8}}>{error}</div>}
          <div style={{display:'flex',gap:8}}>
            <button className="btn" disabled={loading} type="submit">{loading ? 'Logging...' : `Login as ${tab}`}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

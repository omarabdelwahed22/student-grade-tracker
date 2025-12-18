import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentHome from './pages/StudentHome'
import InstructorHome from './pages/InstructorHome'
import Students from './pages/Students'
import StudentDetails from './pages/StudentDetails'
import NotAuthorized from './pages/NotAuthorized'
import Courses from './pages/Courses'
import Grades from './pages/Grades'
import Settings from './pages/Settings'
import RoleRoute from './components/RoleRoute'

export default function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return { token, user }
  })

  const handleLogin = (data) => {
    // data: { token, user }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setAuth({ token: data.token, user: data.user })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuth({ token: null, user: null })
  }

  return (
    <BrowserRouter>
      <AppRoutes auth={auth} handleLogin={handleLogin} handleLogout={handleLogout} />
    </BrowserRouter>
  )
}

function AppRoutes({ auth, handleLogin, handleLogout }) {
  const location = useLocation()
  const hideSidebar = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="app-root">
      {!hideSidebar && <Sidebar />}
      <div className="main-area">
        <Header />
        <main>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginBottom:12}}>
            {auth.token ? (
              <button className="btn" onClick={handleLogout}>Logout</button>
            ) : null}
          </div>
          <Routes>
            <Route path="/login" element={auth.token ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
            <Route path="/register" element={auth.token ? <Navigate to="/" replace /> : <Register onRegister={handleLogin} />} />
            <Route path="/not-authorized" element={<NotAuthorized />} />
            <Route path="/student" element={<RoleRoute allowedRoles={["student"]}><StudentHome /></RoleRoute>} />
            <Route path="/instructor" element={<RoleRoute allowedRoles={["instructor"]}><InstructorHome /></RoleRoute>} />
            <Route path="/students" element={<RoleRoute allowedRoles={["instructor"]}><Students /></RoleRoute>} />
            <Route path="/students/:id" element={<RoleRoute allowedRoles={["instructor"]}><StudentDetails /></RoleRoute>} />
            <Route path="/courses" element={<RoleRoute allowedRoles={["student", "instructor"]}><Courses /></RoleRoute>} />
            <Route path="/grades" element={<RoleRoute allowedRoles={["student", "instructor"]}><Grades /></RoleRoute>} />
            <Route path="/settings" element={<RoleRoute allowedRoles={["student", "instructor"]}><Settings /></RoleRoute>} />
            <Route
              path="/"
              element={
                auth.token
                  ? (auth.user?.role === 'instructor' ? <InstructorHome /> : <Dashboard />)
                  : <Navigate to="/login" replace />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  )
}

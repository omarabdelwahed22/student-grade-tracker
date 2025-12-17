import React from 'react'
import { Navigate } from 'react-router-dom'

export default function RoleRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (!token) return <Navigate to="/login" replace />
  if (!user || !allowedRoles.includes(user.role)) return <Navigate to="/not-authorized" replace />
  return children
}

import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/students', label: 'Students' },
    { path: '/courses', label: 'Courses' },
    { path: '/grades', label: 'Grades' }
  ]

  return (
    <aside className="sidebar">
      <h2>SGT</h2>
      <nav>
        <ul>
          {navItems.map(item => (
            <li key={item.path}>
              <Link 
                to={item.path}
                style={{
                  textDecoration: 'none',
                  color: location.pathname === item.path ? '#667eea' : 'inherit',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  display: 'block',
                  width: '100%'
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const role = user?.role

  // Only show Students nav for instructors
  const baseItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/courses', label: 'Courses' },
    { path: '/grades', label: 'Grades' },
    { path: '/settings', label: 'Settings' }
  ]
  
  const studentItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/courses', label: 'Courses' },
    { path: '/grades', label: 'Grades' },
    { path: '/settings', label: 'Settings' }
  ]
  
  const instructorItems = [
    { path: '/students', label: 'Students' },
    { path: '/', label: 'Dashboard' },
    { path: '/courses', label: 'Courses' },
    { path: '/grades', label: 'Grades' },
    { path: '/statistics', label: 'Statistics' },
    { path: '/settings', label: 'Settings' }
  ]
  
  const navItems = role === 'instructor' ? instructorItems : studentItems

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

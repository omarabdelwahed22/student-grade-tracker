import React from 'react'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Grade Tracker</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li><a href="#dashboard">Dashboard</a></li>
          <li><a href="#students">Students</a></li>
          <li><a href="#assignments">Assignments</a></li>
          <li><a href="#reports">Reports</a></li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar

import React from 'react'

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <h1>Student Grade Tracker</h1>
        <p className="subtitle">Manage student performance and grades</p>
      </div>
      <div className="header-actions">
        <button className="btn btn-primary">Add Student</button>
        <button className="btn btn-secondary">Add Assignment</button>
      </div>
    </header>
  )
}

export default Header

import React from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <div className="app-root">
      <Sidebar />
      <div className="main-area">
        <Header />
        <main>
          <Dashboard />
        </main>
      </div>
    </div>
  )
}

import React from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-container">
        <Header />
        <main className="content">
          <Dashboard />
        </main>
      </div>
    </div>
  )
}

export default App

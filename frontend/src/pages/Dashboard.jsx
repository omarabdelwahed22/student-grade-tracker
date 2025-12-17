import React, {useEffect, useState} from 'react'
import { getHealth } from '../services/api'

export default function Dashboard() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    getHealth().then(setHealth).catch(()=>{})
  }, [])

  return (
    <section className="dashboard">
      <h2>Dashboard</h2>
      <div className="card">
        <h3>Backend Health</h3>
        <pre>{health ? JSON.stringify(health, null, 2) : 'Loading...'}</pre>
      </div>
    </section>
  )
}

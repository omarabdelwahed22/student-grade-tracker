import React from 'react'
import { Link } from 'react-router-dom'

export default function NotAuthorized(){
  return (
    <div style={{padding:24}}>
      <h2>Not authorized</h2>
      <p>You don't have permission to view this page.</p>
      <p><Link to="/">Go home</Link></p>
    </div>
  )
}

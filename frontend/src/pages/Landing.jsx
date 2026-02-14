import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing(){
  return (
    <div className="page center">
      <h1>FastEP Work</h1>
      <p>Simple timesheet & work management</p>
      <div className="actions">
        <Link to="/register" className="btn">Register</Link>
        <Link to="/login" className="btn outline">Login</Link>
      </div>
    </div>
  )
}

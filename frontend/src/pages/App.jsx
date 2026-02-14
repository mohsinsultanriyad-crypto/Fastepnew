import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Landing from './Landing'
import Register from './Register'
import Login from './Login'
import WorkerDashboard from './WorkerDashboard'
import AdminDashboard from './AdminDashboard'

export default function App(){
  return (
    <div className="app-root">
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/worker" element={<WorkerDashboard/>} />
        <Route path="/admin" element={<AdminDashboard/>} />
      </Routes>
    </div>
  )
}

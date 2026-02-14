import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault(); setError('')
    try{
      const res = await axios.post((import.meta.env.VITE_API_URL||'http://localhost:4000') + '/api/auth/login',{email,password})
      localStorage.setItem('token', res.data.token)
      nav(res.data.user.role === 'admin' ? '/admin' : '/worker')
    }catch(err){ setError(err?.response?.data?.error||'Login failed') }
  }

  return (
    <div className="page center">
      <h2>Login</h2>
      <form onSubmit={submit} className="card">
        <input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="btn">Login</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  )
}

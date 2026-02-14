import React, { useEffect, useState } from 'react'
import axios from 'axios'

function api() {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  const token = localStorage.getItem('token')
  const instance = axios.create({ baseURL: base, headers: { Authorization: token ? `Bearer ${token}` : '' } })
  return instance
}

export default function AdminDashboard(){
  const [users,setUsers]=useState([])
  const [entries,setEntries]=useState([])
  const [msg,setMsg]=useState('')

  useEffect(()=>{ load() },[])
  async function load(){
    try{ const u = await api().get('/api/admin/users'); setUsers(u.data.users); const e = await api().get('/api/admin/entries?status=PENDING'); setEntries(e.data.entries) }catch(e){ console.error(e) }
  }

  async function approve(id){ await api().patch(`/api/admin/entries/${id}/approve`); load(); }
  async function reject(id){ const comment=prompt('Reject comment')||''; await api().patch(`/api/admin/entries/${id}/reject`,{comment}); load(); }

  return (
    <div className="page">
      <h2>Admin</h2>
      <section className="card">
        <h3>Pending Entries</h3>
        {entries.map(e=> (
          <div key={e._id} className="entry">
            <div>{e.date} — {e.userId?.name} — {e.totalHours}h</div>
            <div>
              <button onClick={()=>approve(e._id)} className="btn">Approve</button>
              <button onClick={()=>reject(e._id)} className="btn outline">Reject</button>
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <h3>Workers</h3>
        {users.map(u=> (
          <div key={u._id} className="entry">
            <div>{u.name} — {u.email}</div>
            <div>Rate: {u.rate} — OT: {u.otRate}</div>
          </div>
        ))}
      </section>
    </div>
  )
}

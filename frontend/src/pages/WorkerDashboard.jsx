import React, { useEffect, useState } from 'react'
import axios from 'axios'

function api() {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  const token = localStorage.getItem('token')
  const instance = axios.create({ baseURL: base, headers: { Authorization: token ? `Bearer ${token}` : '' } })
  return instance
}

export default function WorkerDashboard(){
  const [entries,setEntries]=useState([])
  const [form,setForm]=useState({date:'',startTime:'08:00',endTime:'17:00',breakMinutes:60,notes:''})
  const [msg,setMsg]=useState('')

  useEffect(()=>{ load() },[])
  async function load(){
    try{ const res = await api().get('/api/entries/my'); setEntries(res.data.entries) }catch(e){ console.error(e) }
  }

  async function submit(e){
    e.preventDefault(); setMsg('')
    try{ await api().post('/api/entries', form); setMsg('Submitted'); load(); }catch(err){ setMsg(err?.response?.data?.error||'Error') }
  }

  return (
    <div className="page">
      <h2>My Entries</h2>
      <form onSubmit={submit} className="card">
        <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required />
        <div style={{display:'flex',gap:8}}>
          <input type="time" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})} required />
          <input type="time" value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})} required />
        </div>
        <input type="number" value={form.breakMinutes} onChange={e=>setForm({...form,breakMinutes:Number(e.target.value)})} min={0} />
        <textarea placeholder="notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
        <button className="btn">Submit</button>
        {msg && <div className="info">{msg}</div>}
      </form>

      <div>
        {entries.map(en=> (
          <div key={en._id} className="entry">
            <div>{en.date} — {en.totalHours}h — {en.status}</div>
            <div>{en.notes}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

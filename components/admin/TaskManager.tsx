'use client'

import { useState } from 'react'

type Customer = { id: string; full_name: string; email: string }
type Task = { id: string; title: string; description: string | null; customer_id: string | null; due_at: string | null; priority: string; status: string; source: string; created_at: string; completed_at: string | null }
const panel: React.CSSProperties = { background: 'var(--warm-white)', border: '1px solid var(--sand-line)', padding: 18 }
const field: React.CSSProperties = { width: '100%', padding: '10px 11px', border: '1px solid var(--sand-line)', background: '#fff', color: 'var(--ink)', fontSize: 13 }

export default function TaskManager({ initialTasks, customers }: { initialTasks: Task[]; customers: Customer[] }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '')
  const [dueAt, setDueAt] = useState('')
  const [priority, setPriority] = useState('normal')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function createTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    try {
      const response = await fetch('/api/admin/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, customer_id: customerId, due_at: dueAt, priority }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to create task')
      setTasks(current => [...current, payload.data].sort((a, b) => (a.due_at || '9999').localeCompare(b.due_at || '9999')))
      setTitle(''); setDescription(''); setDueAt(''); setPriority('normal'); setNotice('Task created.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to create task') }
    finally { setBusy(false) }
  }

  async function updateTask(task: Task, status: string) {
    setError(''); setNotice('')
    try {
      const response = await fetch('/api/admin/tasks/' + task.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to update task')
      setTasks(current => current.map(item => item.id === task.id ? { ...item, ...payload.data } : item))
      setNotice('Task updated.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update task') }
  }

  const active = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress')
  const finished = tasks.filter(t => t.status === 'completed' || t.status === 'cancelled')

  return <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}><div><p style={{ color: 'var(--ember)', fontSize: 11, fontWeight: 800, letterSpacing: '.12em' }}>DAILY OPERATIONS</p><h1 style={{ fontFamily: 'Big Shoulders Display', fontSize: 42, fontWeight: 900, textTransform: 'uppercase' }}>Tasks & follow-ups</h1><p style={{ color: '#625d55', marginTop: 4 }}>Keep the next action visible and tied to a real customer record.</p></div><div style={{ fontWeight: 800 }}>{active.length} open · {finished.length} completed / cancelled</div></div>
    {error && <p role="alert" style={{ color: 'var(--ember)', fontWeight: 800, marginBottom: 12 }}>{error}</p>}{notice && <p role="status" style={{ color: 'var(--teal)', fontWeight: 800, marginBottom: 12 }}>{notice}</p>}
    <form onSubmit={createTask} style={{ ...panel, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12, marginBottom: 22 }}>
      <label style={{ fontSize: 11, fontWeight: 800, gridColumn: 'span 2' }}>TASK TITLE<input required maxLength={240} value={title} onChange={e => setTitle(e.target.value)} placeholder="Follow up on requested dates" style={{ ...field, display: 'block', marginTop: 6 }} /></label>
      <label style={{ fontSize: 11, fontWeight: 800 }}>CUSTOMER<select required value={customerId} onChange={e => setCustomerId(e.target.value)} style={{ ...field, display: 'block', marginTop: 6 }}><option value="">Choose customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.full_name} · {c.email}</option>)}</select></label>
      <label style={{ fontSize: 11, fontWeight: 800 }}>DUE DATE<input type="datetime-local" value={dueAt} onChange={e => setDueAt(e.target.value)} style={{ ...field, display: 'block', marginTop: 6 }} /></label>
      <label style={{ fontSize: 11, fontWeight: 800 }}>PRIORITY<select value={priority} onChange={e => setPriority(e.target.value)} style={{ ...field, display: 'block', marginTop: 6 }}>{['low','normal','high','urgent'].map(p => <option key={p} value={p}>{p}</option>)}</select></label>
      <label style={{ fontSize: 11, fontWeight: 800, gridColumn: '1 / -1' }}>DETAILS (OPTIONAL)<textarea rows={2} maxLength={10000} value={description} onChange={e => setDescription(e.target.value)} style={{ ...field, display: 'block', marginTop: 6 }} /></label>
      <div style={{ gridColumn: '1 / -1' }}><button disabled={busy || !customers.length} style={{ padding: '10px 15px', border: 0, background: 'var(--ink)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>{busy ? 'Saving…' : 'Create task'}</button>{!customers.length && <p style={{ fontSize: 12, color: 'var(--ember)', marginTop: 8 }}>Add a customer record before creating a task.</p>}</div>
    </form>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
      <section style={panel}><h2 style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>Open tasks</h2>
        {active.map(task => <div key={task.id} style={{ borderTop: '1px solid var(--sand-line)', padding: '14px 0' }}><div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}><strong>{task.title}</strong><span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: task.priority === 'urgent' || task.priority === 'high' ? 'var(--ember)' : '#625d55' }}>{task.priority}</span></div><p style={{ color: '#625d55', fontSize: 12, marginTop: 5 }}>{customers.find(c => c.id === task.customer_id)?.full_name ?? 'Linked record'}{task.due_at ? ' · Due ' + new Date(task.due_at).toLocaleString() : ' · No due date'}</p>{task.description && <p style={{ whiteSpace: 'pre-wrap', fontSize: 13, marginTop: 7 }}>{task.description}</p>}<div style={{ display: 'flex', gap: 8, marginTop: 10 }}><select aria-label={'Task status ' + task.title} value={task.status} onChange={e => updateTask(task, e.target.value)} style={{ ...field, maxWidth: 150 }}>{['pending','in_progress','completed','cancelled'].map(s => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}</select><span style={{ alignSelf: 'center', fontSize: 10, color: '#625d55' }}>{task.source === 'ai' ? 'AI-assisted' : task.source === 'system' ? 'System' : 'Manual'}</span></div></div>)}
        {!active.length && <p style={{ color: '#625d55', padding: '12px 0' }}>No open tasks. Create a follow-up above.</p>}
      </section>
      <section style={panel}><h2 style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>Completed / cancelled</h2>
        {finished.map(task => <div key={task.id} style={{ borderTop: '1px solid var(--sand-line)', padding: '14px 0' }}><strong>{task.title}</strong><p style={{ color: '#625d55', fontSize: 12, marginTop: 4 }}>{customers.find(c => c.id === task.customer_id)?.full_name ?? 'Linked record'} · {task.status.replaceAll('_', ' ')}</p><button type="button" onClick={() => updateTask(task, 'pending')} style={{ marginTop: 8, border: '1px solid var(--ink)', padding: '7px 10px', fontWeight: 700, fontSize: 12 }}>Reopen</button></div>)}
        {!finished.length && <p style={{ color: '#625d55', padding: '12px 0' }}>Nothing closed out yet.</p>}
      </section>
    </div>
  </div>
}

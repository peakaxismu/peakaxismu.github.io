'use client'

import { useState } from 'react'

type Hike = {
  id: string
  name: string
  difficulty: string
  duration: string
  location: string
  price: string
  max_participants?: number | null
  spots_total?: number | null
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 12px', border: '1px solid var(--sand-line)',
  background: 'var(--warm-white)', color: 'var(--ink)', boxSizing: 'border-box',
}

export default function ScheduleHikeClient({ hikes }: { hikes: Hike[] }) {
  const [sourceId, setSourceId] = useState(hikes[0]?.id || '')
  const [date, setDate] = useState('')
  const [spots, setSpots] = useState(String(hikes[0]?.max_participants || hikes[0]?.spots_total || 10))
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const source = hikes.find((h) => h.id === sourceId)
  const chooseSource = (id: string) => {
    setSourceId(id)
    const next = hikes.find((h) => h.id === id)
    setSpots(String(next?.max_participants || next?.spots_total || 10))
  }

  const schedule = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!sourceId || !date) { setError('Choose a route and date.'); return }
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/hikes/${sourceId}/schedule`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, spots_total: Number(spots), spots_remaining: Number(spots), status }),
      })
      const json = await response.json().catch(() => ({}))
      if (!response.ok || !json.success) { setError(json.error || 'Could not schedule this hike.'); return }
      setMessage(`${source?.name || 'Hike'} is scheduled for ${date}.`)
      setDate('')
      setStatus('draft')
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return <div style={{ maxWidth: 760, color: 'var(--ink)' }}>
    <a href="/admin/hikes" style={{ fontSize: 13, fontWeight: 700 }}>← Hikes management</a>
    <h1 style={{ fontFamily: 'Big Shoulders Display, sans-serif', fontSize: 42, textTransform: 'uppercase', margin: '18px 0 6px' }}>Schedule a hike</h1>
    <p style={{ color: '#625e56', margin: '0 0 26px', lineHeight: 1.6 }}>Choose an existing route template. Peak Axis will copy its trail, customer, safety and pricing information into a separate scheduled-group departure.</p>

    <form onSubmit={schedule} style={{ background: 'var(--warm-white)', border: '1px solid var(--sand-line)', padding: 24 }}>
      <div style={{ display: 'grid', gap: 18 }}>
        <label style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Route template
          <select value={sourceId} onChange={(e) => chooseSource(e.target.value)} style={inputStyle}>
            {hikes.filter((h) => h.id).map((h) => <option key={h.id} value={h.id}>{h.name} · {h.location}</option>)}
          </select>
        </label>

        {source && <div style={{ background: '#eeeadf', padding: 15, lineHeight: 1.55, fontSize: 13 }}><strong>{source.name}</strong><br />{source.difficulty} · {source.duration} · {source.location}<br />{source.price}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Scheduled date
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Group capacity
            <input required type="number" min="1" value={spots} onChange={(e) => setSpots(e.target.value)} style={inputStyle} />
          </label>
        </div>

        <label style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Initial visibility
          <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')} style={inputStyle}>
            <option value="draft">Draft — review first</option>
            <option value="published">Published — show customers immediately</option>
          </select>
        </label>

        <div style={{ borderLeft: '3px solid var(--ember)', background: '#f5f1e8', padding: '12px 14px', fontSize: 12, lineHeight: 1.55 }}>
          Only the schedule-specific information is entered here. The route template remains unchanged and can be scheduled again for another date.
        </div>

        {error && <div role="alert" style={{ color: '#8f3215', background: '#f7e7df', padding: 11 }}>{error}</div>}
        {message && <div role="status" style={{ color: '#1e6258', background: '#e7f1ed', padding: 11 }}>{message}</div>}
        <button type="submit" disabled={loading} style={{ padding: '12px 18px', background: 'var(--ember)', color: '#fff', border: 0, fontWeight: 800, cursor: loading ? 'wait' : 'pointer' }}>{loading ? 'Scheduling…' : 'Create scheduled hike'}</button>
      </div>
    </form>
  </div>
}

'use client'

import { useMemo, useState, type FormEvent } from 'react'
import HikeMediaManager from './HikeMediaManager'

interface Hike {
  id: string
  name: string
  difficulty: 'easy' | 'moderate' | 'challenging'
  date: string
  duration: string
  location: string
  price: string
  spots_total: number
  spots_remaining: number
  description: string | null
  status: 'draft' | 'published'
  region?: string | null
  booking_type?: 'scheduled_group' | 'on_demand' | 'private'
  hike_type?: string
  main_attraction?: string
  distance_km?: number | null
  elevation_gain_m?: number | null
  terrain?: string | null
  fitness_required?: string | null
  safety_info?: string | null
  weather_policy?: string | null
}

type Tab = 'details' | 'trail' | 'booking' | 'safety' | 'photos'

const tabs: { id: Tab; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'trail', label: 'Trail' },
  { id: 'booking', label: 'Booking' },
  { id: 'safety', label: 'Safety' },
  { id: 'photos', label: 'Photos' },
]

const inputStyle = { width: '100%', padding: '11px 12px', border: '1px solid var(--sand-line)', background: 'var(--warm-white)', color: 'var(--ink)', borderRadius: 2, fontSize: 14, boxSizing: 'border-box' as const }

export default function HikesAdminClient({ initialHikes }: { initialHikes: Hike[] }) {
  const [hikes, setHikes] = useState<Hike[]>(initialHikes)
  const [editing, setEditing] = useState<Partial<Hike> | null>(null)
  const [tab, setTab] = useState<Tab>('details')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const visibleHikes = useMemo(() => {
    const query = search.trim().toLowerCase()
    return hikes.filter((hike) => {
      const matchesSearch = !query || [hike.name, hike.location, hike.region, hike.hike_type, hike.main_attraction].filter(Boolean).some((value) => String(value).toLowerCase().includes(query))
      return matchesSearch && (statusFilter === 'all' || hike.status === statusFilter) && (difficultyFilter === 'all' || hike.difficulty === difficultyFilter)
    })
  }, [hikes, search, statusFilter, difficultyFilter])

  const openEditor = (hike?: Hike) => {
    setEditing(hike ? { ...hike } : { name: '', difficulty: 'moderate', location: '', duration: '', price: '', status: 'draft', booking_type: 'on_demand', spots_total: 10, spots_remaining: 10, description: '' })
    setTab('details')
    setError('')
  }

  const closeEditor = () => { setEditing(null); setError('') }
  const set = (key: keyof Hike, value: unknown) => setEditing((current) => current ? { ...current, [key]: value } : current)

  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (!editing) return
    if (!editing.name?.trim() || !editing.location?.trim() || !editing.duration?.trim() || !editing.price?.trim()) {
      setError('Name, location, duration and price are required.')
      setTab('details')
      return
    }
    setSaving(true)
    setError('')
    try {
      const isEdit = Boolean(editing.id)
      const response = await fetch(isEdit ? `/api/admin/hikes/${editing.id}` : '/api/admin/hikes', { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
      const json = await response.json().catch(() => ({}))
      if (!response.ok || !json.success || !json.data?.[0]) throw new Error(json.error || 'Could not save hike')
      const saved = json.data[0] as Hike
      setHikes((current) => isEdit ? current.map((hike) => hike.id === saved.id ? saved : hike) : [saved, ...current])
      closeEditor()
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save hike') }
    finally { setSaving(false) }
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this hike permanently?')) return
    const response = await fetch(`/api/admin/hikes/${id}`, { method: 'DELETE' })
    if (response.ok) setHikes((current) => current.filter((hike) => hike.id !== id))
    else window.alert('Could not delete this hike.')
  }

  const toggleStatus = async (hike: Hike) => {
    const status = hike.status === 'published' ? 'draft' : 'published'
    const response = await fetch(`/api/admin/hikes/${hike.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...hike, status }) })
    const json = await response.json().catch(() => ({}))
    if (response.ok && json.success) setHikes((current) => current.map((item) => item.id === hike.id ? (json.data?.[0] || { ...hike, status }) : item))
  }

  return <div className="admin-hikes" style={{ color: 'var(--ink)' }}>
    <style>{`.admin-hikes input,.admin-hikes select,.admin-hikes textarea{font:inherit}.admin-table{width:100%;border-collapse:collapse;font-size:13px}.admin-table th,.admin-table td{padding:14px;text-align:left;border-bottom:1px solid var(--sand-line)}.admin-button{background:var(--ember);color:#fff;border:0;padding:11px 15px;font-weight:800;cursor:pointer}.admin-modal-backdrop{position:fixed;inset:0;z-index:100;background:rgba(20,22,20,.62);display:flex;align-items:center;justify-content:center;padding:16px}.admin-modal{width:min(960px,100%);height:min(900px,94vh);background:var(--warm-white);display:flex;flex-direction:column}.admin-modal-body{padding:22px 24px;overflow:auto;flex:1}.admin-tabs{display:flex;overflow-x:auto;border-bottom:1px solid var(--sand-line);background:#f3f0e8}.admin-tab{border:0;background:transparent;padding:13px 16px;cursor:pointer;font-weight:800}.admin-tab.active{background:var(--warm-white);box-shadow:inset 0 -2px 0 var(--ember)}.admin-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.admin-field{display:flex;flex-direction:column;gap:6px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}.admin-field.full{grid-column:1/-1}@media(max-width:700px){.admin-grid{grid-template-columns:1fr}.admin-field.full{grid-column:auto}}`}</style>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 20, marginBottom: 24 }}><div><h1 style={{ fontSize: 38, fontWeight: 900, margin: 0, textTransform: 'uppercase' }}>Hikes Management</h1><p style={{ color: '#625e56', marginTop: 8 }}>Manage each hike, including its own photos.</p></div><button className="admin-button" onClick={() => openEditor()}>+ Add hike</button></header>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}><input aria-label="Search hikes" placeholder="Search hikes…" value={search} onChange={(event) => setSearch(event.target.value)} style={{ ...inputStyle, flex: '1 1 260px', width: 'auto' }} /><select aria-label="Filter status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ ...inputStyle, width: 'auto' }}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></select><select aria-label="Filter difficulty" value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)} style={{ ...inputStyle, width: 'auto' }}><option value="all">All difficulty</option><option value="easy">Easy</option><option value="moderate">Moderate</option><option value="challenging">Challenging</option></select></div>
    <div style={{ background: 'var(--warm-white)', border: '1px solid var(--sand-line)', overflow: 'hidden' }}><div style={{ overflowX: 'auto' }}><table className="admin-table"><thead><tr><th>Route</th><th>Difficulty</th><th>Format</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visibleHikes.map((hike) => <tr key={hike.id}><td><strong>{hike.name}</strong><div style={{ color: '#777168', fontSize: 11, marginTop: 4 }}>{hike.location}</div></td><td>{hike.difficulty}</td><td>{hike.booking_type === 'scheduled_group' ? 'Scheduled group' : hike.booking_type === 'private' ? 'Private' : 'On-demand'}</td><td><button onClick={() => void toggleStatus(hike)} style={{ border: 0, padding: '5px 8px', color: '#fff', background: hike.status === 'published' ? 'var(--teal)' : '#69645d', cursor: 'pointer', fontSize: 10, fontWeight: 800 }}>{hike.status}</button></td><td><div style={{ display: 'flex', gap: 6 }}><button onClick={() => openEditor(hike)} style={{ padding: '7px 10px', border: '1px solid var(--sand-line)', background: 'transparent', cursor: 'pointer' }}>Edit</button><button onClick={() => void remove(hike.id)} style={{ padding: '7px 10px', border: '1px solid #d7b9ab', background: 'transparent', color: 'var(--ember)', cursor: 'pointer' }}>Delete</button></div></td></tr>)}</tbody></table></div>{visibleHikes.length === 0 && <p style={{ padding: 30, color: '#777168' }}>No hikes found.</p>}</div>
    {editing && <div className="admin-modal-backdrop" role="dialog" aria-modal="true"><div className="admin-modal"><div style={{ padding: '20px 24px', borderBottom: '1px solid var(--sand-line)', display: 'flex', justifyContent: 'space-between', gap: 16 }}><div><h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, textTransform: 'uppercase' }}>{editing.id ? 'Edit hike' : 'Create hike'}</h2><p style={{ margin: '6px 0 0', color: '#777168', fontSize: 12 }}>All photos are managed inside this hike.</p></div><button onClick={closeEditor} aria-label="Close" style={{ border: 0, background: 'transparent', fontSize: 26, cursor: 'pointer' }}>×</button></div><nav className="admin-tabs" aria-label="Hike editor sections">{tabs.map((item) => <button key={item.id} type="button" className={`admin-tab ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>{item.label}</button>)}</nav><form onSubmit={save} className="admin-modal-body">{tab === 'details' && <div className="admin-grid"><Field label="Name *"><input required value={editing.name || ''} onChange={(event) => set('name', event.target.value)} style={inputStyle} /></Field><Field label="Difficulty"><select value={editing.difficulty || 'moderate'} onChange={(event) => set('difficulty', event.target.value)} style={inputStyle}><option value="easy">Easy</option><option value="moderate">Moderate</option><option value="challenging">Challenging</option></select></Field><Field label="Location *"><input required value={editing.location || ''} onChange={(event) => set('location', event.target.value)} style={inputStyle} /></Field><Field label="Region"><input value={editing.region || ''} onChange={(event) => set('region', event.target.value)} style={inputStyle} /></Field><Field label="Route type"><input value={editing.hike_type || ''} onChange={(event) => set('hike_type', event.target.value)} style={inputStyle} /></Field><Field label="Main attraction"><input value={editing.main_attraction || ''} onChange={(event) => set('main_attraction', event.target.value)} style={inputStyle} /></Field><Field label="Description" full><textarea rows={6} value={editing.description || ''} onChange={(event) => set('description', event.target.value)} style={inputStyle} /></Field></div>}{tab === 'trail' && <div className="admin-grid"><Field label="Duration *"><input required value={editing.duration || ''} onChange={(event) => set('duration', event.target.value)} style={inputStyle} /></Field><Field label="Distance (km)"><input type="number" value={editing.distance_km ?? ''} onChange={(event) => set('distance_km', event.target.value ? Number(event.target.value) : null)} style={inputStyle} /></Field><Field label="Elevation gain (m)"><input type="number" value={editing.elevation_gain_m ?? ''} onChange={(event) => set('elevation_gain_m', event.target.value ? Number(event.target.value) : null)} style={inputStyle} /></Field><Field label="Terrain"><input value={editing.terrain || ''} onChange={(event) => set('terrain', event.target.value)} style={inputStyle} /></Field><Field label="Fitness required"><input value={editing.fitness_required || ''} onChange={(event) => set('fitness_required', event.target.value)} style={inputStyle} /></Field></div>}{tab === 'booking' && <div className="admin-grid"><Field label="Booking format"><select value={editing.booking_type || 'on_demand'} onChange={(event) => set('booking_type', event.target.value)} style={inputStyle}><option value="scheduled_group">Scheduled group</option><option value="on_demand">On-demand</option><option value="private">Private</option></select></Field><Field label="Scheduled date"><input value={editing.date || ''} onChange={(event) => set('date', event.target.value)} style={inputStyle} /></Field><Field label="Price *"><input required value={editing.price || ''} onChange={(event) => set('price', event.target.value)} style={inputStyle} /></Field><Field label="Total spots"><input type="number" value={editing.spots_total ?? 10} onChange={(event) => set('spots_total', Number(event.target.value))} style={inputStyle} /></Field><Field label="Remaining spots"><input type="number" value={editing.spots_remaining ?? 10} onChange={(event) => set('spots_remaining', Number(event.target.value))} style={inputStyle} /></Field></div>}{tab === 'safety' && <div className="admin-grid"><Field label="Safety information" full><textarea rows={7} value={editing.safety_info || ''} onChange={(event) => set('safety_info', event.target.value)} style={inputStyle} /></Field><Field label="Weather policy" full><textarea rows={7} value={editing.weather_policy || ''} onChange={(event) => set('weather_policy', event.target.value)} style={inputStyle} /></Field></div>}{tab === 'photos' && editing.id && <HikeMediaManager hikeId={editing.id} />}{tab === 'photos' && !editing.id && <p style={{ color: '#777168' }}>Save the new hike first. Its dedicated photo manager will then be available when you edit it.</p>}</form>{error && <p style={{ margin: '0 24px 12px', padding: 10, background: '#f7e7df', color: '#8f3215', fontSize: 12 }}>{error}</p>}<div style={{ padding: '13px 24px', borderTop: '1px solid var(--sand-line)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}><button type="button" onClick={closeEditor} style={{ padding: '10px 16px', border: '1px solid var(--sand-line)', background: 'transparent', cursor: 'pointer' }}>Cancel</button><button type="button" disabled={saving} onClick={() => document.querySelector<HTMLFormElement>('.admin-modal form')?.requestSubmit()} className="admin-button">{saving ? 'Saving…' : editing.id ? 'Save changes' : 'Create hike'}</button></div></div></div>}
  </div>
}

function Field({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) { return <label className={`admin-field ${full ? 'full' : ''}`}>{label}{children}</label> }

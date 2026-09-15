'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'

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
  hike_type?: string
  difficulty_numeric?: string
  scenery_rating?: number
  overall_rating?: number
  main_attraction?: string
  price_solo_usd?: number
  price_group_usd?: number
  distance_km?: number | null
  elevation_gain_m?: number | null
  starting_point?: string | null
  meeting_point?: string | null
  transport_options?: string | null
  fitness_required?: string | null
  terrain?: string | null
  what_to_bring?: string[]
  included?: string[]
  excluded?: string[]
  safety_info?: string | null
  weather_policy?: string | null
  age_requirements?: string | null
  min_participants?: number | null
  max_participants?: number | null
  experience_types?: string[]
  region?: string | null
  booking_type?: 'scheduled_group' | 'on_demand' | 'private'
  rating_label?: string
}

type Tab = 'basics' | 'trail' | 'booking' | 'customer' | 'safety' | 'publishing'

const tabs: { id: Tab; label: string; hint: string }[] = [
  { id: 'basics', label: 'Basics', hint: 'Route identity' },
  { id: 'trail', label: 'Trail', hint: 'Distance & terrain' },
  { id: 'booking', label: 'Booking', hint: 'Dates & pricing' },
  { id: 'customer', label: 'Customer info', hint: 'What guests need' },
  { id: 'safety', label: 'Safety', hint: 'Policies & risk' },
  { id: 'publishing', label: 'Publishing', hint: 'Status & ratings' },
]

const arrayFields = [
  ['what_to_bring', 'What to bring'],
  ['included', 'What’s included'],
  ['excluded', 'What’s not included'],
  ['experience_types', 'Experience tags'],
] as const

const inputStyle = {
  width: '100%', padding: '11px 12px', border: '1px solid var(--sand-line)',
  background: 'var(--warm-white)', color: 'var(--ink)', borderRadius: 2, fontSize: 14, outline: 'none',
}

export default function HikesAdminClient({ initialHikes }: { initialHikes: Hike[] }) {
  const [hikes, setHikes] = useState<Hike[]>(initialHikes)
  const [editingHike, setEditingHike] = useState<Partial<Hike> | null>(null)
  const [originalHike, setOriginalHike] = useState<Partial<Hike> | null>(null)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'moderate' | 'challenging'>('all')
  const [activeTab, setActiveTab] = useState<Tab>('basics')
  const [error, setError] = useState('')

  const visibleHikes = useMemo(() => hikes.filter(h => {
    const q = search.trim().toLowerCase()
    const matchesSearch = !q || [h.name, h.location, h.region, h.hike_type, h.main_attraction]
      .filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    return matchesSearch && (statusFilter === 'all' || h.status === statusFilter) && (difficultyFilter === 'all' || h.difficulty === difficultyFilter)
  }), [hikes, search, statusFilter, difficultyFilter])

  const stats = useMemo(() => ({
    total: hikes.length,
    published: hikes.filter(h => h.status === 'published').length,
    drafts: hikes.filter(h => h.status === 'draft').length,
    onDemand: hikes.filter(h => h.booking_type !== 'scheduled_group').length,
  }), [hikes])

  const isDirty = JSON.stringify(editingHike) !== JSON.stringify(originalHike)

  const closeModal = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Close without saving?')) return
    setEditingHike(null)
    setOriginalHike(null)
    setError('')
  }

  useEffect(() => {
    if (!editingHike) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [editingHike, isDirty])

  const openCreateModal = () => {
    const value: Partial<Hike> = {
      name: '', difficulty: 'moderate', date: '', duration: '', location: '', price: '',
      spots_total: 10, spots_remaining: 10, description: '', status: 'draft', booking_type: 'on_demand',
      what_to_bring: [], included: [], excluded: [], experience_types: [], rating_label: 'Peak Axis rating',
    }
    setEditingHike(value); setOriginalHike(value); setActiveTab('basics'); setError('')
  }

  const openEditModal = (h: Hike) => {
    const value = { ...h }
    setEditingHike(value); setOriginalHike(value); setActiveTab('basics'); setError('')
  }

  const set = (key: keyof Hike, value: unknown) => setEditingHike(p => p ? { ...p, [key]: value } : p)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingHike) return
    if (!editingHike.name?.trim()) { setError('Route name is required.'); setActiveTab('basics'); return }
    if (!editingHike.location?.trim()) { setError('Location is required.'); setActiveTab('basics'); return }
    if (!editingHike.duration?.trim()) { setError('Duration is required.'); setActiveTab('trail'); return }
    if (!editingHike.price?.trim()) { setError('Price is required.'); setActiveTab('booking'); return }
    if (editingHike.booking_type === 'scheduled_group' && !editingHike.date?.trim()) { setError('A scheduled group hike needs a date.'); setActiveTab('booking'); return }

    setLoading(true); setError('')
    try {
      const isEdit = Boolean(editingHike.id)
      const res = await fetch(isEdit ? `/api/admin/hikes/${editingHike.id}` : '/api/admin/hikes', {
        method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingHike),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.success || !json.data?.[0]) {
        setError(json.error || 'Could not save this hike. Please check the fields and try again.')
        return
      }
      const saved = json.data[0] as Hike
      setHikes(p => isEdit ? p.map(h => h.id === saved.id ? saved : h) : [saved, ...p])
      setEditingHike(null); setOriginalHike(null)
    } catch (err) {
      console.error(err); setError('Network error. Please try again.')
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this hike permanently? This cannot be undone.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/hikes/${id}`, { method: 'DELETE' })
      if (res.ok) setHikes(p => p.filter(h => h.id !== id))
      else window.alert('Could not delete the hike.')
    } catch { window.alert('Network error while deleting.') }
    finally { setDeletingId(null) }
  }

  const toggleStatus = async (h: Hike) => {
    const status = h.status === 'published' ? 'draft' : 'published'
    try {
      const res = await fetch(`/api/admin/hikes/${h.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...h, status }) })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.success) setHikes(p => p.map(x => x.id === h.id ? ((json.data?.[0] || { ...h, status }) as Hike) : x))
      else window.alert(json.error || 'Could not update status.')
    } catch { window.alert('Network error while updating status.') }
  }

  const formatBooking = (h: Hike) => h.booking_type === 'scheduled_group' ? 'Scheduled group' : h.booking_type === 'private' ? 'Private / on-demand' : 'On-demand'

  return <div className="admin-hikes">
    <style>{` .admin-hikes{color:var(--ink)}.admin-top{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:24px}.admin-title{font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:38px;line-height:.95;text-transform:uppercase;margin:0}.admin-subtitle{color:#625e56;font-size:14px;margin:8px 0 0}.admin-add{background:var(--ember);color:#fff;border:0;padding:12px 18px;font-weight:800;cursor:pointer;white-space:nowrap}.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}.stat-card{background:var(--warm-white);border:1px solid var(--sand-line);padding:16px 18px}.stat-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#777168}.stat-value{font:900 28px/.9 'Big Shoulders Display',sans-serif;margin-top:8px}.toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}.search{flex:1 1 260px;min-width:220px;padding:11px 13px;border:1px solid var(--sand-line);background:var(--warm-white);font-size:14px}.filter{padding:10px 12px;border:1px solid var(--sand-line);background:var(--warm-white);font-size:13px}.result-count{font-size:12px;color:#777168;align-self:center;margin-left:auto}.table-card{background:var(--warm-white);border:1px solid var(--sand-line);overflow:hidden}.table-wrap{overflow-x:auto}.admin-table{width:100%;border-collapse:collapse;text-align:left;font-size:13px}.admin-table th{padding:11px 14px;border-bottom:2px solid var(--sand-line);font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#777168;white-space:nowrap}.admin-table td{padding:14px;border-bottom:1px solid var(--sand-line);vertical-align:middle}.admin-table tr:last-child td{border-bottom:0}.route-name{font-weight:800;font-size:14px}.route-meta{font-size:11px;color:#777168;margin-top:4px}.format{font-weight:700;font-size:12px}.muted{font-size:11px;color:#777168;margin-top:3px}.status-btn{border:0;padding:5px 8px;color:#fff;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;cursor:pointer}.status-published{background:var(--teal)}.status-draft{background:#69645d}.actions{display:flex;gap:6px;white-space:nowrap}.action-btn{padding:7px 9px;border:1px solid var(--sand-line);background:transparent;cursor:pointer;font-size:11px;font-weight:700}.delete-btn{color:var(--ember);border-color:#d7b9ab}.empty{padding:46px 20px;text-align:center;color:#777168}.empty strong{display:block;color:var(--ink);font-size:15px;margin-bottom:5px}.modal-backdrop{position:fixed;inset:0;background:rgba(20,22,20,.62);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px}.modal{width:min(960px,100%);height:min(900px,94vh);background:var(--warm-white);display:flex;flex-direction:column;box-shadow:0 24px 70px rgba(0,0,0,.25)}.modal-head{padding:20px 24px 16px;border-bottom:1px solid var(--sand-line);display:flex;justify-content:space-between;gap:20px}.modal-title{font:900 28px/.95 'Big Shoulders Display',sans-serif;text-transform:uppercase}.modal-help{font-size:12px;color:#777168;margin-top:6px}.close{border:0;background:transparent;font-size:26px;line-height:1;cursor:pointer;color:#625e56}.tabs{display:flex;overflow-x:auto;border-bottom:1px solid var(--sand-line);padding:0 12px;background:#f3f0e8}.tab{flex:0 0 auto;border:0;background:transparent;padding:12px 13px;cursor:pointer;text-align:left;color:#625e56}.tab strong{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.05em}.tab span{display:block;font-size:10px;margin-top:2px}.tab.active{color:var(--ink);background:var(--warm-white);box-shadow:inset 0 -2px 0 var(--ember)}.modal-body{padding:22px 24px;overflow-y:auto;flex:1}.section-title{font:900 22px/.95 'Big Shoulders Display',sans-serif;text-transform:uppercase;margin:0 0 5px}.section-help{font-size:12px;color:#777168;margin:0 0 18px}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.form-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}.form-grid.four{grid-template-columns:repeat(4,minmax(0,1fr))}.field.full{grid-column:1/-1}.field label{display:block;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#625e56;margin-bottom:6px}.field small{display:block;color:#8a847b;font-size:10px;margin-top:5px;line-height:1.4}.field textarea{resize:vertical;min-height:90px}.info-note{background:#eeeadf;border-left:3px solid var(--ember);padding:12px 14px;font-size:12px;line-height:1.5;color:#625e56;margin-bottom:18px}.modal-error{margin:0 24px 12px;padding:11px 13px;background:#f7e7df;color:#8f3215;border:1px solid #e3c0b0;font-size:12px}.modal-foot{padding:13px 24px;border-top:1px solid var(--sand-line);display:flex;align-items:center;justify-content:space-between;gap:14px}.dirty-note{font-size:11px;color:#8a847b}.foot-actions{display:flex;gap:8px}.btn-secondary,.btn-primary{padding:10px 16px;border:1px solid var(--sand-line);font-size:12px;font-weight:800;cursor:pointer}.btn-secondary{background:transparent}.btn-primary{background:var(--ember);color:#fff;border-color:var(--ember)}.btn-primary:disabled{opacity:.55;cursor:wait}.completion{font-size:11px;color:#777168;margin-top:18px}@media(max-width:800px){.admin-top{align-items:flex-start;flex-direction:column}.stat-grid{grid-template-columns:repeat(2,1fr)}.form-grid,.form-grid.three,.form-grid.four{grid-template-columns:1fr}.field.full{grid-column:auto}.modal-head{padding:17px}.modal-body{padding:18px}.modal-foot{padding:12px 17px}.dirty-note{display:none}}@media(max-width:560px){.admin-title{font-size:32px}.admin-add{width:100%}.stat-grid{gap:7px}.stat-card{padding:13px}.stat-value{font-size:24px}.modal-backdrop{padding:0}.modal{height:100vh}.result-count{width:100%;margin-left:0}.admin-table th:nth-child(2),.admin-table td:nth-child(2){display:none}}select,input,textarea{font:inherit}`}</style>

    <header className="admin-top"><div><h1 className="admin-title">Hikes Management</h1><p className="admin-subtitle">Keep every route accurate, bookable and ready for customers.</p></div><button className="admin-add" onClick={openCreateModal}>+ Add hike</button></header>
    <div className="stat-grid"><div className="stat-card"><div className="stat-label">Total routes</div><div className="stat-value">{stats.total}</div></div><div className="stat-card"><div className="stat-label">Published</div><div className="stat-value">{stats.published}</div></div><div className="stat-card"><div className="stat-label">Drafts</div><div className="stat-value">{stats.drafts}</div></div><div className="stat-card"><div className="stat-label">On-demand</div><div className="stat-value">{stats.onDemand}</div></div></div>
    <div className="toolbar"><input className="search" aria-label="Search hikes" placeholder="Search by route, location or region…" value={search} onChange={e => setSearch(e.target.value)}/><select className="filter" aria-label="Filter status" value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></select><select className="filter" aria-label="Filter difficulty" value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value as typeof difficultyFilter)}><option value="all">All difficulty</option><option value="easy">Easy</option><option value="moderate">Moderate</option><option value="challenging">Challenging</option></select><span className="result-count">Showing {visibleHikes.length} of {hikes.length}</span></div>
    <div className="table-card"><div className="table-wrap"><table className="admin-table"><thead><tr><th>Route</th><th>Difficulty</th><th>Format</th><th>Price / capacity</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visibleHikes.map(h => <tr key={h.id}><td><div className="route-name">{h.name}</div><div className="route-meta">📍 {h.location}{h.region ? ` · ${h.region}` : ''}</div></td><td><span>{h.difficulty}{h.difficulty_numeric ? ` · ${h.difficulty_numeric}` : ''}</span></td><td><div className="format">{formatBooking(h)}</div><div className="muted">⏱ {h.duration || 'Duration not set'}</div></td><td><div className="format">{h.price || 'Price not set'}</div><div className="muted">{h.booking_type === 'scheduled_group' ? `${h.spots_remaining ?? 0} / ${h.spots_total ?? 0} spots` : 'Flexible booking'}</div></td><td><button className={`status-btn status-${h.status}`} title={`Switch to ${h.status === 'published' ? 'draft' : 'published'}`} onClick={() => toggleStatus(h)}>{h.status}</button></td><td><div className="actions"><button className="action-btn" onClick={() => openEditModal(h)}>Edit</button><button className="action-btn delete-btn" disabled={deletingId === h.id} onClick={() => handleDelete(h.id)}>{deletingId === h.id ? '…' : 'Delete'}</button></div></td></tr>)}</tbody></table></div>{visibleHikes.length === 0 && <div className="empty"><strong>No hikes found</strong>Try a different search or clear your filters.</div>}</div>

    {editingHike && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={editingHike.id ? 'Edit hike' : 'Create hike'} onMouseDown={e => { if (e.target === e.currentTarget) closeModal() }}><div className="modal">
      <div className="modal-head"><div><div className="modal-title">{editingHike.id ? 'Edit hike' : 'Create hike'}</div><div className="modal-help">Complete verified customer-facing details. Unknown trail facts can stay blank.</div></div><button type="button" className="close" aria-label="Close" onClick={closeModal}>×</button></div>
      <nav className="tabs" aria-label="Hike editor sections">{tabs.map(t => <button key={t.id} type="button" className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => { setActiveTab(t.id); setError('') }}><strong>{t.label}</strong><span>{t.hint}</span></button>)}</nav>
      <form onSubmit={handleSave} className="modal-body">
        {activeTab === 'basics' && <><h2 className="section-title">Route identity</h2><p className="section-help">The information customers see first in the catalogue.</p><div className="form-grid"><Field label="Route name *"><input required value={editingHike.name || ''} onChange={e => set('name', e.target.value)} style={inputStyle}/></Field><Field label="Difficulty"><select value={editingHike.difficulty || 'moderate'} onChange={e => set('difficulty', e.target.value)} style={inputStyle}><option value="easy">Easy</option><option value="moderate">Moderate</option><option value="challenging">Challenging</option></select></Field><Field label="Location *"><input required value={editingHike.location || ''} onChange={e => set('location', e.target.value)} style={inputStyle}/></Field><Field label="Region"><input value={editingHike.region || ''} onChange={e => set('region', e.target.value)} placeholder="e.g. Moka Range" style={inputStyle}/></Field><Field label="Experience / route type"><input value={editingHike.hike_type || ''} onChange={e => set('hike_type', e.target.value)} placeholder="e.g. Summit hike" style={inputStyle}/></Field><Field label="Main attraction"><input value={editingHike.main_attraction || ''} onChange={e => set('main_attraction', e.target.value)} placeholder="What makes this route special?" style={inputStyle}/></Field><Field label="Description" full><textarea rows={5} value={editingHike.description || ''} onChange={e => set('description', e.target.value)} style={inputStyle}/></Field></div></>}
        {activeTab === 'trail' && <><h2 className="section-title">Trail facts</h2><p className="section-help">Use verified route data only. Unknown facts can stay blank.</p><div className="form-grid four"><Field label="Distance (km)"><input type="number" min="0" step="0.1" value={editingHike.distance_km ?? ''} onChange={e => set('distance_km', e.target.value ? Number(e.target.value) : null)} style={inputStyle}/></Field><Field label="Elevation gain (m)"><input type="number" min="0" value={editingHike.elevation_gain_m ?? ''} onChange={e => set('elevation_gain_m', e.target.value ? Number(e.target.value) : null)} style={inputStyle}/></Field><Field label="Duration *"><input required value={editingHike.duration || ''} onChange={e => set('duration', e.target.value)} placeholder="e.g. 2–3 hrs" style={inputStyle}/></Field><Field label="Difficulty score"><input value={editingHike.difficulty_numeric || ''} onChange={e => set('difficulty_numeric', e.target.value)} placeholder="e.g. 5/10" style={inputStyle}/></Field></div><div className="form-grid"><Field label="Terrain"><input value={editingHike.terrain || ''} onChange={e => set('terrain', e.target.value)} placeholder="e.g. Rocky, exposed sections" style={inputStyle}/></Field><Field label="Fitness required"><input value={editingHike.fitness_required || ''} onChange={e => set('fitness_required', e.target.value)} placeholder="e.g. Moderate fitness" style={inputStyle}/></Field></div><div className="completion">These details are optional. <strong>Blank is better than an unverified number.</strong></div></>}
        {activeTab === 'booking' && <><h2 className="section-title">Booking & logistics</h2><p className="section-help">Make the booking format and customer expectations unambiguous.</p><div className="info-note"><strong>Scheduled group:</strong> a specific date is published and places are limited. <strong>On-demand:</strong> customers enquire for a suitable date. <strong>Private:</strong> the route is arranged for one group.</div><div className="form-grid"><Field label="Booking format"><select value={editingHike.booking_type || 'on_demand'} onChange={e => set('booking_type', e.target.value)} style={inputStyle}><option value="scheduled_group">Scheduled group hike</option><option value="on_demand">On-demand hike</option><option value="private">Private / on-demand</option></select></Field><Field label="Scheduled date"><input value={editingHike.date || ''} onChange={e => set('date', e.target.value)} placeholder="Only needed for a scheduled group" style={inputStyle}/></Field><Field label="Price *"><input required value={editingHike.price || ''} onChange={e => set('price', e.target.value)} placeholder="e.g. Rs 1,500 pp" style={inputStyle}/></Field><Field label="Group price (USD)"><input type="number" min="0" value={editingHike.price_group_usd ?? ''} onChange={e => set('price_group_usd', e.target.value ? Number(e.target.value) : null)} style={inputStyle}/></Field><Field label="Solo / private price (USD)"><input type="number" min="0" value={editingHike.price_solo_usd ?? ''} onChange={e => set('price_solo_usd', e.target.value ? Number(e.target.value) : null)} style={inputStyle}/></Field><Field label="Max participants"><input type="number" min="1" value={editingHike.max_participants ?? ''} onChange={e => set('max_participants', e.target.value ? Number(e.target.value) : null)} style={inputStyle}/></Field><Field label="Min participants"><input type="number" min="1" value={editingHike.min_participants ?? ''} onChange={e => set('min_participants', e.target.value ? Number(e.target.value) : null)} style={inputStyle}/>{editingHike.booking_type === 'scheduled_group' && <><Field label="Remaining spots"><input type="number" min="0" value={editingHike.spots_remaining ?? 0} onChange={e => set('spots_remaining', Number(e.target.value))} style={inputStyle}/></Field><Field label="Total spots"><input type="number" min="1" value={editingHike.spots_total ?? 10} onChange={e => set('spots_total', Number(e.target.value))} style={inputStyle}/></>}<Field label="Age requirements"><input value={editingHike.age_requirements || ''} onChange={e => set('age_requirements', e.target.value)} placeholder="e.g. 12+ with guardian" style={inputStyle}/></Field><Field label="Starting point"><input value={editingHike.starting_point || ''} onChange={e => set('starting_point', e.target.value)} style={inputStyle}/></Field><Field label="Meeting point"><input value={editingHike.meeting_point || ''} onChange={e => set('meeting_point', e.target.value)} style={inputStyle}/><Field label="Transport / parking" full><textarea rows={3} value={editingHike.transport_options || ''} onChange={e => set('transport_options', e.target.value)} style={inputStyle}/></Field></div></>}
        {activeTab === 'customer' && <><h2 className="section-title">Customer preparation</h2><p className="section-help">One item per line. Keep wording short enough to scan on the public hike page.</p><div className="form-grid">{arrayFields.map(([key, label]) => <Field key={key} label={label} full><textarea rows={5} value={(editingHike[key] || []).join('\n')} onChange={e => set(key, e.target.value.split('\n').map(x => x.trim()).filter(Boolean))} placeholder={`Add ${label.toLowerCase()}…`} style={inputStyle}/></Field>)}</div></>}
        {activeTab === 'safety' && <><h2 className="section-title">Safety & weather</h2><p className="section-help">Set expectations clearly. Avoid generic promises or unverified safety claims.</p><div className="form-grid"><Field label="Safety information" full><textarea rows={6} value={editingHike.safety_info || ''} onChange={e => set('safety_info', e.target.value)} style={inputStyle}/></Field><Field label="Weather policy" full><textarea rows={6} value={editingHike.weather_policy || ''} onChange={e => set('weather_policy', e.target.value)} style={inputStyle}/></Field></div></>}
        {activeTab === 'publishing' && <><h2 className="section-title">Publishing & ratings</h2><p className="section-help">Control visibility and clearly attribute internal ratings.</p><div className="form-grid three"><Field label="Status"><select value={editingHike.status || 'draft'} onChange={e => set('status', e.target.value)} style={inputStyle}><option value="published">Published</option><option value="draft">Draft</option></select></Field><Field label="Scenery /10"><input type="number" min="0" max="10" step="0.1" value={editingHike.scenery_rating ?? ''} onChange={e => set('scenery_rating', e.target.value ? Number(e.target.value) : null)} style={inputStyle}/></Field><Field label="Overall /10"><input type="number" min="0" max="10" step="0.1" value={editingHike.overall_rating ?? ''} onChange={e => set('overall_rating', e.target.value ? Number(e.target.value) : null)} style={inputStyle}/></Field><Field label="Rating attribution" full><input value={editingHike.rating_label || 'Peak Axis rating'} onChange={e => set('rating_label', e.target.value)} style={inputStyle}/></Field></div></>}
      </form>
      {error && <div className="modal-error" role="alert">{error}</div>}
      <div className="modal-foot"><div className="dirty-note">{isDirty ? 'Unsaved changes' : 'All changes saved'}</div><div className="foot-actions"><button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button><button type="button" className="btn-primary" disabled={loading} onClick={() => document.querySelector<HTMLFormElement>('.modal form')?.requestSubmit()}>{loading ? 'Saving…' : editingHike.id ? 'Save changes' : 'Create hike'}</button></div></div>
    </div></div>}
  </div>
}

function Field({ label, children, full = false }: { label: string; children: ReactNode; full?: boolean }) {
  return <div className={`field ${full ? 'full' : ''}`}><label>{label}</label>{children}</div>
}

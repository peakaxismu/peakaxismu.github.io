'use client'

import { useState } from 'react'

interface ItineraryDay {
  day_number: string
  title: string
  body: string
  duration_note: string
}

interface PackingCategory {
  category: string
  items: string[]
}

interface Expedition {
  id: string
  slug: string
  name: string
  destination: string
  duration_days: number
  difficulty: string
  price_from: string
  group_size_min: number
  group_size_max: number
  summit_elevation: string | null
  next_departure: string | null
  description: string | null
  itinerary: ItineraryDay[]
  included: string[]
  not_included: string[]
  packing_list: PackingCategory[]
  safety_notes: string | null
  status: 'draft' | 'published'
}

export default function ExpeditionsAdminClient({ initialExpeditions }: { initialExpeditions: Expedition[] }) {
  const [expeditions, setExpeditions] = useState<Expedition[]>(initialExpeditions)
  const [editingExp, setEditingExp] = useState<Partial<Expedition> | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const openCreateModal = () => {
    setEditingExp({
      slug: '',
      name: '',
      destination: 'La Réunion',
      duration_days: 3,
      difficulty: 'Moderate–Challenging',
      price_from: 'Rs 18,500',
      group_size_min: 6,
      group_size_max: 12,
      summit_elevation: '2,632 m',
      next_departure: '',
      description: '',
      itinerary: [{ day_number: '01', title: '', body: '', duration_note: '' }],
      included: [''],
      not_included: [''],
      packing_list: [{ category: 'Equipment', items: [''] }],
      safety_notes: '',
      status: 'published',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (exp: Expedition) => {
    setEditingExp({
      ...exp,
      itinerary: Array.isArray(exp.itinerary) ? exp.itinerary : [],
      included: Array.isArray(exp.included) ? exp.included : [],
      not_included: Array.isArray(exp.not_included) ? exp.not_included : [],
      packing_list: Array.isArray(exp.packing_list) ? exp.packing_list : [],
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExp) return
    setLoading(true)

    try {
      const isEdit = !!editingExp.id
      const url = isEdit ? `/api/admin/expeditions/${editingExp.id}` : '/api/admin/expeditions'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingExp),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        if (isEdit) {
          setExpeditions((prev) => prev.map((item) => (item.id === editingExp.id ? json.data[0] : item)))
        } else {
          setExpeditions((prev) => [json.data[0], ...prev])
        }
        setIsModalOpen(false)
        setEditingExp(null)
      } else {
        alert(json.error || 'Failed to save expedition')
      }
    } catch {
      alert('Error saving expedition')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expedition?')) return
    try {
      const res = await fetch(`/api/admin/expeditions/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setExpeditions((prev) => prev.filter((item) => item.id !== id))
      } else {
        alert('Failed to delete expedition')
      }
    } catch {
      alert('Error deleting expedition')
    }
  }

  // Repeatable field helpers
  const addItineraryDay = () => {
    const list = editingExp?.itinerary || []
    const nextNum = String(list.length + 1).padStart(2, '0')
    setEditingExp({
      ...editingExp,
      itinerary: [...list, { day_number: nextNum, title: '', body: '', duration_note: '' }],
    })
  }

  const updateItineraryDay = (idx: number, field: keyof ItineraryDay, val: string) => {
    const list = [...(editingExp?.itinerary || [])]
    list[idx] = { ...list[idx], [field]: val }
    setEditingExp({ ...editingExp, itinerary: list })
  }

  const removeItineraryDay = (idx: number) => {
    const list = [...(editingExp?.itinerary || [])]
    list.splice(idx, 1)
    setEditingExp({ ...editingExp, itinerary: list })
  }

  const addIncludedItem = () => {
    setEditingExp({ ...editingExp, included: [...(editingExp?.included || []), ''] })
  }

  const updateIncludedItem = (idx: number, val: string) => {
    const list = [...(editingExp?.included || [])]
    list[idx] = val
    setEditingExp({ ...editingExp, included: list })
  }

  const removeIncludedItem = (idx: number) => {
    const list = [...(editingExp?.included || [])]
    list.splice(idx, 1)
    setEditingExp({ ...editingExp, included: list })
  }

  const addNotIncludedItem = () => {
    setEditingExp({ ...editingExp, not_included: [...(editingExp?.not_included || []), ''] })
  }

  const updateNotIncludedItem = (idx: number, val: string) => {
    const list = [...(editingExp?.not_included || [])]
    list[idx] = val
    setEditingExp({ ...editingExp, not_included: list })
  }

  const removeNotIncludedItem = (idx: number) => {
    const list = [...(editingExp?.not_included || [])]
    list.splice(idx, 1)
    setEditingExp({ ...editingExp, not_included: list })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Big Shoulders Display', fontWeight: 900, fontSize: '36px', textTransform: 'uppercase' }}>
            Expeditions Management
          </h1>
          <p style={{ color: '#5a564f', fontSize: '15px', marginTop: '4px' }}>
            Manage multi-day expeditions, itineraries, inclusions, and packing lists.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          style={{ background: 'var(--ember)', color: '#FAF8F3', border: 'none', padding: '12px 24px', fontFamily: 'Inter', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer' }}
        >
          + Add New Expedition
        </button>
      </div>

      <div style={{ background: 'var(--warm-white)', border: '1px solid var(--sand-line)', padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--sand-line)' }}>
              <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Expedition</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Destination</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Duration</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Price &amp; Departure</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Status</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expeditions.map((exp) => (
              <tr key={exp.id} style={{ borderBottom: '1px solid var(--sand-line)' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '15.5px' }}>{exp.name}</div>
                  <div style={{ fontSize: '12.5px', color: '#5a564f' }}>Slug: /{exp.slug}</div>
                </td>
                <td style={{ padding: '16px' }}>{exp.destination}</td>
                <td style={{ padding: '16px' }}>{exp.duration_days} Days</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600 }}>From {exp.price_from}</div>
                  <div style={{ fontSize: '12.5px', color: '#5a564f' }}>{exp.next_departure || 'N/A'}</div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: exp.status === 'published' ? 'var(--teal)' : '#888',
                      color: '#FFF',
                    }}
                  >
                    {exp.status}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openEditModal(exp)}
                      style={{ background: 'none', border: '1px solid var(--ink)', padding: '4px 10px', fontSize: '12.5px', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      style={{ background: 'none', border: '1px solid #C1440E', color: '#C1440E', padding: '4px 10px', fontSize: '12.5px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && editingExp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: 'var(--warm-white)', border: '1px solid var(--sand-line)', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
            <h2 style={{ fontFamily: 'Big Shoulders Display', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', marginBottom: '20px' }}>
              {editingExp.id ? 'Edit Expedition' : 'Create Expedition'}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Expedition Name *</label>
                  <input
                    type="text"
                    required
                    value={editingExp.name || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Slug (URL identifier)</label>
                  <input
                    type="text"
                    value={editingExp.slug || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, slug: e.target.value })}
                    placeholder="e.g. piton-de-la-fournaise"
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Destination *</label>
                  <input
                    type="text"
                    required
                    value={editingExp.destination || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, destination: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Duration (Days) *</label>
                  <input
                    type="number"
                    required
                    value={editingExp.duration_days || 1}
                    onChange={(e) => setEditingExp({ ...editingExp, duration_days: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Price From *</label>
                  <input
                    type="text"
                    required
                    value={editingExp.price_from || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, price_from: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Summit Elevation</label>
                  <input
                    type="text"
                    value={editingExp.summit_elevation || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, summit_elevation: e.target.value })}
                    placeholder="2,632 m"
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Next Departure</label>
                  <input
                    type="text"
                    value={editingExp.next_departure || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, next_departure: e.target.value })}
                    placeholder="14 Nov 2025"
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Status</label>
                  <select
                    value={editingExp.status || 'published'}
                    onChange={(e) => setEditingExp({ ...editingExp, status: e.target.value as 'draft' | 'published' })}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Description</label>
                <textarea
                  rows={3}
                  value={editingExp.description || ''}
                  onChange={(e) => setEditingExp({ ...editingExp, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                />
              </div>

              {/* Repeatable Group: Itinerary Days */}
              <div style={{ borderTop: '1px solid var(--sand-line)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase' }}>Itinerary Days</h3>
                  <button type="button" onClick={addItineraryDay} style={{ background: 'var(--teal)', color: '#FFF', border: 'none', padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}>
                    + Add Day
                  </button>
                </div>
                {editingExp.itinerary?.map((day, idx) => (
                  <div key={idx} style={{ background: '#FFF', border: '1px solid var(--sand-line)', padding: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        placeholder="Day (01)"
                        value={day.day_number}
                        onChange={(e) => updateItineraryDay(idx, 'day_number', e.target.value)}
                        style={{ width: '70px', padding: '6px', border: '1px solid var(--sand-line)' }}
                      />
                      <input
                        type="text"
                        placeholder="Title"
                        value={day.title}
                        onChange={(e) => updateItineraryDay(idx, 'title', e.target.value)}
                        style={{ flex: 1, padding: '6px', border: '1px solid var(--sand-line)' }}
                      />
                      <button type="button" onClick={() => removeItineraryDay(idx)} style={{ color: '#C1440E', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                    </div>
                    <textarea
                      placeholder="Day overview body"
                      rows={2}
                      value={day.body}
                      onChange={(e) => updateItineraryDay(idx, 'body', e.target.value)}
                      style={{ width: '100%', padding: '6px', border: '1px solid var(--sand-line)', marginBottom: '8px' }}
                    />
                    <input
                      type="text"
                      placeholder="Duration note (e.g. Flight 45m · Drive 2h)"
                      value={day.duration_note}
                      onChange={(e) => updateItineraryDay(idx, 'duration_note', e.target.value)}
                      style={{ width: '100%', padding: '6px', border: '1px solid var(--sand-line)' }}
                    />
                  </div>
                ))}
              </div>

              {/* Repeatable Group: Included / Not Included */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid var(--sand-line)', paddingTop: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>What&apos;s Included</h3>
                    <button type="button" onClick={addIncludedItem} style={{ fontSize: '12px', background: 'none', border: 'none', color: 'var(--ember)', cursor: 'pointer' }}>+ Add</button>
                  </div>
                  {editingExp.included?.map((inc, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <input
                        type="text"
                        value={inc}
                        onChange={(e) => updateIncludedItem(idx, e.target.value)}
                        style={{ flex: 1, padding: '6px', border: '1px solid var(--sand-line)' }}
                      />
                      <button type="button" onClick={() => removeIncludedItem(idx)} style={{ color: '#C1440E', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>What&apos;s Not Included</h3>
                    <button type="button" onClick={addNotIncludedItem} style={{ fontSize: '12px', background: 'none', border: 'none', color: 'var(--ember)', cursor: 'pointer' }}>+ Add</button>
                  </div>
                  {editingExp.not_included?.map((ninc, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <input
                        type="text"
                        value={ninc}
                        onChange={(e) => updateNotIncludedItem(idx, e.target.value)}
                        style={{ flex: 1, padding: '6px', border: '1px solid var(--sand-line)' }}
                      />
                      <button type="button" onClick={() => removeNotIncludedItem(idx)} style={{ color: '#C1440E', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Safety Notes</label>
                <textarea
                  rows={2}
                  value={editingExp.safety_notes || ''}
                  onChange={(e) => setEditingExp({ ...editingExp, safety_notes: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'none', border: '1px solid var(--ink)', padding: '10px 20px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ background: 'var(--ember)', color: '#FAF8F3', border: 'none', padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {loading ? 'Saving...' : 'Save Expedition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

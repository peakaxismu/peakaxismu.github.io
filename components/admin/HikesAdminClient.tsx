'use client'

import { useState } from 'react'

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
}

export default function HikesAdminClient({ initialHikes }: { initialHikes: Hike[] }) {
  const [hikes, setHikes] = useState<Hike[]>(initialHikes)
  const [editingHike, setEditingHike] = useState<Partial<Hike> | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const openCreateModal = () => {
    setEditingHike({
      name: '',
      difficulty: 'moderate',
      date: '',
      duration: 'Half-day',
      location: '',
      price: 'Rs 900',
      spots_total: 10,
      spots_remaining: 10,
      description: '',
      status: 'published',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (hike: Hike) => {
    setEditingHike(hike)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingHike) return
    setLoading(true)

    try {
      const isEdit = !!editingHike.id
      const url = isEdit ? `/api/admin/hikes/${editingHike.id}` : '/api/admin/hikes'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingHike),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        if (isEdit) {
          setHikes((prev) => prev.map((h) => (h.id === editingHike.id ? json.data[0] : h)))
        } else {
          setHikes((prev) => [json.data[0], ...prev])
        }
        setIsModalOpen(false)
        setEditingHike(null)
      } else {
        alert(json.error || 'Failed to save hike')
      }
    } catch {
      alert('Error saving hike')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hike?')) return
    try {
      const res = await fetch(`/api/admin/hikes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setHikes((prev) => prev.filter((h) => h.id !== id))
      } else {
        alert('Failed to delete hike')
      }
    } catch {
      alert('Error deleting hike')
    }
  }

  const toggleStatus = async (hike: Hike) => {
    const newStatus = hike.status === 'published' ? 'draft' : 'published'
    try {
      const res = await fetch(`/api/admin/hikes/${hike.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...hike, status: newStatus }),
      })
      if (res.ok) {
        setHikes((prev) =>
          prev.map((h) => (h.id === hike.id ? { ...h, status: newStatus } : h))
        )
      }
    } catch {
      alert('Error toggling status')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Big Shoulders Display', fontWeight: 900, fontSize: '36px', textTransform: 'uppercase' }}>
            Hikes Management
          </h1>
          <p style={{ color: '#5a564f', fontSize: '15px', marginTop: '4px' }}>
            Add, edit, or publish scheduled group hikes on the site.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          style={{ background: 'var(--ember)', color: '#FAF8F3', border: 'none', padding: '12px 24px', fontFamily: 'Inter', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer' }}
        >
          + Add New Hike
        </button>
      </div>

      <div style={{ background: 'var(--warm-white)', border: '1px solid var(--sand-line)', padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--sand-line)' }}>
              <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Route Name</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Difficulty</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Date &amp; Duration</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Price &amp; Spots</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Status</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hikes.map((h) => (
              <tr key={h.id} style={{ borderBottom: '1px solid var(--sand-line)' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{h.name}</div>
                  <div style={{ fontSize: '12.5px', color: '#5a564f' }}>📍 {h.location}</div>
                </td>
                <td style={{ padding: '16px', textTransform: 'capitalize' }}>
                  <span className={`diff diff-${h.difficulty}`}>{h.difficulty}</span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div>📅 {h.date}</div>
                  <div style={{ fontSize: '12.5px', color: '#5a564f' }}>⏱ {h.duration}</div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600 }}>{h.price}</div>
                  <div style={{ fontSize: '12.5px', color: '#5a564f' }}>
                    {h.spots_remaining} / {h.spots_total} spots left
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <button
                    onClick={() => toggleStatus(h)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      background: h.status === 'published' ? 'var(--teal)' : '#888',
                      color: '#FFF',
                    }}
                  >
                    {h.status}
                  </button>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openEditModal(h)}
                      style={{ background: 'none', border: '1px solid var(--ink)', padding: '4px 10px', fontSize: '12.5px', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(h.id)}
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
      {isModalOpen && editingHike && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: 'var(--warm-white)', border: '1px solid var(--sand-line)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
            <h2 style={{ fontFamily: 'Big Shoulders Display', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', marginBottom: '20px' }}>
              {editingHike.id ? 'Edit Hike' : 'Create New Hike'}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Route Name *</label>
                <input
                  type="text"
                  required
                  value={editingHike.name || ''}
                  onChange={(e) => setEditingHike({ ...editingHike, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Difficulty *</label>
                  <select
                    value={editingHike.difficulty || 'moderate'}
                    onChange={(e) => setEditingHike({ ...editingHike, difficulty: e.target.value as any })}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="challenging">Challenging</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Location *</label>
                  <input
                    type="text"
                    required
                    value={editingHike.location || ''}
                    onChange={(e) => setEditingHike({ ...editingHike, location: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Scheduled Date *</label>
                  <input
                    type="text"
                    required
                    value={editingHike.date || ''}
                    onChange={(e) => setEditingHike({ ...editingHike, date: e.target.value })}
                    placeholder="e.g. Sat 12 Sep"
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Duration *</label>
                  <input
                    type="text"
                    required
                    value={editingHike.duration || ''}
                    onChange={(e) => setEditingHike({ ...editingHike, duration: e.target.value })}
                    placeholder="e.g. Half-day / 4 hours"
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Price *</label>
                  <input
                    type="text"
                    required
                    value={editingHike.price || ''}
                    onChange={(e) => setEditingHike({ ...editingHike, price: e.target.value })}
                    placeholder="Rs 900"
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Total Spots</label>
                  <input
                    type="number"
                    value={editingHike.spots_total || 10}
                    onChange={(e) => setEditingHike({ ...editingHike, spots_total: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Remaining Spots</label>
                  <input
                    type="number"
                    value={editingHike.spots_remaining ?? 10}
                    onChange={(e) => setEditingHike({ ...editingHike, spots_remaining: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Description</label>
                <textarea
                  rows={3}
                  value={editingHike.description || ''}
                  onChange={(e) => setEditingHike({ ...editingHike, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Status</label>
                <select
                  value={editingHike.status || 'published'}
                  onChange={(e) => setEditingHike({ ...editingHike, status: e.target.value as any })}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
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
                  {loading ? 'Saving...' : 'Save Hike'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

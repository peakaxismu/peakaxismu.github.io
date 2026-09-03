'use client'

import { useState } from 'react'

interface TeamPackage {
  id: string
  name: string
  type: 'outdoor' | 'indoor'
  description: string
  status: 'draft' | 'published'
}

export default function TeamBuildingAdminClient({ initialPackages }: { initialPackages: TeamPackage[] }) {
  const [packages, setPackages] = useState<TeamPackage[]>(initialPackages)
  const [editingPkg, setEditingPkg] = useState<Partial<TeamPackage> | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const openCreateModal = () => {
    setEditingPkg({
      name: '',
      type: 'outdoor',
      description: '',
      status: 'published',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (pkg: TeamPackage) => {
    setEditingPkg(pkg)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPkg) return
    setLoading(true)

    try {
      const isEdit = !!editingPkg.id
      const url = isEdit ? `/api/admin/team-building/${editingPkg.id}` : '/api/admin/team-building'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPkg),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        if (isEdit) {
          setPackages((prev) => prev.map((p) => (p.id === editingPkg.id ? json.data[0] : p)))
        } else {
          setPackages((prev) => [json.data[0], ...prev])
        }
        setIsModalOpen(false)
        setEditingPkg(null)
      } else {
        alert(json.error || 'Failed to save package')
      }
    } catch {
      alert('Error saving package')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return
    try {
      const res = await fetch(`/api/admin/team-building/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPackages((prev) => prev.filter((p) => p.id !== id))
      } else {
        alert('Failed to delete package')
      }
    } catch {
      alert('Error deleting package')
    }
  }

  const toggleStatus = async (pkg: TeamPackage) => {
    const newStatus = pkg.status === 'published' ? 'draft' : 'published'
    try {
      const res = await fetch(`/api/admin/team-building/${pkg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pkg, status: newStatus }),
      })
      if (res.ok) {
        setPackages((prev) =>
          prev.map((p) => (p.id === pkg.id ? { ...p, status: newStatus } : p))
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
            Team Building &amp; Activities
          </h1>
          <p style={{ color: '#5a564f', fontSize: '15px', marginTop: '4px' }}>
            Manage corporate packages and indoor/outdoor group activity offerings.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          style={{ background: 'var(--ember)', color: '#FAF8F3', border: 'none', padding: '12px 24px', fontFamily: 'Inter', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer' }}
        >
          + Add New Package
        </button>
      </div>

      <div style={{ background: 'var(--warm-white)', border: '1px solid var(--sand-line)', padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--sand-line)' }}>
              <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Package / Activity Name</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Type</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Description</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Status</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id} style={{ borderBottom: '1px solid var(--sand-line)' }}>
                <td style={{ padding: '16px', fontWeight: 600, fontSize: '15px' }}>{pkg.name}</td>
                <td style={{ padding: '16px', textTransform: 'uppercase', fontSize: '12px', fontWeight: 700 }}>
                  <span style={{ padding: '3px 8px', background: pkg.type === 'outdoor' ? 'var(--teal)' : 'var(--sand)', color: pkg.type === 'outdoor' ? '#FFF' : 'var(--ink)' }}>
                    {pkg.type}
                  </span>
                </td>
                <td style={{ padding: '16px', color: '#5a564f', maxWidth: '400px' }}>{pkg.description}</td>
                <td style={{ padding: '16px' }}>
                  <button
                    onClick={() => toggleStatus(pkg)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      background: pkg.status === 'published' ? 'var(--teal)' : '#888',
                      color: '#FFF',
                    }}
                  >
                    {pkg.status}
                  </button>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openEditModal(pkg)}
                      style={{ background: 'none', border: '1px solid var(--ink)', padding: '4px 10px', fontSize: '12.5px', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
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
      {isModalOpen && editingPkg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: 'var(--warm-white)', border: '1px solid var(--sand-line)', width: '100%', maxWidth: '550px', padding: '32px' }}>
            <h2 style={{ fontFamily: 'Big Shoulders Display', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', marginBottom: '20px' }}>
              {editingPkg.id ? 'Edit Package' : 'Create Package'}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Package / Activity Name *</label>
                <input
                  type="text"
                  required
                  value={editingPkg.name || ''}
                  onChange={(e) => setEditingPkg({ ...editingPkg, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Type *</label>
                  <select
                    value={editingPkg.type || 'outdoor'}
                    onChange={(e) => setEditingPkg({ ...editingPkg, type: e.target.value as 'outdoor' | 'indoor' })}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                  >
                    <option value="outdoor">Outdoor</option>
                    <option value="indoor">Indoor</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Status</label>
                  <select
                    value={editingPkg.status || 'published'}
                    onChange={(e) => setEditingPkg({ ...editingPkg, status: e.target.value as 'draft' | 'published' })}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--sand-line)' }}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Description *</label>
                <textarea
                  rows={4}
                  required
                  value={editingPkg.description || ''}
                  onChange={(e) => setEditingPkg({ ...editingPkg, description: e.target.value })}
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
                  {loading ? 'Saving...' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

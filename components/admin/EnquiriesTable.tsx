'use client'

import { useState } from 'react'

interface Enquiry {
  id: string
  name: string
  email: string
  phone: string | null
  interest_type: string
  reference_id: string | null
  preferred_date: string | null
  group_size: string | null
  message: string | null
  status: 'new' | 'contacted' | 'closed'
  submitted_at: string
}

export default function EnquiriesTable({ initialEnquiries }: { initialEnquiries: Enquiry[] }) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initialEnquiries)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleStatusChange = async (id: string, newStatus: 'new' | 'contacted' | 'closed') => {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
        )
      } else {
        alert('Failed to update status')
      }
    } catch {
      alert('Error updating status')
    } finally {
      setLoadingId(null)
    }
  }

  const getInterestBadge = (type: string) => {
    switch (type) {
      case 'hike':
        return <span style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 700, background: 'var(--teal)', color: '#FFF' }}>Group Hike</span>
      case 'private_hike':
        return <span style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 700, background: 'var(--sand)', color: 'var(--ink)' }}>Private Hike</span>
      case 'expedition':
        return <span style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 700, background: 'var(--ember)', color: '#FFF' }}>Expedition</span>
      case 'team':
        return <span style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 700, background: '#3D3A36', color: '#FFF' }}>Team Building</span>
      default:
        return <span style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 700, background: '#8C6A5D', color: '#FFF' }}>Activity</span>
    }
  }

  return (
    <div style={{ background: 'var(--warm-white)', border: '1px solid var(--sand-line)', padding: '24px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--sand-line)' }}>
            <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Submitted</th>
            <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Customer</th>
            <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Interest</th>
            <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Details</th>
            <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Status</th>
            <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#5a564f' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {enquiries.map((e) => (
            <tr key={e.id} style={{ borderBottom: '1px solid var(--sand-line)' }}>
              <td style={{ padding: '16px', whiteSpace: 'nowrap', color: '#5a564f', fontSize: '13px' }}>
                {new Date(e.submitted_at).toLocaleDateString()} {new Date(e.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
              <td style={{ padding: '16px' }}>
                <div style={{ fontWeight: 600 }}>{e.name}</div>
                <div style={{ fontSize: '13px', color: '#5a564f' }}>{e.email}</div>
                {e.phone && <div style={{ fontSize: '12px', color: '#888' }}>{e.phone}</div>}
              </td>
              <td style={{ padding: '16px' }}>
                {getInterestBadge(e.interest_type)}
                {e.reference_id && <div style={{ fontSize: '12.5px', marginTop: '4px', fontWeight: 500 }}>{e.reference_id}</div>}
              </td>
              <td style={{ padding: '16px', maxWidth: '300px' }}>
                {e.preferred_date && <div style={{ fontSize: '12.5px' }}>📅 Date: {e.preferred_date}</div>}
                {e.group_size && <div style={{ fontSize: '12.5px' }}>👥 Group size: {e.group_size}</div>}
                {e.message && <p style={{ fontSize: '12.5px', marginTop: '4px', fontStyle: 'italic', color: '#3d3a36' }}>&quot;{e.message}&quot;</p>}
              </td>
              <td style={{ padding: '16px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    borderRadius: '2px',
                    textTransform: 'uppercase',
                    background: e.status === 'new' ? '#C1440E' : e.status === 'contacted' ? '#1F4B4C' : '#888',
                    color: '#FFF',
                  }}
                >
                  {e.status}
                </span>
              </td>
              <td style={{ padding: '16px' }}>
                <select
                  value={e.status}
                  disabled={loadingId === e.id}
                  onChange={(evt) => handleStatusChange(e.id, evt.target.value as 'new' | 'contacted' | 'closed')}
                  style={{
                    padding: '6px 10px',
                    fontSize: '13px',
                    background: '#FFF',
                    border: '1px solid var(--sand-line)',
                    fontFamily: 'Inter',
                    cursor: 'pointer',
                  }}
                >
                  <option value="new">Mark New</option>
                  <option value="contacted">Mark Contacted</option>
                  <option value="closed">Mark Closed</option>
                </select>
              </td>
            </tr>
          ))}

          {enquiries.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#5a564f' }}>
                No enquiries received yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

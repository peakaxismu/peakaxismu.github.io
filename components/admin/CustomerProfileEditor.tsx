'use client'

import { useState } from 'react'

type Customer = {
  id: string
  full_name: string
  email: string
  phone: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

const panel: React.CSSProperties = {
  background: 'var(--warm-white)',
  border: '1px solid var(--sand-line)',
  padding: 20,
}
const field: React.CSSProperties = {
  width: '100%',
  padding: '10px 11px',
  border: '1px solid var(--sand-line)',
  background: '#fff',
  color: 'var(--ink)',
  fontSize: 14,
}

export default function CustomerProfileEditor({ initialCustomer }: { initialCustomer: Customer }) {
  const [customer, setCustomer] = useState(initialCustomer)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState(initialCustomer.full_name)
  const [email, setEmail] = useState(initialCustomer.email)
  const [phone, setPhone] = useState(initialCustomer.phone ?? '')
  const [notes, setNotes] = useState(initialCustomer.notes ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/admin/customers/' + customer.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email, phone, notes }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to update customer')
      const updated = payload.data as Customer
      setCustomer(updated)
      setFullName(updated.full_name)
      setEmail(updated.email)
      setPhone(updated.phone ?? '')
      setNotes(updated.notes ?? '')
      setEditing(false)
      setNotice('Customer profile updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update customer')
    } finally {
      setBusy(false)
    }
  }

  function cancelEditing() {
    setFullName(customer.full_name)
    setEmail(customer.email)
    setPhone(customer.phone ?? '')
    setNotes(customer.notes ?? '')
    setEditing(false)
    setError('')
  }

  return (
    <section style={{ margin: '18px 0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p style={{ color: 'var(--ember)', fontSize: 10, fontWeight: 800, letterSpacing: '.12em' }}>CUSTOMER PROFILE</p>
          <h1 style={{ fontFamily: 'Big Shoulders Display', fontSize: 42, fontWeight: 900, textTransform: 'uppercase' }}>{customer.full_name}</h1>
          <p style={{ color: '#625d55', marginTop: 5 }}>{customer.email}{customer.phone ? ' · ' + customer.phone : ''}</p>
          {customer.notes && <p style={{ whiteSpace: 'pre-wrap', marginTop: 12, maxWidth: 800 }}>{customer.notes}</p>}
        </div>
        {!editing && <button type="button" onClick={() => { setEditing(true); setError(''); setNotice('') }} style={{ border: '1px solid var(--ink)', background: 'transparent', padding: '9px 13px', fontWeight: 800, cursor: 'pointer' }}>Edit customer</button>}
      </div>

      {notice && <p role="status" style={{ color: 'var(--teal)', fontWeight: 800, marginTop: 12 }}>{notice}</p>}
      {error && <p role="alert" style={{ color: 'var(--ember)', fontWeight: 800, marginTop: 12 }}>{error}</p>}

      {editing && <form onSubmit={save} style={{ ...panel, marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 800 }}>FULL NAME
          <input required maxLength={160} value={fullName} onChange={event => setFullName(event.target.value)} style={{ ...field, display: 'block', marginTop: 6 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 800 }}>EMAIL
          <input required type="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} style={{ ...field, display: 'block', marginTop: 6 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 800 }}>PHONE (OPTIONAL)
          <input maxLength={60} value={phone} onChange={event => setPhone(event.target.value)} style={{ ...field, display: 'block', marginTop: 6 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 800, gridColumn: '1 / -1' }}>INTERNAL NOTES
          <textarea maxLength={10000} rows={3} value={notes} onChange={event => setNotes(event.target.value)} style={{ ...field, display: 'block', marginTop: 6, resize: 'vertical' }} />
        </label>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="submit" disabled={busy} style={{ border: 0, background: 'var(--ink)', color: '#fff', padding: '10px 14px', fontWeight: 800, cursor: 'pointer' }}>{busy ? 'Saving…' : 'Save changes'}</button>
          <button type="button" disabled={busy} onClick={cancelEditing} style={{ border: '1px solid var(--ink)', background: 'transparent', padding: '10px 14px', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
        </div>
      </form>}
    </section>
  )
}

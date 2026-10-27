'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

type Customer = { id: string; full_name: string; email: string; phone: string | null; created_at: string }
const panel: React.CSSProperties = { background: 'var(--warm-white)', border: '1px solid var(--sand-line)', padding: 20 }
const field: React.CSSProperties = { width: '100%', padding: '11px 12px', border: '1px solid var(--sand-line)', background: '#fff', color: 'var(--ink)', fontSize: 14 }

export default function CustomerManager({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const filtered = useMemo(() => customers.filter(c => (c.full_name + ' ' + c.email + ' ' + (c.phone ?? '')).toLowerCase().includes(query.toLowerCase())), [customers, query])

  async function createCustomer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true); setError(''); setSuccess('')
    try {
      const response = await fetch('/api/admin/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ full_name: fullName, email, phone, notes }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to create customer')
      setCustomers(current => [payload.data, ...current].sort((a, b) => a.full_name.localeCompare(b.full_name)))
      setFullName(''); setEmail(''); setPhone(''); setNotes(''); setShowForm(false)
      setSuccess('Customer created.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to create customer') }
    finally { setBusy(false) }
  }

  return <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
      <div><p style={{ color: 'var(--ember)', fontSize: 11, fontWeight: 800, letterSpacing: '.12em' }}>CUSTOMER RELATIONSHIPS</p><h1 style={{ fontFamily: 'Big Shoulders Display', fontSize: 42, fontWeight: 900, textTransform: 'uppercase' }}>Customers</h1><p style={{ color: '#625d55', marginTop: 4 }}>{customers.length} saved customer records, with enquiries and bookings linked by customer.</p></div>
      <button type="button" onClick={() => { setShowForm(v => !v); setError('') }} style={{ background: 'var(--ember)', color: '#fff', border: 0, padding: '11px 16px', fontWeight: 800, cursor: 'pointer' }}>{showForm ? 'Cancel' : '+ Add customer'}</button>
    </div>
    {success && <p role="status" style={{ marginBottom: 12, color: 'var(--teal)', fontWeight: 700 }}>{success}</p>}
    {error && <p role="alert" style={{ marginBottom: 12, color: 'var(--ember)', fontWeight: 700 }}>{error}</p>}
    {showForm && <form onSubmit={createCustomer} style={{ ...panel, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginBottom: 18 }}>
      <label style={{ fontSize: 12, fontWeight: 700 }}>FULL NAME<input required maxLength={160} value={fullName} onChange={e => setFullName(e.target.value)} style={{ ...field, display: 'block', marginTop: 6 }} /></label>
      <label style={{ fontSize: 12, fontWeight: 700 }}>EMAIL<input required type="email" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} style={{ ...field, display: 'block', marginTop: 6 }} /></label>
      <label style={{ fontSize: 12, fontWeight: 700 }}>PHONE (OPTIONAL)<input maxLength={60} value={phone} onChange={e => setPhone(e.target.value)} style={{ ...field, display: 'block', marginTop: 6 }} /></label>
      <label style={{ fontSize: 12, fontWeight: 700, gridColumn: '1 / -1' }}>INTERNAL NOTES<textarea maxLength={10000} rows={3} value={notes} onChange={e => setNotes(e.target.value)} style={{ ...field, display: 'block', marginTop: 6, resize: 'vertical' }} /></label>
      <div style={{ gridColumn: '1 / -1' }}><button disabled={busy} style={{ padding: '11px 16px', background: 'var(--ink)', color: '#fff', border: 0, fontWeight: 800, cursor: 'pointer' }}>{busy ? 'Saving…' : 'Create customer'}</button></div>
    </form>}
    <div style={{ ...panel, marginBottom: 14 }}><label htmlFor="customer-search" style={{ display: 'block', fontSize: 11, fontWeight: 800, marginBottom: 7 }}>SEARCH CUSTOMERS</label><input id="customer-search" placeholder="Name, email or phone…" value={query} onChange={e => setQuery(e.target.value)} style={field} /></div>
    <div style={{ ...panel, padding: 0, overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left', minWidth: 580 }}>
        <thead><tr>{['Customer', 'Email', 'Phone', 'Added', ''].map(h => <th key={h} style={{ padding: 13, fontSize: 10, borderBottom: '2px solid var(--sand-line)', color: '#625d55', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
        <tbody>{filtered.map(c => <tr key={c.id} style={{ borderBottom: '1px solid var(--sand-line)' }}>
          <td style={{ padding: 13, fontWeight: 800 }}>{c.full_name}</td><td style={{ padding: 13, fontSize: 13 }}>{c.email}</td><td style={{ padding: 13, fontSize: 13 }}>{c.phone || '—'}</td><td style={{ padding: 13, fontSize: 12 }}>{new Date(c.created_at).toLocaleDateString()}</td><td style={{ padding: 13 }}><Link href={'/admin/customers/' + c.id} style={{ color: 'var(--ember)', fontWeight: 800, fontSize: 12 }}>Open →</Link></td>
        </tr>)}</tbody>
      </table>
      {filtered.length === 0 && <p style={{ padding: 24, color: '#625d55' }}>No customers match this search.</p>}
    </div>
  </div>
}

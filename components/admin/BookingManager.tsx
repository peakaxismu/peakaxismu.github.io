'use client'

import { useState } from 'react'

type Customer = { id: string; full_name: string; email: string }
type Enquiry = { id: string; name: string; email: string; customer_id: string | null; interest_type: string; reference_id: string | null; preferred_date: string | null; status: string }
type Departure = { id: string; hike_id: string; date: string; price: string; spots_remaining: number; hike_name: string }
type Expedition = { id: string; name: string; next_departure: string | null }
type Booking = {
  id: string; booking_reference: string; customer_id: string; enquiry_id: string | null
  activity_type: string; scheduled_hike_id: string | null; expedition_id: string | null
  booking_date: string; group_size: number; total_amount: number | null; currency: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'partially_paid' | 'paid' | 'refunded'
  internal_notes: string | null; created_at: string
}
const panel: React.CSSProperties = { background: 'var(--warm-white)', border: '1px solid var(--sand-line)', padding: 18 }
const field: React.CSSProperties = { width: '100%', padding: '10px 11px', border: '1px solid var(--sand-line)', background: '#fff', color: 'var(--ink)', fontSize: 13 }
const button: React.CSSProperties = { padding: '10px 14px', border: 0, background: 'var(--ember)', color: '#fff', fontWeight: 800, cursor: 'pointer' }

export default function BookingManager({ initialBookings, customers, departures, expeditions, enquiries }: { initialBookings: Booking[]; customers: Customer[]; departures: Departure[]; expeditions: Expedition[]; enquiries: Enquiry[] }) {
  const [bookings, setBookings] = useState(initialBookings)
  const [showForm, setShowForm] = useState(false)
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '')
  const [enquiryId, setEnquiryId] = useState('')
  const selectedEnquiry = enquiries.find(enquiry => enquiry.id === enquiryId)
  const selectedEnquiryCustomer = selectedEnquiry
    ? (selectedEnquiry.customer_id
      ? customers.find(customer => customer.id === selectedEnquiry.customer_id)
      : customers.find(customer => customer.email.trim().toLowerCase() === selectedEnquiry.email.trim().toLowerCase()))
    : undefined
  const customerMatchesEnquiry = !selectedEnquiry || Boolean(selectedEnquiryCustomer && selectedEnquiryCustomer.id === customerId)
  const [type, setType = useState('hike')
  const [departureId, setDepartureId] = useState(departures[0]?.id ?? '')
  const [expeditionId, setExpeditionId] = useState(expeditions[0]?.id ?? '')
  const [date, setDate] = useState('')
  const [size, setSize] = useState('1')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function createBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId, enquiry_id: enquiryId || null, activity_type: type,
          scheduled_hike_id: type === 'hike' ? departureId : null,
          expedition_id: type === 'expedition' ? expeditionId : null,
          booking_date: type === 'hike' ? (departures.find(d => d.id === departureId)?.date ?? date) : date,
          group_size: Number(size), total_amount: amount, internal_notes: notes,
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to create booking')
      setBookings(current => [payload.data, ...current].sort((a, b) => b.booking_date.localeCompare(a.booking_date)))
      setShowForm(false); setNotice('Booking created as pending. Confirm it after checking the customer arrangements.')
      setNotes(''); setAmount(''); setDate(''); setEnquiryId('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to create booking') }
    finally { setBusy(false) }
  }

  async function updateBooking(id: string, patch: Record<string, unknown>) {
    setError(''); setNotice('')
    try {
      const response = await fetch('/api/admin/bookings/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to update booking')
      setBookings(current => current.map(b => b.id === id ? { ...b, ...payload.data } : b))
      setNotice('Booking updated.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update booking') }
  }

  return <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
      <div><p style={{ color: 'var(--ember)', fontSize: 11, fontWeight: 800, letterSpacing: '.12em' }}>OPERATIONS</p><h1 style={{ fontFamily: 'Big Shoulders Display', fontSize: 42, fontWeight: 900, textTransform: 'uppercase' }}>Bookings</h1><p style={{ color: '#625d55', marginTop: 4 }}>Create a booking record, then confirm only after details are checked.</p></div>
      <button type="button" style={button} onClick={() => { setShowForm(v => !v); setError('') }}>{showForm ? 'Cancel' : '+ New booking'}</button>
    </div>
    {error && <p role="alert" style={{ color: 'var(--ember)', fontWeight: 800, marginBottom: 12 }}>{error}</p>}
    {notice && <p role="status" style={{ color: 'var(--teal)', fontWeight: 800, marginBottom: 12 }}>{notice}</p>}
    {showForm && <form onSubmit={createBooking} style={{ ...panel, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12, marginBottom: 18 }}>
      <label style={{ fontSize: 11, fontWeight: 800 }}>CUSTOMER<select required value={customerId} onChange={e => setCustomerId(e.target.value)} style={{ ...field, display: 'block', marginTop: 6 }}><option value="">Choose customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.full_name} · {c.email}</option>)}</select></label>
      <label style={{ fontSize: 11, fontWeight: 800 }}>LINK ENQUIRY (OPTIONAL)<select value={enquiryId} onChange={event => { const id = event.target.value; setEnquiryId(id); const enquiry = enquiries.find(item => item.id === id); if (enquiry) { const linkedCustomer = enquiry.customer_id ? customers.find(item => item.id === enquiry.customer_id) : customers.find(item => item.email.trim().toLowerCase() === enquiry.email.trim().toLowerCase()); if (linkedCustomer) setCustomerId(linkedCustomer.id); if (['hike','private_hike','expedition','team','activity'].includes(enquiry.interest_type)) setType(enquiry.interest_type) } }} style={{ ...field, display: 'block', marginTop: 6 }}><option value="">No linked enquiry</option>{enquiries.map(enquiry => <option key={enquiry.id} value={enquiry.id}>{enquiry.name} · {enquiry.interest_type.replaceAll('_', ' ')} · {enquiry.status}</option>)}</select></label>
      <label style={{ fontSize: 11, fontWeight: 800 }}>ACTIVITY TYPE<select value={type} onChange={e => setType(e.target.value)} style={{ ...field, display: 'block', marginTop: 6 }}>{[['hike','Scheduled hike'],['private_hike','Private hike'],['expedition','Expedition'],['team','Team building'],['activity','Other activity']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      {selectedEnquiry && !customerMatchesEnquiry && <p role="alert" style={{ gridColumn: '1 / -1', color: 'var(--ember)', fontSize: 12, fontWeight: 700 }}>The selected enquiry must be linked to its matching customer record before this booking can be saved.</p>}
      {type === 'hike' && <label style={{ fontSize: 11, fontWeight: 800, gridColumn: 'span 2' }}>DEPARTURE<select required value={departureId} onChange={e => setDepartureId(e.target.value)} style={{ ...field, display: 'block', marginTop: 6 }}><option value="">Choose a published departure</option>{departures.map(d => <option key={d.id} value={d.id}>{d.hike_name} · {d.date} · {d.spots_remaining} spaces left · {d.price}</option>)}</select></label>}
      {type === 'expedition' && <label style={{ fontSize: 11, fontWeight: 800 }}>EXPEDITION<select required value={expeditionId} onChange={e => setExpeditionId(e.target.value)} style={{ ...field, display: 'block', marginTop: 6 }}><option value="">Choose expedition</option>{expeditions.map(x => <option key={x.id} value={x.id}>{x.name}{x.next_departure ? ' · ' + x.next_departure : ''}</option>)}</select></label>}
      <label style={{ fontSize: 11, fontWeight: 800 }}>BOOKING DATE<input required type="date" value={type === 'hike' ? (departures.find(d => d.id === departureId)?.date ?? date) : date} onChange={e => setDate(e.target.value)} disabled={type === 'hike'} style={{ ...field, display: 'block', marginTop: 6 }} /></label>
      <label style={{ fontSize: 11, fontWeight: 800 }}>GROUP SIZE<input required type="number" min="1" max="1000" value={size} onChange={e => setSize(e.target.value)} style={{ ...field, display: 'block', marginTop: 6 }} /></label>
      <label style={{ fontSize: 11, fontWeight: 800 }}>TOTAL (MUR)<input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Leave blank if not agreed" style={{ ...field, display: 'block', marginTop: 6 }} /></label>
      <label style={{ fontSize: 11, fontWeight: 800, gridColumn: '1 / -1' }}>INTERNAL NOTES<textarea rows={2} maxLength={10000} value={notes} onChange={e => setNotes(e.target.value)} style={{ ...field, display: 'block', marginTop: 6 }} /></label>
      <div style={{ gridColumn: '1 / -1' }}><button disabled={busy || !customers.length || !customerMatchesEnquiry || (type === 'hike' && !departures.length) || (type === 'expedition' && !expeditions.length)} style={{ ...button, background: 'var(--ink)' }}>{busy ? 'Saving…' : 'Create pending booking'}</button>{!customers.length && <p style={{ marginTop: 8, color: 'var(--ember)', fontSize: 12 }}>Add a customer first.</p>}{type === 'hike' && !departures.length && <p style={{ marginTop: 8, color: 'var(--ember)', fontSize: 12 }}>There are no future published departures with available spaces.</p>}</div>
    </form>}
    <div style={{ ...panel, padding: 0, overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead><tr>{['Reference / Customer', 'Activity', 'Date', 'Guests', 'Total', 'Booking status', 'Payment'].map(x => <th key={x} style={{ padding: 12, fontSize: 10, textTransform: 'uppercase', borderBottom: '2px solid var(--sand-line)', color: '#625d55' }}>{x}</th>)}</tr></thead>
        <tbody>{bookings.map(b => {
          const c = customers.find(x => x.id === b.customer_id)
          return <tr key={b.id} style={{ borderBottom: '1px solid var(--sand-line)' }}>
            <td style={{ padding: 12 }}><strong>{b.booking_reference}</strong><div style={{ fontSize: 12, color: '#625d55', marginTop: 4 }}>{c?.full_name ?? 'Customer'}</div></td>
            <td style={{ padding: 12, fontSize: 12 }}>{b.activity_type.replaceAll('_', ' ')}</td><td style={{ padding: 12, fontSize: 12 }}>{b.booking_date}</td><td style={{ padding: 12 }}>{b.group_size}</td><td style={{ padding: 12, fontSize: 12 }}>{b.total_amount == null ? '—' : b.currency + ' ' + Number(b.total_amount).toLocaleString()}</td>
            <td style={{ padding: 10 }}><select aria-label={'Booking status ' + b.booking_reference} value={b.status} onChange={e => updateBooking(b.id, { status: e.target.value })} style={{ ...field, minWidth: 130 }}>{['pending','confirmed','completed','cancelled'].map(x => <option key={x} value={x}>{x.replaceAll('_', ' ')}</option>)}</select></td>
            <td style={{ padding: 10 }}><select aria-label={'Payment status ' + b.booking_reference} value={b.payment_status} onChange={e => updateBooking(b.id, { payment_status: e.target.value })} style={{ ...field, minWidth: 130 }}>{['pending','partially_paid','paid','refunded'].map(x => <option key={x} value={x}>{x.replaceAll('_', ' ')}</option>)}</select></td>
          </tr>
        })}</tbody>
      </table>
      {!bookings.length && <p style={{ padding: 24, color: '#625d55' }}>No booking records yet.</p>}
    </div>
  </div>
}

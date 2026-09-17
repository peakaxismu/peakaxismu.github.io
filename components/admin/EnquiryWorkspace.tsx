'use client'

import { useMemo, useState } from 'react'

type Status = 'new' | 'contacted' | 'quoted' | 'awaiting_reply' | 'confirmed' | 'completed' | 'closed'
type Activity = { id: string; type: string; body: string | null; created_at: string }
type Enquiry = {
  id: string
  name: string
  email: string
  phone: string | null
  interest_type: string
  reference_id: string | null
  preferred_date: string | null
  group_size: string | null
  message: string | null
  status: Status
  submitted_at: string
  priority?: string
  next_action?: string | null
  next_follow_up_at?: string | null
  quote_amount?: number | null
  lost_reason?: string | null
}

const STAGES = [
  ['new', 'New'],
  ['contacted', 'Contacted'],
  ['quoted', 'Quote Sent'],
  ['awaiting_reply', 'Awaiting Reply'],
  ['confirmed', 'Confirmed'],
  ['completed', 'Completed'],
  ['closed', 'Closed'],
] as const

const REPLY_TYPES = ['Initial', 'Clarification', 'Quote', 'Follow-up', 'Confirmation', 'Thank-you', 'Cancellation / closure']
const card = { background: 'var(--warm-white)', border: '1px solid var(--sand-line)', padding: 18 }
const button = { padding: '9px 13px', border: '1px solid var(--ink)', background: 'transparent', fontWeight: 700, cursor: 'pointer', fontSize: 13 } as const

function replyFor(e: Enquiry, type: string) {
  const request = [
    e.reference_id,
    e.preferred_date ? `preferred date: ${e.preferred_date}` : '',
    e.group_size ? `group size: ${e.group_size}` : '',
  ].filter(Boolean).join(', ')
  const greeting = `Hi ${e.name},`
  let body = ''

  if (type === 'Clarification') body = `Thank you for your enquiry regarding ${request || 'your request'}. Before we proceed, could you please confirm any additional details you would like us to consider?`
  else if (type === 'Quote') body = `Thank you for your interest in Peak Axis. We have prepared the quotation for ${request || 'your request'}. Please review the details and let us know if you would like to proceed or if you would like anything adjusted.`
  else if (type === 'Follow-up') body = `I’m following up on your enquiry${request ? ` regarding ${request}` : ''}. Please let us know if you are still interested, and we will be happy to help with the next steps.`
  else if (type === 'Confirmation') body = 'Thank you for confirming your plans with Peak Axis. We have noted your confirmation and will share the remaining arrangements and next steps with you.'
  else if (type === 'Thank-you') body = 'Thank you for choosing Peak Axis. We hope you had a great experience and would be delighted to welcome you again in the future.'
  else if (type === 'Cancellation / closure') body = 'We’re closing this enquiry for now. If your plans change, please feel free to contact us again and we’ll be happy to help.'
  else body = `Thank you for getting in touch with Peak Axis regarding ${request || 'your enquiry'}. We have received your request and will review the details before getting back to you with the next steps.`

  return `${greeting}\n\n${body}\n\nKind regards,\nPeak Axis`
}

function suggestedReplyType(status: Status) {
  if (status === 'new') return 'Initial'
  if (status === 'contacted') return 'Follow-up'
  if (status === 'quoted') return 'Follow-up'
  if (status === 'awaiting_reply') return 'Follow-up'
  if (status === 'confirmed') return 'Confirmation'
  if (status === 'completed') return 'Thank-you'
  return 'Cancellation / closure'
}

function missingInformation(e: Enquiry) {
  const missing: string[] = []
  if (!e.email?.trim()) missing.push('Email')
  if (!e.preferred_date) missing.push('Preferred date')
  if (!e.group_size) missing.push('Group size')
  if (!e.reference_id) missing.push('Activity / request')
  return missing
}

export default function EnquiryWorkspace({ initialEnquiries }: { initialEnquiries: Enquiry[] }) {
  const [enquiries, setEnquiries] = useState(initialEnquiries)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | Status>('all')
  const [interest, setInterest] = useState('all')
  const [selected, setSelected] = useState<Enquiry | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [replyType, setReplyType] = useState('Initial')
  const [reply, setReply] = useState('')
  const [subject, setSubject] = useState('')
  const [note, setNote] = useState('')
  const [followUp, setFollowUp] = useState('')

  const interests = Array.from(new Set(enquiries.map(e => e.interest_type).filter(Boolean)))
  const today = new Date().toISOString().slice(0, 10)

  const filtered = useMemo(() => enquiries.filter(e => {
    const hay = `${e.name} ${e.email} ${e.phone || ''} ${e.reference_id || ''} ${e.message || ''}`.toLowerCase()
    return (!query || hay.includes(query.toLowerCase())) && (status === 'all' || e.status === status) && (interest === 'all' || e.interest_type === interest)
  }), [enquiries, query, status, interest])

  const counts = {
    new: enquiries.filter(e => e.status === 'new').length,
    needs: enquiries.filter(e => e.next_action === 'reply' || ((e.status === 'new' || e.status === 'contacted') && !e.next_action)).length,
    awaiting: enquiries.filter(e => e.status === 'awaiting_reply').length,
    quoted: enquiries.filter(e => e.status === 'quoted').length,
    confirmed: enquiries.filter(e => e.status === 'confirmed').length,
    completed: enquiries.filter(e => e.status === 'completed').length,
    overdue: enquiries.filter(e => e.next_follow_up_at && e.next_follow_up_at.slice(0, 10) < today && !['completed', 'closed'].includes(e.status)).length,
    dueToday: enquiries.filter(e => e.next_follow_up_at?.slice(0, 10) === today && !['completed', 'closed'].includes(e.status)).length,
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      alert('Copy failed. Please select and copy manually.')
    }
  }

  const logActivity = async (id: string, type: string, body: string) => {
    try {
      await fetch(`/api/admin/enquiries/${id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, body }),
      })
      await loadActivities(id)
    } catch {
      // Copying still succeeds if activity logging is unavailable.
    }
  }

  const loadActivities = async (id: string) => {
    try {
      const r = await fetch(`/api/admin/enquiries/${id}/activities`)
      const j = await r.json()
      if (r.ok) setActivities(j.data || [])
    } catch {
      // Keep the workspace usable if the timeline cannot be loaded.
    }
  }

  const open = async (e: Enquiry) => {
    const type = suggestedReplyType(e.status)
    setSelected(e)
    setReplyType(type)
    setReply(replyFor(e, type))
    setSubject(`Re: ${e.reference_id || e.interest_type.replaceAll('_', ' ')} enquiry`)
    setFollowUp(e.next_follow_up_at ? e.next_follow_up_at.slice(0, 10) : '')
    setNote('')
    setActivities([])
    await loadActivities(e.id)
  }

  const update = async (patch: Record<string, unknown>) => {
    if (!selected) return
    setLoading(true)
    try {
      const r = await fetch(`/api/admin/enquiries/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const j = await r.json()
      if (!r.ok) throw Error(j.error || 'Update failed')
      const u = { ...selected, ...(j.data || {}) } as Enquiry
      setSelected(u)
      setEnquiries(xs => xs.map(x => x.id === u.id ? u : x))
      await loadActivities(u.id)
      if (patch.note) setNote('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const chooseStage = (value: Status) => {
    if (!selected) return
    update({ status: value })
    const type = suggestedReplyType(value)
    setReplyType(type)
    setReply(replyFor(selected, type))
  }

  const copyReply = async () => {
    if (!selected) return
    await copy(reply)
    await logActivity(selected.id, 'reply_copied', `${replyType} reply copied for ${selected.email}`)
  }

  const copySubjectAndReply = async () => {
    if (!selected) return
    await copy(`${subject}\n\n${reply}`)
    await logActivity(selected.id, 'reply_copied', `${replyType} subject + reply copied for ${selected.email}`)
  }

  const setStageFilter = (value: 'all' | Status) => {
    setStatus(value)
    setQuery('')
    setInterest('all')
  }

  const badge = (v: string) => (
    <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', background: v === 'new' ? 'var(--ember)' : v === 'confirmed' ? 'var(--teal)' : v === 'awaiting_reply' ? 'var(--sand)' : '#5a564f', color: v === 'awaiting_reply' ? 'var(--ink)' : '#fff' }}>
      {v.replaceAll('_', ' ')}
    </span>
  )

  const summaryCards: Array<[string, number, 'all' | Status, string]> = [
    ['New', counts.new, 'new', 'New enquiries to read'],
    ['Needs Reply', counts.needs, 'new', 'New enquiries needing a response'],
    ['Awaiting Reply', counts.awaiting, 'awaiting_reply', 'Waiting on the customer'],
    ['Quote Sent', counts.quoted, 'quoted', 'Quotes already sent'],
    ['Confirmed', counts.confirmed, 'confirmed', 'Confirmed bookings'],
    ['Completed', counts.completed, 'completed', 'Completed bookings'],
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.12em', color: 'var(--ember)' }}>ENQUIRY WORKFLOW</div>
          <h2 style={{ fontFamily: 'Big Shoulders Display', fontWeight: 900, fontSize: 44, textTransform: 'uppercase', margin: '5px 0' }}>Enquiries</h2>
          <p style={{ color: '#5a564f', margin: 0 }}>Read, reply, copy into Gmail, and move each request to its next stage.</p>
        </div>
        <button style={button} onClick={() => { setQuery(''); setStatus('all'); setInterest('all') }}>Reset filters</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,minmax(110px,1fr))', gap: 10, marginBottom: 16 }}>
        {summaryCards.map(([label, count, filter, help]) => (
          <button key={label} title={help} onClick={() => setStageFilter(filter)} style={{ ...card, padding: '14px 16px', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#625d55' }}>{label}</div>
            <div style={{ fontSize: 27, fontWeight: 800, marginTop: 4 }}>{count}</div>
          </button>
        ))}
      </div>

      {(counts.overdue > 0 || counts.dueToday > 0) && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          {counts.overdue > 0 && <button style={{ ...button, background: 'var(--ember)', color: '#fff' }} onClick={() => setQuery('')}>Follow-ups overdue: {counts.overdue}</button>}
          {counts.dueToday > 0 && <button style={{ ...button, background: 'var(--ink)', color: '#fff' }} onClick={() => setQuery('')}>Follow-ups due today: {counts.dueToday}</button>}
        </div>
      )}

      <div style={{ ...card, marginBottom: 16, display: 'grid', gridTemplateColumns: 'minmax(220px,1fr) 190px 180px', gap: 10 }}>
        <input placeholder="Search name, email, phone, activity…" value={query} onChange={e => setQuery(e.target.value)} />
        <select value={status} onChange={e => setStatus(e.target.value as typeof status)}><option value="all">All stages</option>{STAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <select value={interest} onChange={e => setInterest(e.target.value)}><option value="all">All requests</option>{interests.map(i => <option key={i} value={i}>{i.replaceAll('_', ' ')}</option>)}</select>
      </div>

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--sand-line)', fontSize: 12, color: '#625d55' }}>{filtered.length} matching {filtered.length === 1 ? 'enquiry' : 'enquiries'}</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900, textAlign: 'left', fontSize: 14 }}>
            <thead><tr>{['Date', 'Customer', 'Request', 'Date', 'Group', 'Stage', 'Action'].map(h => <th key={h} style={{ padding: 12, fontSize: 10, textTransform: 'uppercase', color: '#5a564f', borderBottom: '2px solid var(--sand-line)' }}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(e => {
                const missing = missingInformation(e)
                return (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--sand-line)', verticalAlign: 'top' }}>
                    <td style={{ padding: 12, fontSize: 12 }}>{new Date(e.submitted_at).toLocaleDateString()}</td>
                    <td style={{ padding: 12 }}><strong>{e.name}</strong><div style={{ fontSize: 12, color: '#625d55' }}>{e.email}</div></td>
                    <td style={{ padding: 12 }}>{badge(e.interest_type)}{e.reference_id && <div style={{ fontSize: 12, marginTop: 5 }}>{e.reference_id}</div>}{missing.length > 0 && <div style={{ fontSize: 10, marginTop: 6, color: 'var(--ember)', fontWeight: 800 }}>MISSING: {missing.join(', ')}</div>}</td>
                    <td style={{ padding: 12, fontSize: 12 }}>{e.preferred_date || '—'}</td>
                    <td style={{ padding: 12, fontSize: 12 }}>{e.group_size || '—'}</td>
                    <td style={{ padding: 12 }}>{badge(e.status)}{e.next_follow_up_at && <div style={{ fontSize: 10, color: '#625d55', marginTop: 6 }}>Follow-up {e.next_follow_up_at.slice(0, 10)}</div>}</td>
                    <td style={{ padding: 12 }}><button style={button} onClick={() => open(e)}>Open</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div role="dialog" aria-modal="true" onClick={e => { if (e.target === e.currentTarget) setSelected(null) }} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.5)', display: 'flex', justifyContent: 'flex-end' }}>
          <aside style={{ width: 'min(760px,100%)', height: '100%', background: 'var(--warm-white)', padding: 26, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.12em', color: 'var(--ember)' }}>ENQUIRY WORKSPACE</div>
                <h3 style={{ fontFamily: 'Big Shoulders Display', fontSize: 34, textTransform: 'uppercase', margin: '4px 0' }}>{selected.name}</h3>
                <div style={{ fontSize: 13, color: '#625d55' }}>{selected.reference_id || selected.interest_type} · {selected.group_size || 'Group size not specified'} · {selected.preferred_date || 'Date not specified'}</div>
              </div>
              <button style={{ ...button, fontSize: 18 }} onClick={() => setSelected(null)}>×</button>
            </div>

            <div style={{ marginTop: 18, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {STAGES.map(([v, l]) => <button key={v} disabled={loading} onClick={() => chooseStage(v)} style={{ ...button, padding: '7px 9px', background: selected.status === v ? 'var(--ink)' : 'transparent', color: selected.status === v ? '#fff' : 'var(--ink)' }}>{l}</button>)}
            </div>

            {missingInformation(selected).length > 0 && (
              <div style={{ marginTop: 14, padding: 14, border: '1px solid var(--ember)', background: '#fff8f1' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--ember)', textTransform: 'uppercase' }}>Missing information</div>
                <div style={{ fontSize: 13, marginTop: 5 }}>{missingInformation(selected).join(' · ')}</div>
                <button style={{ ...button, marginTop: 9 }} onClick={() => { setReplyType('Clarification'); setReply(replyFor(selected, 'Clarification')) }}>Generate clarification reply</button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
              <div style={{ ...card, padding: 16 }}><b>CONTACT</b><div style={{ marginTop: 7 }}>{selected.email || 'No email supplied'}</div>{selected.phone && <div style={{ fontSize: 13 }}>{selected.phone}</div>}<button style={{ ...button, marginTop: 10 }} onClick={() => copy(selected.email)}>Copy email</button></div>
              <div style={{ ...card, padding: 16 }}><b>REQUEST</b><div style={{ marginTop: 7 }}>{badge(selected.interest_type)}</div><div style={{ fontSize: 13, marginTop: 6 }}><b>Date:</b> {selected.preferred_date || 'Not specified'}</div><div style={{ fontSize: 13 }}><b>Group:</b> {selected.group_size || 'Not specified'}</div></div>
            </div>

            <div style={{ ...card, marginTop: 12 }}><b>ORIGINAL MESSAGE</b><div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55, marginTop: 8 }}>{selected.message || 'No message supplied.'}</div></div>

            <div style={{ marginTop: 14, padding: 18, border: '2px solid var(--ink)', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div><b style={{ fontSize: 10, color: 'var(--ember)' }}>WHAT NEXT?</b><h4 style={{ fontFamily: 'Big Shoulders Display', fontSize: 27, textTransform: 'uppercase', margin: '2px 0' }}>Prepare and copy reply</h4></div>
                <button style={{ ...button, background: 'var(--ink)', color: '#fff' }} onClick={copyReply}>Copy reply</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginTop: 10 }}>
                <div><label>Reply type</label><select value={replyType} onChange={e => { setReplyType(e.target.value); setReply(replyFor(selected, e.target.value)) }} style={{ width: '100%' }}>{REPLY_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label>To</label><div style={{ display: 'flex', gap: 6 }}><input value={selected.email} readOnly style={{ width: '100%' }} /><button style={button} onClick={() => copy(selected.email)}>Copy</button></div></div>
              </div>
              <div style={{ marginTop: 10 }}><label>Subject</label><div style={{ display: 'flex', gap: 6 }}><input value={subject} onChange={e => setSubject(e.target.value)} style={{ width: '100%' }} /><button style={button} onClick={() => copy(subject)}>Copy</button></div></div>
              <label style={{ display: 'block', marginTop: 10 }}>Reply — edit before sending</label>
              <textarea value={reply} onChange={e => setReply(e.target.value)} rows={11} style={{ width: '100%', marginTop: 4, padding: 11, font: 'inherit', lineHeight: 1.5, resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}><button style={button} onClick={copyReply}>Copy reply</button><button style={button} onClick={copySubjectAndReply}>Copy subject + reply</button></div>
              <div style={{ fontSize: 11, color: '#777', marginTop: 8 }}>Copy into Gmail, send manually, then move the enquiry to its next stage.</div>
            </div>

            {selected.status === 'quoted' && (
              <div style={{ ...card, marginTop: 12 }}><b>QUOTE</b><div style={{ display: 'flex', gap: 8, marginTop: 7 }}><input type="number" min="0" step="0.01" placeholder="Quote amount" value={selected.quote_amount ?? ''} onChange={e => setSelected({ ...selected, quote_amount: e.target.value === '' ? null : Number(e.target.value) })} style={{ flex: 1 }} /><button style={button} onClick={() => update({ quote_amount: selected.quote_amount ?? null })}>Save quote</button></div></div>
            )}

            <div style={{ ...card, marginTop: 12 }}><b>FOLLOW-UP DATE</b><div style={{ display: 'flex', gap: 8, marginTop: 7 }}><input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)} style={{ flex: 1 }} /><button style={button} onClick={() => update({ next_follow_up_at: followUp ? `${followUp}T09:00:00` : null, next_action: followUp ? 'follow_up' : null })}>Save</button></div></div>

            <div style={{ ...card, marginTop: 12 }}><b>INTERNAL NOTE</b><textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Private note…" style={{ width: '100%', marginTop: 7, padding: 10, font: 'inherit' }} /><button style={{ ...button, marginTop: 7 }} disabled={!note.trim() || loading} onClick={() => update({ note })}>Save note</button></div>

            <div style={{ marginTop: 14 }}>
              <b style={{ fontSize: 10, color: '#625d55' }}>ACTIVITY TIMELINE</b>
              {activities.length === 0 ? <div style={{ fontSize: 13, color: '#625d55', marginTop: 8 }}>No activity recorded yet.</div> : activities.map(a => <div key={a.id} style={{ borderLeft: '2px solid var(--sand-line)', padding: '0 0 12px 12px', marginTop: 9 }}><b style={{ fontSize: 10, textTransform: 'uppercase' }}>{a.type.replaceAll('_', ' ')}</b><div style={{ fontSize: 13, marginTop: 3, whiteSpace: 'pre-wrap' }}>{a.body}</div><div style={{ fontSize: 11, color: '#777' }}>{new Date(a.created_at).toLocaleString()}</div></div>)}
            </div>

            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button style={{ ...button, background: 'var(--teal)', color: '#fff' }} disabled={loading} onClick={() => update({ status: 'contacted', next_action: 'await_customer' })}>Mark Contacted</button>
              <button style={button} disabled={loading} onClick={() => update({ status: 'awaiting_reply', next_action: 'follow_up' })}>Waiting on Customer</button>
              <button style={button} disabled={loading} onClick={() => update({ status: 'quoted', next_action: 'await_customer' })}>Mark Quote Sent</button>
            </div>
          </aside>
        </div>
      )}

      <style>{`input,select{padding:9px 10px;border:1px solid var(--sand-line);background:#fff;font:inherit}label{font-size:10px;font-weight:800;text-transform:uppercase;color:#625d55}button:disabled{opacity:.55;cursor:not-allowed}`}</style>
    </div>
  )
}

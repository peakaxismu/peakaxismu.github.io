'use client'

import { useState } from 'react'

type Suggestion = {
  id: string; entity_type: string; entity_id: string; suggestion_type: string
  title: string; rationale: string | null; evidence: unknown; proposed_action: unknown
  status: string; created_at: string
}

export default function AISuggestionReview({ initialSuggestions }: { initialSuggestions: Suggestion[] }) {
  const [suggestions, setSuggestions] = useState(initialSuggestions)
  const [busyId, setBusyId] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function generateSuggestions() {
    setGenerating(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/admin/ai-suggestions', { method: 'POST' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to generate AI suggestions')
      const created = Array.isArray(payload.data) ? payload.data as Suggestion[] : []
      setSuggestions(current => [...created, ...current.filter(existing => !created.some(item => item.id === existing.id))])
      setNotice(payload.message || `Generated ${created.length} suggestion(s) for review.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate AI suggestions')
    } finally {
      setGenerating(false)
    }
  }

  async function review(suggestion: Suggestion, status: 'approved' | 'rejected') {
    setBusyId(suggestion.id); setError(''); setNotice('')
    try {
      const response = await fetch('/api/admin/ai-suggestions/' + suggestion.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to record decision')
      setSuggestions(current => current.map(s => s.id === suggestion.id ? { ...s, status: payload.data.status } : s))
      setNotice(status === 'approved' ? 'Suggestion approved for a later/manual action.' : 'Suggestion rejected.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to record decision') }
    finally { setBusyId('') }
  }

  const pending = suggestions.filter(s => s.status === 'pending')
  const reviewed = suggestions.filter(s => s.status !== 'pending')
  const panel: React.CSSProperties = { background: 'var(--warm-white)', border: '1px solid var(--sand-line)', padding: 18 }
  const button: React.CSSProperties = { padding: '10px 14px', border: 0, background: 'var(--ink)', color: '#fff', fontWeight: 800, cursor: 'pointer' }

  function suggestionCard(s: Suggestion) {
    return <article key={s.id} style={{ ...panel, marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><strong style={{ fontSize: 17 }}>{s.title}</strong><span style={{ background: s.status === 'pending' ? 'var(--sand)' : '#e8e5dc', padding: '4px 8px', fontSize: 10, textTransform: 'uppercase', fontWeight: 800 }}>{s.status.replaceAll('_', ' ')}</span></div>
      <p style={{ color: '#625d55', fontSize: 12, marginTop: 7 }}>{s.suggestion_type.replaceAll('_', ' ')} · {s.entity_type} · {new Date(s.created_at).toLocaleString()}</p>
      <p style={{ fontSize: 12, color: '#625d55', overflowWrap: 'anywhere' }}>Record ID: {s.entity_id}</p>
      {s.rationale && <p style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>{s.rationale}</p>}
      <details style={{ marginTop: 10 }}><summary style={{ fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Evidence</summary><pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: 12, background: '#f1eee7', padding: 12, marginTop: 8 }}>{JSON.stringify(s.evidence, null, 2)}</pre></details>
      <details style={{ marginTop: 8 }}><summary style={{ fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Proposed action (not executed)</summary><pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: 12, background: '#f1eee7', padding: 12, marginTop: 8 }}>{JSON.stringify(s.proposed_action, null, 2)}</pre></details>
      {s.status === 'pending' && <div style={{ display: 'flex', gap: 8, marginTop: 14 }}><button type="button" disabled={busyId === s.id} onClick={() => review(s, 'approved')} style={{ ...button, padding: '9px 12px' }}>{busyId === s.id ? 'Saving…' : 'Approve suggestion'}</button><button type="button" disabled={busyId === s.id} onClick={() => review(s, 'rejected')} style={{ padding: '9px 12px', border: '1px solid var(--ink)', background: 'transparent', fontWeight: 800, cursor: 'pointer' }}>Reject</button></div>}
    </article>
  }

  return <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
      <div><p style={{ color: 'var(--ember)', fontSize: 11, fontWeight: 800, letterSpacing: '.12em' }}>AI COPILOT</p><h1 style={{ fontFamily: 'Big Shoulders Display', fontSize: 42, fontWeight: 900, textTransform: 'uppercase' }}>AI suggestion review</h1></div>
      <button type="button" disabled={generating} onClick={generateSuggestions} style={{ ...button, opacity: generating ? 0.6 : 1 }}>{generating ? 'Generating suggestions…' : 'Generate AI suggestions'}</button>
    </div>
    <p style={{ color: '#625d55', maxWidth: 820, marginTop: 5, marginBottom: 10 }}>Generate follow-ups for open enquiries and bookings on demand. Suggestions must be reviewed; approval only records the decision, and no customer message is sent or booking changed automatically.</p>
    <p style={{ color: '#625d55', fontSize: 12, maxWidth: 820, marginBottom: 16 }}>When generation runs, the customer’s name and enquiry message may be sent to the configured model through Vercel AI Gateway. Contact details and internal notes are excluded. Avoid running AI analysis on records that should not be processed by an external model.</p>
    {error && <p role="alert" style={{ color: 'var(--ember)', fontWeight: 800, marginBottom: 10 }}>{error}</p>}{notice && <p role="status" style={{ color: 'var(--teal)', fontWeight: 800, marginBottom: 10 }}>{notice}</p>}
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}><div style={{ ...panel, flex: '1 1 150px' }}><p style={{ color: '#625d55', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>Pending review</p><strong style={{ fontSize: 28 }}>{pending.length}</strong></div><div style={{ ...panel, flex: '1 1 150px' }}><p style={{ color: '#625d55', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>Reviewed</p><strong style={{ fontSize: 28 }}>{reviewed.length}</strong></div></div>
    <section><h2 style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase' }}>Pending suggestions</h2>{pending.map(suggestionCard)}{!pending.length && <div style={{ ...panel, marginTop: 10, color: '#625d55' }}>No AI suggestions are waiting for review. Generate a batch to analyze open enquiries and bookings, or check the AI Gateway configuration if generation is unavailable.</div>}</section>
    {reviewed.length > 0 && <section style={{ marginTop: 24 }}><h2 style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase' }}>Previously reviewed</h2>{reviewed.map(suggestionCard)}</section>}
  </div>
}

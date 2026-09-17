'use client'

import { useState } from 'react'

type Hike = {
  id: string
  name: string
  date: string | null
  status: 'draft' | 'published' | 'retired'
  spots_total: number | null
  spots_remaining: number | null
  trail_condition_status: 'open' | 'conditions_to_confirm' | 'temporarily_unsuitable' | 'closed' | null
  trail_condition_note: string | null
  difficulty: string
  location: string
  price: string
  source_hike_id: string | null
}

export default function ScheduledHikesAdminClient({ initialHikes }: { initialHikes: Hike[] }) {
  const [hikes, setHikes] = useState(initialHikes)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  async function save(hike: Hike, patch: Record<string, unknown>) {
    setSaving(hike.id)
    setMessage('')
    try {
      const response = await fetch(`/api/admin/hikes/${hike.id}/schedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to save departure')
      setHikes((current) => current.map((item) => item.id === hike.id ? result.data : item))
      setMessage('Departure updated.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save departure')
    } finally {
      setSaving(null)
    }
  }

  function formatMurPrice(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return ''
    const numeric = trimmed.replace(/^(mur|rs|rs\.)\s*/i, '').replace(/,/g, '').trim()
    if (/^\d+(?:\.\d{1,2})?$/.test(numeric)) {
      const amount = Number(numeric)
      return `MUR ${amount.toLocaleString('en-MU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    }
    return /^mur\s/i.test(trimmed) ? trimmed : `MUR ${trimmed}`
  }

  if (!hikes.length) {
    return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">No scheduled departures yet. Create one from the schedule flow.</div>
  }

  return (
    <div className="space-y-4">
      {message && <p className="text-sm text-emerald-300">{message}</p>}
      {hikes.map((hike) => (
        <article key={hike.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Scheduled group</p>
              <h2 className="mt-1 text-lg font-semibold text-white">{hike.name}</h2>
              <p className="mt-1 text-sm text-white/55">{hike.location} · {hike.difficulty} · {hike.price}</p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/70">{hike.status}</span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="space-y-1 text-sm text-white/65">Date<input type="date" defaultValue={hike.date || ''} onBlur={(event) => event.currentTarget.value !== (hike.date || '') && save(hike, { date: event.currentTarget.value })} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white" /></label>
            <label className="space-y-1 text-sm text-white/65">Price (MUR)<input type="text" defaultValue={hike.price || ''} onBlur={(event) => { const value = formatMurPrice(event.currentTarget.value); event.currentTarget.value = value; if (value !== hike.price) save(hike, { price: value }) }} placeholder="MUR 2,500" inputMode="decimal" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white" /></label>
            <label className="space-y-1 text-sm text-white/65">Total capacity<input type="number" min="1" defaultValue={hike.spots_total ?? 1} onBlur={(event) => save(hike, { spots_total: Number(event.currentTarget.value) })} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white" /></label>
            <label className="space-y-1 text-sm text-white/65">Remaining spots<input type="number" min="0" max={hike.spots_total ?? undefined} defaultValue={hike.spots_remaining ?? 0} onBlur={(event) => save(hike, { spots_remaining: Number(event.currentTarget.value) })} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white" /></label>
            <label className="space-y-1 text-sm text-white/65">Visibility<select defaultValue={hike.status} onChange={(event) => save(hike, { status: event.target.value })} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white"><option value="draft">Draft / hidden</option><option value="published">Published</option><option value="retired">Retired</option></select></label>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[220px_1fr]">
            <label className="space-y-1 text-sm text-white/65">Trail condition<select defaultValue={hike.trail_condition_status || 'open'} onChange={(event) => save(hike, { trail_condition_status: event.target.value })} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white"><option value="open">Open</option><option value="conditions_to_confirm">Conditions to confirm</option><option value="temporarily_unsuitable">Temporarily unsuitable</option><option value="closed">Closed</option></select></label>
            <label className="space-y-1 text-sm text-white/65">Operational note<textarea defaultValue={hike.trail_condition_note || ''} onBlur={(event) => save(hike, { trail_condition_note: event.currentTarget.value })} rows={2} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white" placeholder="Add a note for weather, access, footing, or other departure-specific conditions." /></label>
          </div>

          {saving === hike.id && <p className="mt-3 text-xs text-white/40">Saving…</p>}
        </article>
      ))}
    </div>
  )
}

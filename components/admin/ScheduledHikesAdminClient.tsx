'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { getScheduledHikeHref } from '@/lib/hike-routes'

type Hike = {
  id: string
  hike_id: string
  date: string | null
  status: 'draft' | 'published' | 'retired'
  spots_total: number | null
  spots_remaining: number | null
  trail_condition_status: 'open' | 'conditions_to_confirm' | 'temporarily_unsuitable' | 'closed' | null
  trail_condition_note: string | null
  difficulty: string
  location: string
  price: string
  hikes: { name: string; difficulty: string; location: string }
}

type Toast = { type: 'success' | 'error'; message: string } | null

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-wait disabled:bg-slate-100 disabled:text-slate-500'

export default function ScheduledHikesAdminClient({ initialHikes }: { initialHikes: Hike[] }) {
  const [hikes, setHikes] = useState(initialHikes)
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast>(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | Hike['status']>('all')

  const visibleHikes = useMemo(() => {
    const q = query.trim().toLowerCase()
    return hikes.filter((hike) => {
      const matchesStatus = status === 'all' || hike.status === status
      const matchesQuery = !q || [hike.hikes.name, hike.hikes.location, hike.hikes.difficulty].some((value) => value.toLowerCase().includes(q))
      return matchesStatus && matchesQuery
    })
  }, [hikes, query, status])

  function notify(next: Toast) {
    setToast(next)
    if (next) window.setTimeout(() => setToast(null), 3200)
  }

  async function save(hike: Hike, patch: Record<string, unknown>, message: string) {
    setSaving(hike.id)
    try {
      const response = await fetch(`/api/admin/hikes/${hike.id}/schedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to save departure')
      setHikes((current) => current.map((item) => item.id === hike.id ? result.data : item))
      notify({ type: 'success', message })
    } catch (error) {
      notify({ type: 'error', message: error instanceof Error ? error.message : 'Unable to save departure' })
    } finally {
      setSaving(null)
    }
  }

  function update(id: string, patch: Partial<Hike>) {
    setHikes((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item))
  }

  function formatMurPrice(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return ''
    const numeric = trimmed.replace(/^(mur|rs|rs\.)\s*/i, '').replace(/,/g, '').trim()
    if (/^\d+(?:\.\d{1,2})?$/.test(numeric)) {
      return `MUR ${Number(numeric).toLocaleString('en-MU', { maximumFractionDigits: 2 })}`
    }
    return /^mur\s/i.test(trimmed) ? trimmed : `MUR ${trimmed}`
  }

  if (!hikes.length) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">No scheduled departures yet. Create one from the schedule flow.</div>
  }

  const published = hikes.filter((hike) => hike.status === 'published').length
  const drafts = hikes.filter((hike) => hike.status === 'draft').length

  return (
    <div className="space-y-5">
      {toast && (
        <div role="status" aria-live="polite" className={`fixed bottom-5 right-5 z-[80] flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md ${toast.type === 'success' ? 'border-emerald-200 bg-white text-emerald-800' : 'border-red-200 bg-white text-red-800'}`}>
          <span aria-hidden="true" className="font-bold">{toast.type === 'success' ? '✓' : '!'}</span>
          <p className="text-sm font-medium">{toast.message}</p>
          <button type="button" onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-700" aria-label="Dismiss notification">×</button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Total departures</p><p className="mt-1 text-2xl font-semibold text-slate-900">{hikes.length}</p></div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Published</p><p className="mt-1 text-2xl font-semibold text-emerald-700">{published}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Drafts</p><p className="mt-1 text-2xl font-semibold text-white">{drafts}</p></div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <input aria-label="Search scheduled hikes" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by hike, location, or difficulty…" className={`${inputClass} flex-1`} />
        <select aria-label="Filter by visibility" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className={`${inputClass} sm:w-44`}>
          <option value="all">All visibility</option><option value="published">Published</option><option value="draft">Draft</option><option value="retired">Retired</option>
        </select>
        {(query || status !== 'all') && <button type="button" onClick={() => { setQuery(''); setStatus('all') }} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900">Clear</button>}
      </div>

      {!visibleHikes.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="font-medium text-slate-900">No departures match these filters.</p><p className="mt-1 text-sm text-slate-500">Try a different search or clear the filters.</p></div>
      ) : (
        <div className="space-y-4">
          {visibleHikes.map((hike) => {
            const isSaving = saving === hike.id
            return (
              <article key={hike.id} className={`rounded-2xl border bg-white p-5 shadow-sm transition ${isSaving ? 'border-emerald-400' : 'border-white/10'}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Scheduled departure</p>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">{hike.status}</span>
                    </div>
                    <h2 className="mt-2 text-lg font-semibold text-white">{hike.hikes.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{hike.hikes.location} · {hike.hikes.difficulty} · {hike.price || 'Price not set'}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {isSaving && <span className="text-xs font-medium text-emerald-700" role="status">Saving…</span>}
                    <Link href={getScheduledHikeHref(hike.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-300">View live <span aria-hidden="true">↗</span></Link>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <label className="space-y-1 text-sm text-white/65">Date<input type="date" disabled={isSaving} value={hike.date || ''} onChange={(event) => update(hike.id, { date: event.target.value })} onBlur={() => save(hike, { date: hike.date || null }, 'Departure date updated.')} className={inputClass} /></label>
                  <label className="space-y-1 text-sm text-white/65">Price (MUR)<input type="text" disabled={isSaving} value={hike.price || ''} onChange={(event) => update(hike.id, { price: event.target.value })} onBlur={(event) => { const value = formatMurPrice(event.currentTarget.value); update(hike.id, { price: value }); save(hike, { price: value }, 'Price updated.') }} placeholder="MUR 2,500" inputMode="decimal" className={inputClass} /></label>
                  <label className="space-y-1 text-sm text-white/65">Total capacity<input type="number" min="1" disabled={isSaving} value={hike.spots_total ?? 1} onChange={(event) => update(hike.id, { spots_total: Number(event.target.value) })} onBlur={() => save(hike, { spots_total: hike.spots_total }, 'Total capacity updated.')} className={inputClass} /></label>
                  <label className="space-y-1 text-sm text-white/65">Remaining spots<input type="number" min="0" max={hike.spots_total ?? undefined} disabled={isSaving} value={hike.spots_remaining ?? 0} onChange={(event) => update(hike.id, { spots_remaining: Number(event.target.value) })} onBlur={() => save(hike, { spots_remaining: hike.spots_remaining }, 'Remaining spots updated.')} className={inputClass} /></label>
                  <label className="space-y-1 text-sm text-white/65">Visibility<select disabled={isSaving} value={hike.status} onChange={(event) => { const value = event.target.value as Hike['status']; update(hike.id, { status: value }); save(hike, { status: value }, value === 'published' ? 'Departure published.' : value === 'retired' ? 'Departure retired.' : 'Departure moved to draft.') }} className={inputClass}><option value="draft">Draft / hidden</option><option value="published">Published</option><option value="retired">Retired</option></select></label>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[220px_1fr]">
                  <label className="space-y-1 text-sm text-white/65">Trail condition<select disabled={isSaving} value={hike.trail_condition_status || 'open'} onChange={(event) => { const value = event.target.value as Hike['trail_condition_status']; update(hike.id, { trail_condition_status: value }); save(hike, { trail_condition_status: value }, 'Trail condition updated.') }} className={inputClass}><option value="open">Open</option><option value="conditions_to_confirm">Conditions to confirm</option><option value="temporarily_unsuitable">Temporarily unsuitable</option><option value="closed">Closed</option></select></label>
                  <label className="space-y-1 text-sm text-white/65">Operational note<textarea disabled={isSaving} value={hike.trail_condition_note || ''} onChange={(event) => update(hike.id, { trail_condition_note: event.target.value })} onBlur={() => save(hike, { trail_condition_note: hike.trail_condition_note || '' }, 'Operational note saved.')} rows={2} className={inputClass} placeholder="Add weather, access, footing, or other departure-specific conditions." /></label>
                </div>

                <p className="mt-4 text-xs text-slate-500">Changes save automatically when you leave a field. Visibility and trail condition save immediately.</p>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

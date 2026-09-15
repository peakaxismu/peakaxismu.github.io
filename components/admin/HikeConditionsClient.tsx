'use client'

import { useState } from 'react'

type TrailStatus = 'open' | 'conditions_to_confirm' | 'temporarily_unsuitable' | 'closed'

type Hike = {
  id: string
  name: string
  status: 'draft' | 'published'
  difficulty: string
  location: string
  trail_condition_status: TrailStatus
  trail_condition_note: string | null
  trail_condition_updated_at: string | null
}

const options: { value: TrailStatus; label: string; help: string }[] = [
  { value: 'open', label: 'Open', help: 'Normal booking flow.' },
  { value: 'conditions_to_confirm', label: 'Conditions to confirm', help: 'Keep enquiries open, but confirm route conditions before departure.' },
  { value: 'temporarily_unsuitable', label: 'Temporarily unsuitable', help: 'Do not sell this route until conditions improve.' },
  { value: 'closed', label: 'Closed', help: 'Route is unavailable; use an alternative.' },
]

export default function HikeConditionsClient({ initialHikes }: { initialHikes: Hike[] }) {
  const [hikes, setHikes] = useState(initialHikes)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const save = async (hike: Hike, status: TrailStatus, note: string) => {
    setSaving(hike.id)
    setMessage('')
    try {
      const response = await fetch(`/api/admin/hikes/${hike.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trail_condition_status: status, trail_condition_note: note }),
      })
      const json = await response.json().catch(() => ({}))
      if (!response.ok || !json.success) throw new Error(json.error || 'Could not save condition')
      setHikes((current) => current.map((item) => item.id === hike.id ? { ...item, ...json.data } : item))
      setMessage(`${hike.name} updated.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save condition.')
    } finally { setSaving(null) }
  }

  return (
    <div className="conditions-admin">
      <style>{`
        .conditions-admin{color:var(--ink);max-width:1100px}.top{margin-bottom:24px}.title{font:900 38px/.95 'Big Shoulders Display',sans-serif;text-transform:uppercase;margin:0}.intro{font-size:14px;color:#625e56;line-height:1.55;max-width:760px;margin:10px 0 0}.notice{padding:12px 14px;background:#eeeadf;border-left:3px solid var(--ember);font-size:12px;line-height:1.5;margin-bottom:18px}.message{font-size:12px;margin:0 0 12px;color:#625e56}.grid{display:grid;gap:12px}.card{background:var(--warm-white);border:1px solid var(--sand-line);padding:18px}.head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.name{font-weight:900;font-size:17px}.meta{font-size:11px;color:#777168;margin-top:5px}.badge{font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.07em;padding:5px 7px;border:1px solid var(--sand-line);white-space:nowrap}.badge.published{background:#e5eee9;color:#1f5b45}.badge.draft{background:#eeeae2;color:#69645d}.fields{display:grid;grid-template-columns:260px 1fr;gap:12px;margin-top:16px}.select,.note{width:100%;box-sizing:border-box;border:1px solid var(--sand-line);background:var(--warm-white);color:var(--ink);padding:10px 11px;font:inherit;font-size:13px}.note{min-height:72px;resize:vertical}.help{font-size:11px;color:#777168;line-height:1.4;margin-top:6px}.foot{display:flex;justify-content:flex-end;margin-top:12px}.save{background:var(--ember);border:0;color:#fff;padding:10px 15px;font-size:11px;font-weight:900;cursor:pointer}.save:disabled{opacity:.55;cursor:wait}@media(max-width:700px){.fields{grid-template-columns:1fr}.head{display:block}.badge{display:inline-block;margin-top:9px}}
      `}</style>
      <div className="top">
        <h1 className="title">Trail conditions</h1>
        <p className="intro">Operational status for each route. Use this when rainfall, landslide risk, trail damage, access restrictions, or local route checks make the normal booking flow inappropriate.</p>
      </div>
      <div className="notice"><strong>Operational rule:</strong> this is route-specific. A general weather warning does not automatically close every hike. Update the route after a local check and leave a short note explaining what guests need to know.</div>
      {message && <p className="message">{message}</p>}
      <div className="grid">
        {hikes.map((hike) => {
          const current = options.find((item) => item.value === hike.trail_condition_status) || options[0]
          return <ConditionCard key={hike.id} hike={hike} current={current} saving={saving === hike.id} onSave={save} />
        })}
      </div>
    </div>
  )
}

function ConditionCard({ hike, current, saving, onSave }: { hike: Hike; current: (typeof options)[number]; saving: boolean; onSave: (hike: Hike, status: TrailStatus, note: string) => Promise<void> }) {
  const [status, setStatus] = useState<TrailStatus>(hike.trail_condition_status)
  const [note, setNote] = useState(hike.trail_condition_note || '')
  const selected = options.find((item) => item.value === status) || current
  return (
    <div className="card">
      <div className="head"><div><div className="name">{hike.name}</div><div className="meta">{hike.location} · {hike.difficulty}</div></div><span className={`badge ${hike.status}`}>{hike.status}</span></div>
      <div className="fields">
        <div><select className="select" value={status} onChange={(e) => setStatus(e.target.value as TrailStatus)} aria-label={`Condition for ${hike.name}`}>{options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><div className="help">{selected.help}</div></div>
        <textarea className="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional operational note, e.g. wet rock after heavy rain; confirm access before departure." aria-label={`Condition note for ${hike.name}`} />
      </div>
      <div className="foot"><button className="save" disabled={saving} onClick={() => onSave(hike, status, note)}>{saving ? 'Saving…' : 'Save condition'}</button></div>
    </div>
  )
}

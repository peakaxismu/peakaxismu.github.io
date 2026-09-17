'use client'

import { useState } from 'react'
import HikeMediaManager from './HikeMediaManager'

export default function HikeMediaAdminPanel({ hikes }: { hikes: { id: string; name: string }[] }) {
  const [hikeId, setHikeId] = useState(hikes[0]?.id || '')
  const selected = hikes.find((hike) => hike.id === hikeId)

  return <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">Hike photography</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Manage route photos</h2>
        <p className="mt-1 max-w-2xl text-sm text-white/60">Choose a hike, upload its main cover image, then add optional gallery photos. Changes appear on the public hike experience.</p>
      </div>
      <select value={hikeId} onChange={(event) => setHikeId(event.target.value)} className="min-w-[260px] rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-sm text-white">
        {hikes.map((hike) => <option key={hike.id} value={hike.id}>{hike.name}</option>)}
      </select>
    </div>
    {selected ? <div className="mt-2"><HikeMediaManager hikeId={selected.id} /></div> : <p className="mt-5 text-sm text-white/50">Create a hike first, then add its photos here.</p>}
  </section>
}

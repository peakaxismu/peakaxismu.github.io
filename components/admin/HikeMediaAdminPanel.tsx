'use client'

import HikeMediaManager from './HikeMediaManager'

export default function HikeMediaAdminPanel({ hikes }: { hikes: { id: string; name: string }[] }) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">Hike photography</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Photos for each hike</h2>
        <p className="mt-1 max-w-2xl text-sm text-white/60">
          Every hike has its own photo upload area. Add one main cover image and optional gallery photos directly under the hike you want to manage.
        </p>
      </div>

      {hikes.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/50">
          Create a hike first, then its photo upload section will appear here.
        </div>
      ) : (
        hikes.map((hike) => (
          <article key={hike.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300/80">{hike.name}</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Manage photos</h3>
            </div>
            <HikeMediaManager hikeId={hike.id} />
          </article>
        ))
      )}
    </section>
  )
}

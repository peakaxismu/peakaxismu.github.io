import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ScheduledHikesAdminClient from '@/components/admin/ScheduledHikesAdminClient'

export const revalidate = 0

export default async function AdminScheduledHikesPage() {
  await createClient()
  const admin = createAdminClient()
  const { data: hikes } = await admin
    .from('scheduled_hikes')
    .select('*,hikes(*)')
    .order('date', { ascending: true })

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">Scheduled departures</p>
          <h1 className="mt-1 text-xl font-semibold text-white">Review and manage scheduled hikes</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/60">Each departure is its own scheduled record linked to a reusable route. Change the date, capacity, price, visibility, or operational trail condition here without changing the route.</p>
        </div>
        <Link href="/admin/hikes/schedule" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">Schedule another</Link>
      </div>
      <ScheduledHikesAdminClient initialHikes={hikes || []} />
    </div>
  )
}

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import HikesAdminClient from '@/components/admin/HikesAdminClient'

export const revalidate = 0

export default async function AdminHikesPage() {
  const supabase = await createClient()

  const { data: hikes } = await supabase
    .from('hikes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">Scheduled groups</p>
          <h1 className="mt-1 text-xl font-semibold text-white">Turn a route into a scheduled hike</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/60">
            Pick an existing hike as the route template. The schedule flow copies its trail, customer, pricing, and safety information into a separate scheduled instance, then asks only for the date, capacity, and visibility.
          </p>
        </div>
        <Link
          href="/admin/hikes/schedule"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          Schedule a hike
        </Link>
      </div>

      <HikesAdminClient initialHikes={hikes || []} />
    </div>
  )
}

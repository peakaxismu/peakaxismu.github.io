import { createClient } from '@/lib/supabase/server'
import HikeConditionsClient from '@/components/admin/HikeConditionsClient'

export const revalidate = 0

export default async function AdminHikeConditionsPage() {
  const supabase = await createClient()
  const { data: hikes } = await supabase
    .from('hikes')
    .select('id,name,status,difficulty,location,trail_condition_status,trail_condition_note,trail_condition_updated_at')
    .order('name', { ascending: true })

  const normalised = (hikes || []).map((hike) => ({
    ...hike,
    trail_condition_status: hike.trail_condition_status || 'open',
  }))

  return <HikeConditionsClient initialHikes={normalised as any} />
}

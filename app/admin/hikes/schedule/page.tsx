import { createClient } from '@/lib/supabase/server'
import ScheduleHikeClient from '@/components/admin/ScheduleHikeClient'

export const revalidate = 0

export default async function AdminScheduleHikePage() {
  const supabase = await createClient()
  const { data: hikes } = await supabase
    .from('hikes')
    .select('id,name,difficulty,duration,location,price,max_participants,spots_total,booking_type')
    .eq('status', 'published')
    .neq('booking_type', 'scheduled_group')
    .order('name', { ascending: true })

  return <ScheduleHikeClient hikes={hikes || []} />
}

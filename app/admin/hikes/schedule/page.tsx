import { createClient } from '@/lib/supabase/server'
import ScheduleHikeClient from '@/components/admin/ScheduleHikeClient'

export const revalidate = 0

export default async function AdminScheduleHikePage() {
  const supabase = await createClient()
  const { data: hikes } = await supabase
    .from('hikes')
    .select('id,name,difficulty,duration,location,price,max_participants,booking_type')
    .eq('status', 'published')
    
    .order('name', { ascending: true })

  return <ScheduleHikeClient hikes={hikes || []} />
}

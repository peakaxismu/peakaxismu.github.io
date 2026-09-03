import { createClient } from '@/lib/supabase/server'
import HikesAdminClient from '@/components/admin/HikesAdminClient'

export const revalidate = 0

export default async function AdminHikesPage() {
  const supabase = await createClient()

  const { data: hikes } = await supabase
    .from('hikes')
    .select('*')
    .order('created_at', { ascending: false })

  return <HikesAdminClient initialHikes={hikes || []} />
}

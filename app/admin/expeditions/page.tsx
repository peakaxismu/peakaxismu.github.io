import { createClient } from '@/lib/supabase/server'
import ExpeditionsAdminClient from '@/components/admin/ExpeditionsAdminClient'

export const revalidate = 0

export default async function AdminExpeditionsPage() {
  const supabase = await createClient()

  const { data: expeditions } = await supabase
    .from('expeditions')
    .select('*')
    .order('created_at', { ascending: false })

  return <ExpeditionsAdminClient initialExpeditions={expeditions || []} />
}

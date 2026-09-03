import { createClient } from '@/lib/supabase/server'
import TeamBuildingAdminClient from '@/components/admin/TeamBuildingAdminClient'

export const revalidate = 0

export default async function AdminTeamBuildingPage() {
  const supabase = await createClient()

  const { data: packages } = await supabase
    .from('team_building_packages')
    .select('*')
    .order('created_at', { ascending: false })

  return <TeamBuildingAdminClient initialPackages={packages || []} />
}

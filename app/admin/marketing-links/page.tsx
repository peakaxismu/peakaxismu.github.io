import { redirect } from 'next/navigation'
import MarketingLinksManager from '@/components/admin/MarketingLinksManager'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/supabase/admin-auth'

export const revalidate = 0

export default async function AdminMarketingLinksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser(user)) redirect('/admin/login')

  return <MarketingLinksManager />
}

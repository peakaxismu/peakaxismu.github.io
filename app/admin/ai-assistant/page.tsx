import { redirect } from 'next/navigation'
import AISuggestionReview from '@/components/admin/AISuggestionReview'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

export const revalidate = 0

export default async function AdminAISuggestionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser(user)) redirect('/admin/login')
  const admin = createAdminClient()
  const { data, error } = await admin.from('crm_ai_suggestions').select('id,entity_type,entity_id,suggestion_type,title,rationale,evidence,proposed_action,status,created_at').order('created_at', { ascending: false }).limit(100)
  if (error) throw new Error('Unable to load the AI review queue. Confirm the CRM database migration has been applied.')
  return <AISuggestionReview initialSuggestions={data ?? []} />
}

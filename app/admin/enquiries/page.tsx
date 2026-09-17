import { createClient } from '@/lib/supabase/server'
import EnquiryWorkspace from '@/components/admin/EnquiryWorkspace'

export const revalidate = 0

export default async function AdminEnquiriesPage() {
  const supabase = await createClient()
  const { data: enquiries } = await supabase.from('enquiries').select('*').order('submitted_at', { ascending: false })

  return <EnquiryWorkspace initialEnquiries={enquiries || []} />
}

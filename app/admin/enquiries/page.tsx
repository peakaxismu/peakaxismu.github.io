import { createClient } from '@/lib/supabase/server'
import EnquiriesTable from '@/components/admin/EnquiriesTable'

export const revalidate = 0

export default async function AdminEnquiriesPage() {
  const supabase = await createClient()

  const { data: enquiries } = await supabase
    .from('enquiries')
    .select('*')
    .order('submitted_at', { ascending: false })

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Big Shoulders Display', fontWeight: 900, fontSize: '36px', textTransform: 'uppercase' }}>
          Customer Enquiries
        </h1>
        <p style={{ color: '#5a564f', fontSize: '15px', marginTop: '4px' }}>
          All customer enquiries submitted through the public website form.
        </p>
      </div>

      <EnquiriesTable initialEnquiries={enquiries || []} />
    </div>
  )
}

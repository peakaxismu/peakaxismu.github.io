import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import EnquiriesTable from '@/components/admin/EnquiriesTable'

export const revalidate = 0

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: enquiries } = await supabase
    .from('enquiries')
    .select('*')
    .order('submitted_at', { ascending: false })

  const { count: newCount } = await supabase
    .from('enquiries')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  const { count: hikesCount } = await supabase
    .from('hikes')
    .select('*', { count: 'exact', head: true })

  const { count: expCount } = await supabase
    .from('expeditions')
    .select('*', { count: 'exact', head: true })

  const recentEnquiries = enquiries || []

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Big Shoulders Display', fontWeight: 900, fontSize: '36px', textTransform: 'uppercase' }}>
          Dashboard
        </h1>
        <p style={{ color: '#5a564f', fontSize: '15px', marginTop: '4px' }}>
          Overview of customer enquiries and active website content.
        </p>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'var(--warm-white)', border: '1px solid var(--sand-line)', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ember)' }}>New Enquiries</div>
          <div style={{ fontFamily: 'Big Shoulders Display', fontSize: '42px', fontWeight: 900, marginTop: '4px' }}>{newCount || 0}</div>
        </div>
        <div style={{ background: 'var(--warm-white)', border: '1px solid var(--sand-line)', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--teal)' }}>Active Hikes</div>
          <div style={{ fontFamily: 'Big Shoulders Display', fontSize: '42px', fontWeight: 900, marginTop: '4px' }}>{hikesCount || 0}</div>
        </div>
        <div style={{ background: 'var(--warm-white)', border: '1px solid var(--sand-line)', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink)' }}>Expeditions</div>
          <div style={{ fontFamily: 'Big Shoulders Display', fontSize: '42px', fontWeight: 900, marginTop: '4px' }}>{expCount || 0}</div>
        </div>
      </div>

      {/* Recent Enquiries Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'Big Shoulders Display', fontWeight: 900, fontSize: '24px', textTransform: 'uppercase' }}>
            Recent Customer Enquiries
          </h2>
          <Link href="/admin/enquiries" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ember)', textDecoration: 'underline' }}>
            View all enquiries →
          </Link>
        </div>

        <EnquiriesTable initialEnquiries={recentEnquiries} />
      </div>
    </div>
  )
}

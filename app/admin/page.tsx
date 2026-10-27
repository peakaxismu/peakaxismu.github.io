import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'
import EnquiriesTable from '@/components/admin/EnquiriesTable'

export const revalidate = 0

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser(user)) redirect('/admin/login')
  const admin = createAdminClient()

  const { data: enquiries } = await admin
    .from('enquiries')
    .select('*')
    .order('submitted_at', { ascending: false })

  const { count: newCount } = await admin
    .from('enquiries')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  const { count: hikesCount } = await admin
    .from('hikes')
    .select('*', { count: 'exact', head: true })

  const { count: expCount } = await admin
    .from('expeditions')
    .select('*', { count: 'exact', head: true })

  const { count: customersCount } = await admin
    .from('customers')
    .select('*', { count: 'exact', head: true })

  const { count: bookingsCount } = await admin
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'confirmed'])

  const { count: tasksCount } = await admin
    .from('crm_tasks')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'in_progress'])

  const { count: aiSuggestionsCount } = await admin
    .from('crm_ai_suggestions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

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
        <Link href="/admin/customers" style={{ background: 'var(--warm-white)', border: '1px solid var(--sand-line)', padding: '20px', color: 'inherit', textDecoration: 'none' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ember)' }}>Customers</div>
          <div style={{ fontFamily: 'Big Shoulders Display', fontSize: '42px', fontWeight: 900, marginTop: '4px' }}>{customersCount || 0}</div>
        </Link>
        <Link href="/admin/bookings" style={{ background: 'var(--warm-white)', border: '1px solid var(--sand-line)', padding: '20px', color: 'inherit', textDecoration: 'none' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--teal)' }}>Open bookings</div>
          <div style={{ fontFamily: 'Big Shoulders Display', fontSize: '42px', fontWeight: 900, marginTop: '4px' }}>{bookingsCount || 0}</div>
        </Link>
        <Link href="/admin/tasks" style={{ background: 'var(--warm-white)', border: '1px solid var(--sand-line)', padding: '20px', color: 'inherit', textDecoration: 'none' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink)' }}>Open tasks</div>
          <div style={{ fontFamily: 'Big Shoulders Display', fontSize: '42px', fontWeight: 900, marginTop: '4px' }}>{tasksCount || 0}</div>
        </Link>
        <Link href="/admin/ai-assistant" style={{ background: 'var(--warm-white)', border: '1px solid var(--sand-line)', padding: '20px', color: 'inherit', textDecoration: 'none' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ember)' }}>AI reviews pending</div>
          <div style={{ fontFamily: 'Big Shoulders Display', fontSize: '42px', fontWeight: 900, marginTop: '4px' }}>{aiSuggestionsCount || 0}</div>
        </Link>
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

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import CustomerProfileEditor from '@/components/admin/CustomerProfileEditor'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

export const revalidate = 0

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser(user)) redirect('/admin/login')

  const admin = createAdminClient()
  const [{ data: customer, error }, { data: enquiries }, { data: bookings }] = await Promise.all([
    admin.from('customers').select('*').eq('id', id).maybeSingle(),
    admin.from('enquiries').select('id,name,interest_type,reference_id,status,preferred_date,submitted_at').eq('customer_id', id).order('submitted_at', { ascending: false }),
    admin.from('bookings').select('id,booking_reference,activity_type,booking_date,group_size,total_amount,currency,status,payment_status').eq('customer_id', id).order('booking_date', { ascending: false }),
  ])
  if (error) throw new Error('Unable to load customer')
  if (!customer) notFound()

  const panel: React.CSSProperties = { background: 'var(--warm-white)', border: '1px solid var(--sand-line)', padding: 20 }
  const badge = (status: string) => <span style={{ display: 'inline-block', background: 'var(--sand)', padding: '4px 8px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>{status.replaceAll('_', ' ')}</span>

  return <div>
    <Link href="/admin/customers" style={{ color: 'var(--ember)', fontSize: 13, fontWeight: 800 }}>← All customers</Link>
    <CustomerProfileEditor initialCustomer={customer} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18 }}>
      <section style={panel}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}><h2 style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase' }}>Enquiry history</h2><span>{enquiries?.length ?? 0}</span></div>
        {(enquiries ?? []).map(e => <div key={e.id} style={{ padding: '12px 0', borderTop: '1px solid var(--sand-line)' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><strong>{e.reference_id || e.interest_type.replaceAll('_', ' ')}</strong>{badge(e.status)}</div><p style={{ color: '#625d55', fontSize: 12, marginTop: 4 }}>{e.preferred_date || 'Date not specified'} · {new Date(e.submitted_at).toLocaleDateString()}</p><Link href="/admin/enquiries" style={{ fontSize: 12, color: 'var(--ember)', fontWeight: 800 }}>Open enquiries →</Link></div>)}
        {!enquiries?.length && <p style={{ color: '#625d55' }}>No enquiries linked to this customer yet.</p>}
      </section>
      <section style={panel}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}><h2 style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase' }}>Bookings</h2><Link href="/admin/bookings" style={{ color: 'var(--ember)', fontSize: 12, fontWeight: 800 }}>Manage →</Link></div>
        {(bookings ?? []).map(b => <div key={b.id} style={{ padding: '12px 0', borderTop: '1px solid var(--sand-line)' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><strong>{b.booking_reference}</strong>{badge(b.status)}</div><p style={{ fontSize: 13, marginTop: 4 }}>{b.activity_type.replaceAll('_', ' ')} · {b.booking_date} · {b.group_size} guest(s)</p><p style={{ color: '#625d55', fontSize: 12, marginTop: 3 }}>{b.total_amount == null ? 'Price not set' : b.currency + ' ' + Number(b.total_amount).toLocaleString()} · Payment: {b.payment_status.replaceAll('_', ' ')}</p></div>)}
        {!bookings?.length && <p style={{ color: '#625d55' }}>No bookings yet. Confirmed enquiries should be converted to bookings explicitly.</p>}
      </section>
    </div>
  </div>
}

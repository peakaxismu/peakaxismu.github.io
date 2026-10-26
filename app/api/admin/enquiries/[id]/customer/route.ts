import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdminUser(user)) return NextResponse.json({ error: 'Forbidden' }, { status: user ? 403 : 401 })

    const admin = createAdminClient()
    const { data: enquiry, error: enquiryError } = await admin.from('enquiries')
      .select('id,name,email,phone,customer_id').eq('id', id).maybeSingle()
    if (enquiryError) return NextResponse.json({ error: 'Unable to load enquiry' }, { status: 500 })
    if (!enquiry) return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 })
    if (enquiry.customer_id) return NextResponse.json({ data: { customer_id: enquiry.customer_id, already_linked: true } })

    const email = String(enquiry.email).trim().toLowerCase()
    const { data: existing, error: lookupError } = await admin.from('customers').select('id').eq('email', email).maybeSingle()
    if (lookupError) return NextResponse.json({ error: 'Unable to check customer records' }, { status: 500 })

    let customerId = existing?.id as string | undefined
    if (!customerId) {
      const { data: created, error: createError } = await admin.from('customers')
        .insert({ full_name: String(enquiry.name).trim(), email, phone: enquiry.phone?.trim() || null })
        .select('id').single()
      if (createError?.code === '23505') {
        const { data: raced } = await admin.from('customers').select('id').eq('email', email).maybeSingle()
        customerId = raced?.id
      } else if (createError || !created) {
        return NextResponse.json({ error: 'Unable to create customer record' }, { status: 500 })
      } else customerId = created.id
    }
    if (!customerId) return NextResponse.json({ error: 'Unable to resolve customer record' }, { status: 500 })

    const { data: linked, error: linkError } = await admin.from('enquiries').update({ customer_id: customerId }).eq('id', id).is('customer_id', null).select('customer_id').maybeSingle()
    if (linkError) return NextResponse.json({ error: 'Customer created but the enquiry could not be linked. Refresh and try again.' }, { status: 500 })
    if (!linked?.customer_id) {
      const { data: refreshed } = await admin.from('enquiries').select('customer_id').eq('id', id).maybeSingle()
      if (!refreshed?.customer_id) return NextResponse.json({ error: 'Unable to link enquiry to customer' }, { status: 409 })
      customerId = refreshed.customer_id
    }

    await admin.from('enquiry_activities').insert({
      enquiry_id: id, type: 'note',
      body: 'Linked to customer record.',
      metadata: { customer_id: customerId, actor: 'admin_action' },
      created_by: user?.id ?? null,
    })
    return NextResponse.json({ data: { customer_id: customerId, already_linked: false } }, { status: 201 })
  } catch (error) {
    console.error('Admin enquiry-to-customer conversion failed:', error)
    return NextResponse.json({ error: 'Unable to link enquiry to customer' }, { status: 500 })
  }
}

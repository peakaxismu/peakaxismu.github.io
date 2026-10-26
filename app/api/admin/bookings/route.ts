import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

const TYPES = ['hike', 'private_hike', 'expedition', 'team', 'activity'] as const
const DATE = /^\d{4}-\d{2}-\d{2}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function authorize() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { user, allowed: isAdminUser(user) }
}

export async function GET() {
  try {
    const auth = await authorize()
    if (!auth.allowed) return NextResponse.json({ error: 'Forbidden' }, { status: auth.user ? 403 : 401 })
    const admin = createAdminClient()
    const { data, error } = await admin.from('bookings').select('id,booking_reference,customer_id,enquiry_id,activity_type,scheduled_hike_id,expedition_id,booking_date,group_size,total_amount,currency,status,payment_status,internal_notes,created_at,updated_at,customers(full_name,email)').order('booking_date', { ascending: false })
    if (error) return NextResponse.json({ error: 'Unable to load bookings' }, { status: 500 })
    return NextResponse.json({ data: data ?? [] })
  } catch (error) {
    console.error('Admin bookings GET failed:', error)
    return NextResponse.json({ error: 'Unable to load bookings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { user, allowed } = await authorize()
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: user ? 403 : 401 })
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    const input = body as Record<string, unknown>
    const customer_id = typeof input.customer_id === 'string' ? input.customer_id : ''
    const activity_type = typeof input.activity_type === 'string' ? input.activity_type : ''
    const scheduled_hike_id = typeof input.scheduled_hike_id === 'string' && input.scheduled_hike_id ? input.scheduled_hike_id : null
    const expedition_id = typeof input.expedition_id === 'string' && input.expedition_id ? input.expedition_id : null
    const enquiry_id = typeof input.enquiry_id === 'string' && input.enquiry_id ? input.enquiry_id : null
    const booking_date = typeof input.booking_date === 'string' ? input.booking_date : ''
    const group_size = Number(input.group_size ?? 1)
    const amount = input.total_amount === '' || input.total_amount === null || input.total_amount === undefined ? null : Number(input.total_amount)
    const currency = typeof input.currency === 'string' ? input.currency.toUpperCase() : 'MUR'
    const internal_notes = typeof input.internal_notes === 'string' ? input.internal_notes.trim() : ''

    if (!UUID.test(customer_id)) return NextResponse.json({ error: 'Choose a valid customer' }, { status: 400 })
    if (!TYPES.includes(activity_type as typeof TYPES[number])) return NextResponse.json({ error: 'Choose a valid activity type' }, { status: 400 })
    if (!Number.isInteger(group_size) || group_size < 1 || group_size > 1000) return NextResponse.json({ error: 'Group size must be between 1 and 1000' }, { status: 400 })
    if (!DATE.test(booking_date)) return NextResponse.json({ error: 'Choose a booking date' }, { status: 400 })
    if (amount !== null && (!Number.isFinite(amount) || amount < 0 || amount > 9999999999)) return NextResponse.json({ error: 'Enter a valid non-negative total' }, { status: 400 })
    if (!/^[A-Z]{3}$/.test(currency)) return NextResponse.json({ error: 'Currency must be a three-letter code' }, { status: 400 })
    if (internal_notes.length > 10000) return NextResponse.json({ error: 'Internal notes are too long' }, { status: 400 })
    if (scheduled_hike_id && (!UUID.test(scheduled_hike_id) || activity_type !== 'hike')) return NextResponse.json({ error: 'Scheduled hikes can only be linked to hike bookings' }, { status: 400 })
    if (expedition_id && (!UUID.test(expedition_id) || activity_type !== 'expedition')) return NextResponse.json({ error: 'Choose a valid expedition for this booking type' }, { status: 400 })
    if (activity_type === 'hike' && !scheduled_hike_id) return NextResponse.json({ error: 'Choose a published scheduled hike' }, { status: 400 })
    if (activity_type === 'expedition' && !expedition_id) return NextResponse.json({ error: 'Choose an expedition' }, { status: 400 })
    if (enquiry_id && !UUID.test(enquiry_id)) return NextResponse.json({ error: 'Invalid enquiry reference' }, { status: 400 })

    const admin = createAdminClient()
    const [{ data: customer }, departureResult, expeditionResult, enquiryResult] = await Promise.all([
      admin.from('customers').select('id').eq('id', customer_id).maybeSingle(),
      scheduled_hike_id ? admin.from('scheduled_hikes').select('id,date,status,spots_remaining').eq('id', scheduled_hike_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
      expedition_id ? admin.from('expeditions').select('id,status').eq('id', expedition_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
      enquiry_id ? admin.from('enquiries').select('id,customer_id').eq('id', enquiry_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ])
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    if (scheduled_hike_id && (!departureResult.data || departureResult.data.status !== 'published' || departureResult.data.spots_remaining < group_size)) return NextResponse.json({ error: 'That departure is unavailable or does not have enough remaining spaces' }, { status: 409 })
    if (expedition_id && (!expeditionResult.data || expeditionResult.data.status !== 'published')) return NextResponse.json({ error: 'Choose a published expedition' }, { status: 400 })
    if (enquiry_id && (!enquiryResult.data || (enquiryResult.data.customer_id && enquiryResult.data.customer_id !== customer_id))) return NextResponse.json({ error: 'The enquiry does not belong to this customer' }, { status: 400 })

    const dateToSave = departureResult.data?.date ?? booking_date
    const { data, error } = await admin.from('bookings').insert({
      customer_id, enquiry_id, activity_type, scheduled_hike_id, expedition_id,
      booking_date: dateToSave, group_size, total_amount: amount, currency,
      internal_notes: internal_notes || null, created_by: user?.id ?? null, status: 'pending',
    }).select('id,booking_reference,customer_id,enquiry_id,activity_type,scheduled_hike_id,expedition_id,booking_date,group_size,total_amount,currency,status,payment_status,internal_notes,created_at').single()
    if (error || !data) {
      if (error?.code === '23514') return NextResponse.json({ error: 'The departure capacity changed. Refresh the page and check availability.' }, { status: 409 })
      return NextResponse.json({ error: 'Unable to create booking' }, { status: 500 })
    }
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Admin bookings POST failed:', error)
    return NextResponse.json({ error: 'Unable to create booking' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const
const PAYMENT_STATUSES = ['pending', 'partially_paid', 'paid', 'refunded'] as const

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdminUser(user)) return NextResponse.json({ error: 'Forbidden' }, { status: user ? 403 : 401 })

    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    const input = body as Record<string, unknown>
    const update: Record<string, unknown> = {}

    if (input.status !== undefined) {
      if (typeof input.status !== 'string' || !STATUSES.includes(input.status as typeof STATUSES[number])) return NextResponse.json({ error: 'Invalid booking status' }, { status: 400 })
      update.status = input.status
    }
    if (input.payment_status !== undefined) {
      if (typeof input.payment_status !== 'string' || !PAYMENT_STATUSES.includes(input.payment_status as typeof PAYMENT_STATUSES[number])) return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
      update.payment_status = input.payment_status
    }
    if (input.total_amount !== undefined) {
      if (input.total_amount === null || input.total_amount === '') update.total_amount = null
      else if (typeof input.total_amount !== 'number' || !Number.isFinite(input.total_amount) || input.total_amount < 0) return NextResponse.json({ error: 'Invalid booking total' }, { status: 400 })
      else update.total_amount = input.total_amount
    }
    if (input.group_size !== undefined) {
      if (typeof input.group_size !== 'number' || !Number.isInteger(input.group_size) || input.group_size < 1 || input.group_size > 1000) return NextResponse.json({ error: 'Invalid group size' }, { status: 400 })
      update.group_size = input.group_size
    }
    if (input.internal_notes !== undefined) {
      if (typeof input.internal_notes !== 'string' || input.internal_notes.length > 10000) return NextResponse.json({ error: 'Invalid internal notes' }, { status: 400 })
      update.internal_notes = input.internal_notes.trim() || null
    }
    if (!Object.keys(update).length) return NextResponse.json({ error: 'No valid changes supplied' }, { status: 400 })

    const admin = createAdminClient()
    const { data, error } = await admin.from('bookings').update(update).eq('id', id).select('id,booking_reference,customer_id,enquiry_id,activity_type,scheduled_hike_id,expedition_id,booking_date,group_size,total_amount,currency,status,payment_status,internal_notes,created_at,updated_at').maybeSingle()
    if (error?.code === '23514') return NextResponse.json({ error: 'Not enough departure spaces remain. The booking was not changed.' }, { status: 409 })
    if (error) return NextResponse.json({ error: 'Unable to update booking' }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Admin booking PATCH failed:', error)
    return NextResponse.json({ error: 'Unable to update booking' }, { status: 500 })
  }
}

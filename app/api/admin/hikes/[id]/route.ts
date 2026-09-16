import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

const practicalFields = [
  'distance_km','elevation_gain_m','starting_point','meeting_point','transport_options',
  'fitness_required','terrain','what_to_bring','included','excluded','safety_info',
  'weather_policy','age_requirements','min_participants','max_participants',
  'experience_types','region','booking_type','rating_label',
  'trail_condition_status','trail_condition_note','trail_condition_updated_at',
] as const
const trailStatuses = ['open', 'conditions_to_confirm', 'temporarily_unsuitable', 'closed'] as const
type TrailStatus = typeof trailStatuses[number]

function practicalPayload(body: Record<string, unknown>) {
  const payload: Record<string, unknown> = {}
  for (const field of practicalFields) if (body[field] !== undefined) payload[field] = body[field]
  return payload
}
function normaliseBookingType(value: unknown) { return value === 'scheduled_group' || value === 'private' || value === 'on_demand' ? value : 'on_demand' }
function isTrailStatus(value: unknown): value is TrailStatus { return typeof value === 'string' && trailStatuses.includes(value as TrailStatus) }

async function authorize() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { user, authorized: isAdminUser(user) }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, authorized } = await authorize()
    if (!authorized) return NextResponse.json({ error: user ? 'Forbidden' : 'Unauthorized' }, { status: user ? 403 : 401 })
    const body = await request.json() as Record<string, unknown>
    if (!isTrailStatus(body.trail_condition_status)) return NextResponse.json({ error: 'Invalid trail condition status' }, { status: 400 })
    const admin = createAdminClient()
    const { data: existing, error: existingError } = await admin.from('hikes').select('trail_condition_status, trail_condition_note').eq('id', id).single()
    if (existingError) return NextResponse.json({ error: 'Hike not found' }, { status: 404 })
    const note = typeof body.trail_condition_note === 'string' ? body.trail_condition_note.trim() : ''
    if (body.trail_condition_status !== 'open' && !note) return NextResponse.json({ error: 'Add a short operational note when a route is not open.' }, { status: 400 })
    const changed = body.trail_condition_status !== existing.trail_condition_status || note !== (existing.trail_condition_note || '')
    const { data, error } = await admin.from('hikes').update({
      trail_condition_status: body.trail_condition_status,
      trail_condition_note: note || null,
      ...(changed ? { trail_condition_updated_at: new Date().toISOString() } : {}),
    }).eq('id', id).select('id,name,status,trail_condition_status,trail_condition_note,trail_condition_updated_at').single()
    if (error) return NextResponse.json({ error: 'Failed to update trail condition' }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Unable to update trail condition' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, authorized } = await authorize()
    if (!authorized) return NextResponse.json({ error: user ? 'Forbidden' : 'Unauthorized' }, { status: user ? 403 : 401 })
    const body = await request.json() as Record<string, unknown>
    const { name, difficulty, date, duration, location, price, spots_total, spots_remaining, description, status } = body
    const bookingType = normaliseBookingType(body.booking_type)
    if (!name || !difficulty || !duration || !location || !price || (bookingType === 'scheduled_group' && !date)) return NextResponse.json({ error: 'Missing required hike fields' }, { status: 400 })
    const admin = createAdminClient()
    const { data: existing, error: existingError } = await admin.from('hikes').select('trail_condition_status, trail_condition_note').eq('id', id).single()
    if (existingError) return NextResponse.json({ error: 'Hike not found' }, { status: 404 })
    const hasStatus = body.trail_condition_status !== undefined
    if (hasStatus && !isTrailStatus(body.trail_condition_status)) return NextResponse.json({ error: 'Invalid trail condition status' }, { status: 400 })
    const statusChanged = hasStatus && body.trail_condition_status !== existing.trail_condition_status
    const noteChanged = body.trail_condition_note !== undefined && body.trail_condition_note !== existing.trail_condition_note
    const trailConditionPayload = hasStatus || body.trail_condition_note !== undefined ? {
      ...(hasStatus ? { trail_condition_status: body.trail_condition_status } : {}),
      ...(body.trail_condition_note !== undefined ? { trail_condition_note: typeof body.trail_condition_note === 'string' ? body.trail_condition_note.trim() || null : null } : {}),
      ...(statusChanged || noteChanged ? { trail_condition_updated_at: new Date().toISOString() } : {}),
    } : {}
    if (hasStatus && body.trail_condition_status !== 'open' && body.trail_condition_note === undefined && existing.trail_condition_note == null) return NextResponse.json({ error: 'Add a short operational note when a route is not open.' }, { status: 400 })
    const { data, error } = await admin.from('hikes').update({
      name, difficulty, date: date || null, duration, location, price,
      spots_total: spots_total == null ? 10 : Number(spots_total),
      spots_remaining: spots_remaining == null ? (spots_total == null ? 10 : Number(spots_total)) : Number(spots_remaining),
      description: description || null, status,
      ...practicalPayload({ ...body, booking_type: bookingType, rating_label: body.rating_label || 'Peak Axis rating' }),
      ...trailConditionPayload,
    }).eq('id', id).select()
    if (error) return NextResponse.json({ error: 'Failed to update hike' }, { status: 500 })
    if (!data || data.length === 0) return NextResponse.json({ error: 'Hike not found' }, { status: 404 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Unable to update hike' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, authorized } = await authorize()
    if (!authorized) return NextResponse.json({ error: user ? 'Forbidden' : 'Unauthorized' }, { status: user ? 403 : 401 })
    const admin = createAdminClient()
    const { error } = await admin.from('hikes').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Failed to delete hike' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unable to delete hike' }, { status: 500 })
  }
}

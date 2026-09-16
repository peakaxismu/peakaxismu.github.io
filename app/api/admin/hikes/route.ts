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

function practicalPayload(body: Record<string, unknown>) {
  const payload: Record<string, unknown> = {}
  for (const field of practicalFields) if (body[field] !== undefined) payload[field] = body[field]
  return payload
}

function normaliseBookingType(value: unknown) {
  return value === 'scheduled_group' || value === 'private' || value === 'on_demand' ? value : 'on_demand'
}

function normaliseTrailCondition(value: unknown) {
  return value === 'conditions_to_confirm' || value === 'temporarily_unsuitable' || value === 'closed' ? value : 'open'
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdminUser(user)) return NextResponse.json({ error: user ? 'Forbidden' : 'Unauthorized' }, { status: user ? 403 : 401 })

    const body = await request.json() as Record<string, unknown>
    const { name, difficulty, date, duration, location, price, spots_total, spots_remaining, description, status } = body
    const bookingType = normaliseBookingType(body.booking_type)
    const trailConditionStatus = normaliseTrailCondition(body.trail_condition_status)
    if (!name || !difficulty || !duration || !location || !price || (bookingType === 'scheduled_group' && !date)) {
      return NextResponse.json({ error: 'Missing required hike fields' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin.from('hikes').insert({
      name, difficulty, date: date || null, duration, location, price,
      spots_total: spots_total == null ? 10 : Number(spots_total),
      spots_remaining: spots_remaining == null ? (spots_total == null ? 10 : Number(spots_total)) : Number(spots_remaining),
      description: description || null,
      status: status || 'published',
      ...practicalPayload({ ...body, booking_type: bookingType, rating_label: body.rating_label || 'Peak Axis rating', trail_condition_status: trailConditionStatus }),
    }).select()

    if (error) {
      console.error('Admin hike creation failed:', error)
      return NextResponse.json({ error: 'Failed to create hike' }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    console.error('Admin hike POST failed:', err)
    return NextResponse.json({ error: 'Unable to create hike' }, { status: 500 })
  }
}

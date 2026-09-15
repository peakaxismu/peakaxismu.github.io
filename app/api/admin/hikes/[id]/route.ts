import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const practicalFields = [
  'distance_km','elevation_gain_m','starting_point','meeting_point','transport_options',
  'fitness_required','terrain','what_to_bring','included','excluded','safety_info',
  'weather_policy','age_requirements','min_participants','max_participants',
  'experience_types','region','booking_type','rating_label',
] as const

function practicalPayload(body: Record<string, unknown>) {
  const payload: Record<string, unknown> = {}
  for (const field of practicalFields) {
    if (body[field] !== undefined) payload[field] = body[field]
  }
  return payload
}

function normaliseBookingType(value: unknown) {
  return value === 'scheduled_group' || value === 'private' || value === 'on_demand' ? value : 'on_demand'
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json() as Record<string, unknown>
    const { name, difficulty, date, duration, location, price, spots_total, spots_remaining, description, status } = body
    const bookingType = normaliseBookingType(body.booking_type)
    if (!name || !difficulty || !duration || !location || !price || (bookingType === 'scheduled_group' && !date)) {
      return NextResponse.json({ error: 'Missing required hike fields' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin.from('hikes').update({
      name, difficulty, date: date || null, duration, location, price,
      spots_total: spots_total == null ? 10 : Number(spots_total),
      spots_remaining: spots_remaining == null ? (spots_total == null ? 10 : Number(spots_total)) : Number(spots_remaining),
      description: description || null,
      status,
      ...practicalPayload({ ...body, booking_type: bookingType, rating_label: body.rating_label || 'Peak Axis rating' }),
    }).eq('id', id).select()

    if (error) {
      console.error('Admin hike update failed:', error)
      return NextResponse.json({ error: 'Failed to update hike' }, { status: 500 })
    }
    if (!data || data.length === 0) return NextResponse.json({ error: 'Hike not found' }, { status: 404 })
    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    console.error('Admin hike PUT failed:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { error } = await admin.from('hikes').delete().eq('id', id)
    if (error) {
      console.error('Admin hike deletion failed:', error)
      return NextResponse.json({ error: 'Failed to delete hike' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}

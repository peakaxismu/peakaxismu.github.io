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

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json() as Record<string, unknown>
    const { name, difficulty, date, duration, location, price, spots_total, spots_remaining, description, status } = body
    if (!name || !difficulty || !date || !duration || !location || !price) {
      return NextResponse.json({ error: 'Missing required hike fields' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin.from('hikes').insert({
      name, difficulty, date, duration, location, price,
      spots_total: Number(spots_total) || 10,
      spots_remaining: Number(spots_remaining) || 10,
      description: description || null,
      status: status || 'published',
      ...practicalPayload(body),
    }).select()

    if (error) {
      console.error('Admin hike creation failed:', error)
      return NextResponse.json({ error: 'Failed to create hike' }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    console.error('Admin hike POST failed:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}

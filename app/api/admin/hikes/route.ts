import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, difficulty, date, duration, location, price, spots_total, spots_remaining, description, status } = body

    if (!name || !difficulty || !date || !duration || !location || !price) {
      return NextResponse.json({ error: 'Missing required hike fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('hikes')
      .insert({
        name,
        difficulty,
        date,
        duration,
        location,
        price,
        spots_total: Number(spots_total) || 10,
        spots_remaining: Number(spots_remaining) || 10,
        description: description || null,
        status: status || 'published',
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('hikes')
      .update({
        name,
        difficulty,
        date,
        duration,
        location,
        price,
        spots_total: Number(spots_total) || 10,
        spots_remaining: Number(spots_remaining) || 10,
        description: description || null,
        status,
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Admin hike update failed:', error)
      return NextResponse.json({ error: 'Failed to update hike' }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Hike not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    console.error('Admin hike PUT failed:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

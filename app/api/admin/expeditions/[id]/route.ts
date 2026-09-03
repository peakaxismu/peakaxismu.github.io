import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const {
      slug,
      name,
      destination,
      duration_days,
      difficulty,
      price_from,
      group_size_min,
      group_size_max,
      summit_elevation,
      next_departure,
      description,
      itinerary,
      included,
      not_included,
      packing_list,
      safety_notes,
      status,
    } = body

    const { data, error } = await supabase
      .from('expeditions')
      .update({
        slug,
        name,
        destination,
        duration_days: Number(duration_days) || 1,
        difficulty,
        price_from,
        group_size_min: Number(group_size_min) || 4,
        group_size_max: Number(group_size_max) || 12,
        summit_elevation: summit_elevation || null,
        next_departure: next_departure || null,
        description: description || null,
        itinerary: itinerary || [],
        included: included || [],
        not_included: not_included || [],
        packing_list: packing_list || [],
        safety_notes: safety_notes || null,
        status,
      })
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
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

    const { error } = await supabase.from('expeditions').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

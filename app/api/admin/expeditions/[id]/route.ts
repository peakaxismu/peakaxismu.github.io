import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAdmin()

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

    if (!name || !destination || !price_from) {
      return NextResponse.json({ error: 'Missing required expedition fields' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('expeditions')
      .update({
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
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
        itinerary: Array.isArray(itinerary) ? itinerary : [],
        included: Array.isArray(included) ? included : [],
        not_included: Array.isArray(not_included) ? not_included : [],
        packing_list: Array.isArray(packing_list) ? packing_list : [],
        safety_notes: safety_notes || null,
        status: status || 'draft',
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Admin expedition update failed:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: [data] })
  } catch (err: unknown) {
    console.error('Admin expedition update exception:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAdmin()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('expeditions').delete().eq('id', id)

    if (error) {
      console.error('Admin expedition delete failed:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('Admin expedition delete exception:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}

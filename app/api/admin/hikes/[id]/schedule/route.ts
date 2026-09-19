import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return isAdminUser(user) ? null : NextResponse.json({ error: user ? 'Forbidden' : 'Unauthorized' }, { status: user ? 403 : 401 })
}

const validConditions = ['open', 'conditions_to_confirm', 'temporarily_unsuitable', 'closed']
const validStatuses = ['draft', 'published', 'retired']
const validDate = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())
const validPrice = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 100

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin()
  if (denied) return denied
  try {
    const { id } = await params
    const body = await request.json() as unknown
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    const input = body as Record<string, unknown>
    const { date, price, spots_total, spots_remaining, status } = input
    if (status !== undefined && (typeof status !== 'string' || !['draft', 'published'].includes(status))) return NextResponse.json({ error: 'Invalid visibility status' }, { status: 400 })
    const date = body.date?.trim()
    if (!validDate(date)) return NextResponse.json({ error: 'Enter a valid scheduled date (YYYY-MM-DD)' }, { status: 400 })
    if (!validPrice(price)) return NextResponse.json({ error: 'Enter a valid price in MUR' }, { status: 400 })

    const admin = createAdminClient()
    const { data: source, error: sourceError } = await admin.from('hikes').select('*').eq('id', id).single()
    if (sourceError || !source) return NextResponse.json({ error: 'Source hike not found' }, { status: 404 })
    if (source.status !== 'published') return NextResponse.json({ error: 'Only published hikes can be scheduled' }, { status: 400 })
    if (source.booking_type === 'scheduled_group') return NextResponse.json({ error: 'A scheduled departure cannot be used as a route template' }, { status: 400 })

    const total = body.spots_total == null ? (source.max_participants || source.spots_total || 10) : Number(spots_total)
    const remaining = body.spots_remaining == null ? total : Number(spots_remaining)
    if (!Number.isInteger(total) || total < 1 || !Number.isInteger(remaining) || remaining < 0 || remaining > total) return NextResponse.json({ error: 'Enter valid group capacity values' }, { status: 400 })

    const clone = { ...source }
    delete clone.id
    delete clone.created_at
    delete clone.source_hike_id
    clone.name = `${source.name} — ${date}`
    clone.source_hike_id = source.id
    clone.booking_type = 'scheduled_group'
    clone.date = date
    clone.price = body.price.trim()
    clone.spots_total = total
    clone.spots_remaining = remaining
    clone.status = status || 'draft'
    clone.trail_condition_updated_at = null
    clone.trail_condition_note = null
    clone.trail_condition_status = 'open'

    const { data, error } = await admin.from('hikes').insert(clone).select().single()
    if (error) {
      console.error('Scheduled hike creation failed:', error)
      if (error.code === '23505') return NextResponse.json({ error: 'A departure for this route and date already exists' }, { status: 409 })
      return NextResponse.json({ error: 'Failed to schedule hike' }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Unable to schedule hike' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin()
  if (denied) return denied
  try {
    const { id } = await params
    const body = await request.json() as unknown
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    const input = body as Record<string, unknown>
    const allowed = ['date', 'price', 'spots_total', 'spots_remaining', 'status', 'trail_condition_status', 'trail_condition_note']
    const patch = Object.fromEntries(Object.entries(input).filter(([key]) => allowed.includes(key))) as Record<string, unknown>
    if (!Object.keys(patch).length) return NextResponse.json({ error: 'No supported changes supplied' }, { status: 400 })
    if (patch.date !== undefined && !validDate(patch.date)) return NextResponse.json({ error: 'Enter a valid scheduled date (YYYY-MM-DD)' }, { status: 400 })
    if (patch.price !== undefined && !validPrice(patch.price)) return NextResponse.json({ error: 'Enter a valid price in MUR' }, { status: 400 })
    if (patch.status !== undefined && !validStatuses.includes(String(patch.status))) return NextResponse.json({ error: 'Invalid visibility status' }, { status: 400 })
    if (patch.trail_condition_status !== undefined && !validConditions.includes(String(patch.trail_condition_status))) return NextResponse.json({ error: 'Invalid trail condition' }, { status: 400 })

    const admin = createAdminClient()
    const { data: current, error: currentError } = await admin.from('hikes').select('id,booking_type,source_hike_id,spots_total,spots_remaining').eq('id', id).single()
    if (currentError || !current) return NextResponse.json({ error: 'Scheduled departure not found' }, { status: 404 })
    if (current.booking_type !== 'scheduled_group' || !current.source_hike_id) return NextResponse.json({ error: 'Only scheduled departure instances can be edited here' }, { status: 400 })

    const total = patch.spots_total === undefined ? Number(current.spots_total || 0) : Number(patch.spots_total)
    const remaining = patch.spots_remaining === undefined ? Number(current.spots_remaining || 0) : Number(patch.spots_remaining)
    if (!Number.isInteger(total) || total < 1 || !Number.isInteger(remaining) || remaining < 0 || remaining > total) return NextResponse.json({ error: 'Enter valid group capacity values' }, { status: 400 })
    patch.spots_total = total
    patch.spots_remaining = remaining
    if (patch.price !== undefined) patch.price = String(patch.price).trim()
    if (patch.trail_condition_status !== undefined) patch.trail_condition_updated_at = new Date().toISOString()

    const { data, error } = await admin.from('hikes').update(patch).eq('id', id).select().single()
    if (error) {
      console.error('Scheduled hike update failed:', error)
      if (error.code === '23505') return NextResponse.json({ error: 'A departure for this route and date already exists' }, { status: 409 })
      return NextResponse.json({ error: 'Failed to update scheduled hike' }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Unable to update scheduled hike' }, { status: 500 })
  }
}

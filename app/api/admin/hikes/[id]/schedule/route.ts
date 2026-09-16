import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdminUser(user)) return NextResponse.json({ error: user ? 'Forbidden' : 'Unauthorized' }, { status: user ? 403 : 401 })

    const { id } = await params
    const body = await request.json() as { date?: string; spots_total?: number; spots_remaining?: number; status?: 'draft' | 'published' }
    const date = body.date?.trim()
    if (!date) return NextResponse.json({ error: 'A scheduled date is required' }, { status: 400 })

    const admin = createAdminClient()
    const { data: source, error: sourceError } = await admin.from('hikes').select('*').eq('id', id).single()
    if (sourceError || !source) return NextResponse.json({ error: 'Source hike not found' }, { status: 404 })

    const total = body.spots_total == null ? (source.max_participants || source.spots_total || 10) : Number(body.spots_total)
    const remaining = body.spots_remaining == null ? total : Number(body.spots_remaining)
    if (!Number.isInteger(total) || total < 1 || !Number.isInteger(remaining) || remaining < 0 || remaining > total) {
      return NextResponse.json({ error: 'Enter valid group capacity values' }, { status: 400 })
    }

    const scheduledName = `${source.name} — ${date}`
    const clone = { ...source }
    delete clone.id
    delete clone.created_at
    delete clone.source_hike_id
    clone.name = scheduledName
    clone.source_hike_id = source.id
    clone.booking_type = 'scheduled_group'
    clone.date = date
    clone.spots_total = total
    clone.spots_remaining = remaining
    clone.status = body.status || 'draft'
    clone.trail_condition_updated_at = null
    clone.trail_condition_note = null
    clone.trail_condition_status = 'open'

    const { data, error } = await admin.from('hikes').insert(clone).select().single()
    if (error) {
      console.error('Scheduled hike creation failed:', error)
      return NextResponse.json({ error: 'Failed to schedule hike' }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Unable to schedule hike' }, { status: 500 })
  }
}

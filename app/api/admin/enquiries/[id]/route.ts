import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

const STATUSES = ['new', 'contacted', 'quoted', 'awaiting_reply', 'confirmed', 'completed', 'closed'] as const
const NEXT_ACTIONS = ['reply', 'prepare_quote', 'follow_up', 'await_customer', 'confirm_booking', 'complete'] as const
const PRIORITIES = ['low', 'normal', 'high'] as const

type Status = typeof STATUSES[number]
type NextAction = typeof NEXT_ACTIONS[number]
type Priority = typeof PRIORITIES[number]

const defaultNextAction = (status: Status): NextAction | null => {
  if (status === 'new') return 'reply'
  if (status === 'contacted' || status === 'quoted') return 'await_customer'
  if (status === 'awaiting_reply') return 'follow_up'
  if (status === 'confirmed') return 'complete'
  return null
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const status = body.status as Status | undefined
    const next_action = body.next_action as NextAction | null | undefined
    const next_follow_up_at = body.next_follow_up_at as string | null | undefined
    const priority = body.priority as Priority | undefined
    const quote_amount = body.quote_amount as number | string | null | undefined
    const lost_reason = typeof body.lost_reason === 'string' ? body.lost_reason.trim() : body.lost_reason
    const note = typeof body.note === 'string' ? body.note.trim() : ''

    if (status !== undefined && !STATUSES.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    if (next_action !== undefined && next_action !== null && !NEXT_ACTIONS.includes(next_action)) return NextResponse.json({ error: 'Invalid next action' }, { status: 400 })
    if (priority !== undefined && !PRIORITIES.includes(priority)) return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
    if (quote_amount !== undefined && quote_amount !== null && (Number.isNaN(Number(quote_amount)) || Number(quote_amount) < 0)) return NextResponse.json({ error: 'Invalid quote amount' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdminUser(user)) return NextResponse.json({ error: 'Forbidden' }, { status: user ? 403 : 401 })

    const admin = createAdminClient()
    const { data: current, error: currentError } = await admin.from('enquiries').select('id,status,next_action,priority,quote_amount,lost_reason,next_follow_up_at').eq('id', id).single()
    if (currentError || !current) return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 })

    const update: Record<string, unknown> = {}
    if (status !== undefined) update.status = status
    if (next_action !== undefined) update.next_action = next_action
    else if (status !== undefined && status !== current.status) update.next_action = defaultNextAction(status)
    if (next_follow_up_at !== undefined) update.next_follow_up_at = next_follow_up_at
    if (priority !== undefined) update.priority = priority
    if (quote_amount !== undefined) update.quote_amount = quote_amount === null || quote_amount === '' ? null : Number(quote_amount)
    if (lost_reason !== undefined) update.lost_reason = lost_reason || null

    let data = current
    if (Object.keys(update).length) {
      const result = await admin.from('enquiries').update(update).eq('id', id).select().single()
      if (result.error) return NextResponse.json({ error: 'Failed to update enquiry' }, { status: 500 })
      data = result.data
    }

    if (status !== undefined && status !== current.status) {
      const { error } = await admin.from('enquiry_activities').insert({ enquiry_id: id, type: 'status_change', body: `Status changed from ${current.status} to ${status}`, metadata: { from: current.status, to: status, user_id: user?.id ?? null }, created_by: user?.id ?? null })
      if (error) return NextResponse.json({ error: 'Failed to record status change' }, { status: 500 })
    }
    if (note) {
      const { error } = await admin.from('enquiry_activities').insert({ enquiry_id: id, type: 'note', body: note, metadata: { user_id: user?.id ?? null }, created_by: user?.id ?? null })
      if (error) return NextResponse.json({ error: 'Failed to save note' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    console.error('Admin enquiry PATCH failed:', err)
    return NextResponse.json({ error: 'Unable to update enquiry' }, { status: 500 })
  }
}

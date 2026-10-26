import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const

async function authorize() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { user, allowed: isAdminUser(user) }
}

export async function GET() {
  try {
    const { user, allowed } = await authorize()
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: user ? 403 : 401 })
    const admin = createAdminClient()
    const { data, error } = await admin.from('crm_tasks').select('id,title,description,customer_id,enquiry_id,booking_id,due_at,priority,status,source,created_at,completed_at').order('due_at', { ascending: true, nullsFirst: false })
    if (error) return NextResponse.json({ error: 'Unable to load tasks' }, { status: 500 })
    return NextResponse.json({ data: data ?? [] })
  } catch (error) {
    console.error('Admin tasks GET failed:', error)
    return NextResponse.json({ error: 'Unable to load tasks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { user, allowed } = await authorize()
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: user ? 403 : 401 })
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    const input = body as Record<string, unknown>
    const title = typeof input.title === 'string' ? input.title.trim() : ''
    const description = typeof input.description === 'string' ? input.description.trim() : ''
    const customer_id = typeof input.customer_id === 'string' ? input.customer_id : ''
    const priority = typeof input.priority === 'string' ? input.priority : 'normal'
    const dueRaw = typeof input.due_at === 'string' ? input.due_at : ''
    const due_at = dueRaw ? new Date(dueRaw) : null

    if (!title || title.length > 240) return NextResponse.json({ error: 'Enter a task title up to 240 characters' }, { status: 400 })
    if (!UUID.test(customer_id)) return NextResponse.json({ error: 'Choose a customer to link to this task' }, { status: 400 })
    if (!PRIORITIES.includes(priority as typeof PRIORITIES[number])) return NextResponse.json({ error: 'Invalid task priority' }, { status: 400 })
    if (description.length > 10000) return NextResponse.json({ error: 'Task description is too long' }, { status: 400 })
    if (due_at && !Number.isFinite(due_at.getTime())) return NextResponse.json({ error: 'Invalid due date' }, { status: 400 })

    const admin = createAdminClient()
    const { data: customer } = await admin.from('customers').select('id').eq('id', customer_id).maybeSingle()
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    const { data, error } = await admin.from('crm_tasks').insert({
      title, description: description || null, customer_id, priority,
      due_at: due_at?.toISOString() ?? null, source: 'manual', created_by: user?.id ?? null,
    }).select('id,title,description,customer_id,enquiry_id,booking_id,due_at,priority,status,source,created_at,completed_at').single()
    if (error || !data) return NextResponse.json({ error: 'Unable to create task' }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Admin tasks POST failed:', error)
    return NextResponse.json({ error: 'Unable to create task' }, { status: 500 })
  }
}

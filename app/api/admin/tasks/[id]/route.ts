import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'] as const

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdminUser(user)) return NextResponse.json({ error: 'Forbidden' }, { status: user ? 403 : 401 })
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    const input = body as Record<string, unknown>
    if (typeof input.status !== 'string' || !STATUSES.includes(input.status as typeof STATUSES[number])) return NextResponse.json({ error: 'Invalid task status' }, { status: 400 })

    const admin = createAdminClient()
    const { data, error } = await admin.from('crm_tasks').update({ status: input.status }).eq('id', id).select('id,title,description,customer_id,due_at,priority,status,source,created_at,completed_at').maybeSingle()
    if (error) return NextResponse.json({ error: 'Unable to update task' }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Admin task PATCH failed:', error)
    return NextResponse.json({ error: 'Unable to update task' }, { status: 500 })
  }
}

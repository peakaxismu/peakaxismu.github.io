import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function authorized() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return Boolean(user)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const body = await request.json()
    const { name, location, duration, price, status, short_line } = body
    if (!name || !location || !duration || !price) return NextResponse.json({ error: 'Missing required waterfall fields' }, { status: 400 })

    const admin = createAdminClient()
    const { data, error } = await admin.from('waterfalls').update({ name, location, duration, price, status, short_line }).eq('id', id).select()
    if (error) return NextResponse.json({ error: 'Failed to update waterfall' }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const admin = createAdminClient()
    const { error } = await admin.from('waterfalls').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Failed to delete waterfall' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

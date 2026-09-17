import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdminUser(user)) return NextResponse.json({ error: 'Forbidden' }, { status: user ? 403 : 401 })
    const admin = createAdminClient()
    const { data, error } = await admin.from('enquiry_activities').select('id,type,body,metadata,created_at,created_by').eq('enquiry_id', id).order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: 'Failed to load activity' }, { status: 500 })
    return NextResponse.json({ data: data ?? [] })
  } catch (err) {
    console.error('Admin enquiry activities GET failed:', err)
    return NextResponse.json({ error: 'Unable to load activity' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const type = typeof body.type === 'string' ? body.type : 'note'
    const text = typeof body.body === 'string' ? body.body.trim() : ''
    if (!text) return NextResponse.json({ error: 'Activity text is required' }, { status: 400 })
    if (!['note', 'follow_up', 'quote'].includes(type)) return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdminUser(user)) return NextResponse.json({ error: 'Forbidden' }, { status: user ? 403 : 401 })
    const admin = createAdminClient()
    const { data, error } = await admin.from('enquiry_activities').insert({ enquiry_id: id, type, body: text, metadata: body.metadata ?? {}, created_by: user?.id ?? null }).select().single()
    if (error) return NextResponse.json({ error: 'Failed to save activity' }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('Admin enquiry activities POST failed:', err)
    return NextResponse.json({ error: 'Unable to save activity' }, { status: 500 })
  }
}

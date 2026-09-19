import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

async function authorized() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return isAdminUser(user)
}

export async function GET() {
  try {
    if (!(await authorized())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const admin = createAdminClient()
    const { data, error } = await admin.from('waterfalls').select('*').order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: 'Failed to load waterfalls' }, { status: 500 })
    return NextResponse.json({ success: true, data: data || [] })
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function POST(request: Request) {
  try {
    if (!(await authorized())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const body = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    const { name, location, duration, status, short_line } = body as Record<string, unknown>
    if ([name, location, duration].some((v) => typeof v !== 'string' || !v.trim())) return NextResponse.json({ error: 'Missing required waterfall fields' }, { status: 400 })
    if (status && !['draft', 'published'].includes(status)) return NextResponse.json({ error: 'Status must be draft or published' }, { status: 400 })
    const admin = createAdminClient()
    const { data, error } = await admin.from('waterfalls').insert({ name, location, duration, status: status || 'published', short_line: short_line || '' }).select()
    if (error) return NextResponse.json({ error: 'Failed to create waterfall' }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

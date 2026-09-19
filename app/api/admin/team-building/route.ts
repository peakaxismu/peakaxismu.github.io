import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdminUser(user)) return NextResponse.json({ error: user ? 'Forbidden' : 'Unauthorized' }, { status: user ? 403 : 401 })

    const body = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    const { name, type, description, status } = body as Record<string, unknown>
    if ([name, type, description].some((v) => typeof v !== 'string' || !v.trim())) return NextResponse.json({ error: 'Missing required package fields' }, { status: 400 })

    const admin = createAdminClient()
    const { data, error } = await admin.from('team_building_packages').insert({ name, type, description, status: status || 'published' }).select()
    if (error) return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}

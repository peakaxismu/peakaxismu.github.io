import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data, error } = await admin.from('waterfalls').select('*').order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: 'Failed to load waterfalls' }, { status: 500 })
    return NextResponse.json({ success: true, data: data || [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, location, duration, price, status, short_line } = body
    if (!name || !location || !duration || !price) {
      return NextResponse.json({ error: 'Missing required waterfall fields' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin.from('waterfalls').insert({
      name, location, duration, price, status: status || 'ON DEMAND', short_line: short_line || null,
    }).select()
    if (error) return NextResponse.json({ error: 'Failed to create waterfall' }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

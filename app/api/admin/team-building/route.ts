import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, description, status } = body

    if (!name || !type || !description) {
      return NextResponse.json({ error: 'Missing required package fields' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('team_building_packages')
      .insert({
        name,
        type,
        description,
        status: status || 'published',
      })
      .select()

    if (error) {
      console.error('Admin team-building creation failed:', error)
      return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    console.error('Admin team-building POST failed:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}

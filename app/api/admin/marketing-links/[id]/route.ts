import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdminUser(user)) return NextResponse.json({ error: 'Forbidden' }, { status: user ? 403 : 401 })

    const { id } = await params
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body) || typeof (body as Record<string, unknown>).is_active !== 'boolean') {
      return NextResponse.json({ error: 'Provide an active state.' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin.from('marketing_links')
      .update({ is_active: (body as { is_active: boolean }).is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) return NextResponse.json({ error: 'Unable to update marketing link.' }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Marketing link not found.' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Marketing link PATCH failed:', error)
    return NextResponse.json({ error: 'Unable to update marketing link.' }, { status: 500 })
  }
}

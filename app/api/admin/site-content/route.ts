import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function authorized() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return Boolean(user)
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = createAdminClient()
  const [{ data: settings, error: settingsError }, { data: testimonials, error: testimonialsError }] = await Promise.all([
    admin.from('site_settings').select('*').eq('id', true).maybeSingle(),
    admin.from('testimonials').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
  ])
  if (settingsError || testimonialsError) return NextResponse.json({ error: 'Failed to load site content' }, { status: 500 })
  return NextResponse.json({ success: true, settings, testimonials: testimonials || [] })
}

export async function PUT(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { instagram_handle, instagram_url } = body
  if (!instagram_handle || !instagram_url) return NextResponse.json({ error: 'Instagram handle and URL are required' }, { status: 400 })
  const admin = createAdminClient()
  const { data, error } = await admin.from('site_settings').upsert({ id: true, instagram_handle, instagram_url, updated_at: new Date().toISOString() }).select().single()
  if (error) return NextResponse.json({ error: 'Failed to update site settings' }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

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
  const [{ data: settings, error: settingsError }, { data: homepage, error: homepageError }, { data: testimonials, error: testimonialsError }, { data: instagram_posts, error: instagramError }] = await Promise.all([
    admin.from('site_settings').select('*').eq('id', true).maybeSingle(),
    admin.from('homepage_content').select('*').eq('id', true).maybeSingle(),
    admin.from('testimonials').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
    admin.from('instagram_posts').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
  ])
  if (settingsError || homepageError || testimonialsError || instagramError) return NextResponse.json({ error: 'Failed to load site content' }, { status: 500 })
  return NextResponse.json({ success: true, settings, homepage, testimonials: testimonials || [], instagram_posts: instagram_posts || [] })
}

export async function PUT(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { instagram_handle, instagram_url, homepage } = body
  const admin = createAdminClient()
  if (instagram_handle !== undefined || instagram_url !== undefined) {
    if (!instagram_handle || !instagram_url) return NextResponse.json({ error: 'Instagram handle and URL are required' }, { status: 400 })
    const { error } = await admin.from('site_settings').upsert({ id: true, instagram_handle, instagram_url, updated_at: new Date().toISOString() })
    if (error) return NextResponse.json({ error: 'Failed to update Instagram settings' }, { status: 500 })
  }
  if (homepage) {
    const clean = Object.fromEntries(Object.entries(homepage).filter(([key, value]) => key !== 'id' && key !== 'updated_at' && typeof value === 'string'))
    const { error } = await admin.from('homepage_content').upsert({ id: true, ...clean, updated_at: new Date().toISOString() })
    if (error) return NextResponse.json({ error: 'Failed to update homepage content' }, { status: 500 })
  }
  const [{ data: settings }, { data: updatedHomepage }] = await Promise.all([
    admin.from('site_settings').select('*').eq('id', true).maybeSingle(),
    admin.from('homepage_content').select('*').eq('id', true).maybeSingle(),
  ])
  return NextResponse.json({ success: true, settings, homepage: updatedHomepage })
}

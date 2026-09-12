import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function isAuthorized() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return Boolean(user)
}

export async function GET() {
  if (!(await isAuthorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = createAdminClient()
  const { data, error } = await admin.from('journal_posts').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Failed to load journal posts' }, { status: 500 })
  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(request: Request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { title, category, summary, content, status } = body
  if (!title || !category || !summary) return NextResponse.json({ error: 'Title, category and summary are required' }, { status: 400 })
  const admin = createAdminClient()
  const { data, error } = await admin.from('journal_posts').insert({ title, category, summary, content: content || null, status: status || 'published' }).select()
  if (error) return NextResponse.json({ error: 'Failed to create journal post' }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

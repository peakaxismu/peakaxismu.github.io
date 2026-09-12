import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function isAuthorized() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return Boolean(user)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  const { title, category, summary, content, status } = body
  if (!title || !category || !summary) return NextResponse.json({ error: 'Title, category and summary are required' }, { status: 400 })
  const admin = createAdminClient()
  const { data, error } = await admin.from('journal_posts').update({ title, category, summary, content: content || null, status: status || 'published', updated_at: new Date().toISOString() }).eq('id', id).select()
  if (error) return NextResponse.json({ error: 'Failed to update journal post' }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const admin = createAdminClient()
  const { error } = await admin.from('journal_posts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete journal post' }, { status: 500 })
  return NextResponse.json({ success: true })
}

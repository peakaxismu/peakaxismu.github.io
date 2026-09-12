import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function authorized() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); return Boolean(user) }

export async function GET() { try { if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const admin = createAdminClient(); const { data, error } = await admin.from('journal_posts').select('*').order('created_at', { ascending: false }); if (error) return NextResponse.json({ error: 'Failed to load journal posts' }, { status: 500 }); return NextResponse.json({ success: true, data: data || [] }) } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) } }

export async function POST(request: Request) { try { if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const body = await request.json(); const { title, category, summary, content, status } = body; if (!title || !category || !summary || !content) return NextResponse.json({ error: 'Title, category and article content are required' }, { status: 400 }); if (status && !['draft', 'published'].includes(status)) return NextResponse.json({ error: 'Status must be draft or published' }, { status: 400 }); const admin = createAdminClient(); const { data, error } = await admin.from('journal_posts').insert({ title, category, summary, content, status: status || 'published' }).select(); if (error) return NextResponse.json({ error: 'Failed to create journal post' }, { status: 500 }); return NextResponse.json({ success: true, data }) } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

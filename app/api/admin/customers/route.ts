import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdminUser(user)) return NextResponse.json({ error: 'Forbidden' }, { status: user ? 403 : 401 })
    const admin = createAdminClient()
    const { data, error } = await admin.from('customers').select('id,full_name,email,phone,created_at,updated_at').order('full_name')
    if (error) return NextResponse.json({ error: 'Unable to load customers' }, { status: 500 })
    return NextResponse.json({ data: data ?? [] })
  } catch (error) {
    console.error('Admin customers GET failed:', error)
    return NextResponse.json({ error: 'Unable to load customers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdminUser(user)) return NextResponse.json({ error: 'Forbidden' }, { status: user ? 403 : 401 })
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    const input = body as Record<string, unknown>
    const full_name = typeof input.full_name === 'string' ? input.full_name.trim() : ''
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
    const phone = typeof input.phone === 'string' ? input.phone.trim() : ''
    const notes = typeof input.notes === 'string' ? input.notes.trim() : ''
    if (!full_name || full_name.length > 160) return NextResponse.json({ error: 'Enter a name up to 160 characters' }, { status: 400 })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
    if (phone.length > 60 || notes.length > 10000) return NextResponse.json({ error: 'Phone or notes are too long' }, { status: 400 })
    const admin = createAdminClient()
    const { data, error } = await admin.from('customers').insert({ full_name, email, phone: phone || null, notes: notes || null }).select('id,full_name,email,phone,notes,created_at,updated_at').single()
    if (error?.code === '23505') return NextResponse.json({ error: 'A customer with this email already exists. Open that customer record instead.' }, { status: 409 })
    if (error || !data) return NextResponse.json({ error: 'Unable to create customer' }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Admin customers POST failed:', error)
    return NextResponse.json({ error: 'Unable to create customer' }, { status: 500 })
  }
}

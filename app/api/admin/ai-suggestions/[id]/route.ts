import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdminUser(user)) return NextResponse.json({ error: 'Forbidden' }, { status: user ? 403 : 401 })
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    const decision = (body as Record<string, unknown>).status
    if (decision !== 'approved' && decision !== 'rejected') return NextResponse.json({ error: 'Choose approve or reject' }, { status: 400 })

    const admin = createAdminClient()
    const { data, error } = await admin.from('crm_ai_suggestions')
      .update({ status: decision, reviewed_by: user?.id ?? null, reviewed_at: new Date().toISOString() })
      .eq('id', id).eq('status', 'pending')
      .select('id,status,reviewed_by,reviewed_at').maybeSingle()

    if (error) return NextResponse.json({ error: 'Unable to record review decision' }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'This suggestion is no longer pending. Refresh the page.' }, { status: 409 })
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Admin AI suggestion review failed:', error)
    return NextResponse.json({ error: 'Unable to review suggestion' }, { status: 500 })
  }
}

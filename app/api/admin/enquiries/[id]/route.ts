import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

const STATUSES = ['new', 'contacted', 'quoted', 'confirmed', 'completed', 'closed'] as const

type Status = typeof STATUSES[number]

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!STATUSES.includes(status as Status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!isAdminUser(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: user ? 403 : 401 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('enquiries')
      .update({ status })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Admin enquiry update failed:', error)
      return NextResponse.json({ error: 'Failed to update enquiry' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    console.error('Admin enquiry PATCH failed:', err)
    return NextResponse.json({ error: 'Unable to update enquiry' }, { status: 500 })
  }
}

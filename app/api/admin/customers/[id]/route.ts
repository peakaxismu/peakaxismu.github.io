import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!UUID.test(id)) return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdminUser(user)) return NextResponse.json({ error: 'Forbidden' }, { status: user ? 403 : 401 })

    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    const input = body as Record<string, unknown>
    const update: Record<string, string | null> = {}

    if (Object.hasOwn(input, 'full_name')) {
      if (typeof input.full_name !== 'string' || !input.full_name.trim() || input.full_name.trim().length > 160) {
        return NextResponse.json({ error: 'Enter a customer name up to 160 characters' }, { status: 400 })
      }
      update.full_name = input.full_name.trim()
    }

    if (Object.hasOwn(input, 'email')) {
      const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email) || email.length > 254) {
        return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
      }
      update.email = email
    }

    if (Object.hasOwn(input, 'phone')) {
      if (input.phone !== null && (typeof input.phone !== 'string' || input.phone.trim().length > 60)) {
        return NextResponse.json({ error: 'Phone must be 60 characters or fewer' }, { status: 400 })
      }
      update.phone = typeof input.phone === 'string' && input.phone.trim() ? input.phone.trim() : null
    }

    if (Object.hasOwn(input, 'notes')) {
      if (input.notes !== null && (typeof input.notes !== 'string' || input.notes.length > 10000)) {
        return NextResponse.json({ error: 'Notes must be 10,000 characters or fewer' }, { status: 400 })
      }
      update.notes = typeof input.notes === 'string' && input.notes.trim() ? input.notes.trim() : null
    }

    if (!Object.keys(update).length) return NextResponse.json({ error: 'No customer changes supplied' }, { status: 400 })

    const admin = createAdminClient()
    const { data, error } = await admin.from('customers')
      .update(update)
      .eq('id', id)
      .select('id,full_name,email,phone,notes,created_at,updated_at')
      .maybeSingle()

    if (error?.code === '23505') {
      return NextResponse.json({ error: 'A customer with this email already exists. Use that existing customer record instead.' }, { status: 409 })
    }
    if (error) {
      console.error('Admin customer PATCH failed:', error)
      return NextResponse.json({ error: 'Unable to update customer' }, { status: 500 })
    }
    if (!data) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Admin customer PATCH failed:', error)
    return NextResponse.json({ error: 'Unable to update customer' }, { status: 500 })
  }
}

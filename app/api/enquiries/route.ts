import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, interest_type, reference_id, preferred_date, group_size, message } = body

    if (!name || !email || !interest_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('enquiries')
      .insert({
        name,
        email,
        phone: phone || null,
        interest_type,
        reference_id: reference_id || null,
        preferred_date: preferred_date || null,
        group_size: group_size || null,
        message: message || null,
        status: 'new',
      })
      .select()

    if (error) {
      console.error('Supabase enquiry error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

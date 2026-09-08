import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, interest_type, reference_id, preferred_date, group_size, message } = body

    if (!name || !email || !interest_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const cleanName = String(name).trim().slice(0, 100)
    const cleanEmail = String(email).trim().toLowerCase().slice(0, 100)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    const validInterestTypes = ['hike', 'private_hike', 'expedition', 'team', 'activity']
    if (!validInterestTypes.includes(interest_type)) {
      return NextResponse.json({ error: 'Invalid interest type selected' }, { status: 400 })
    }

    const cleanPhone = phone ? String(phone).trim().slice(0, 30) : null
    const cleanRef = reference_id ? String(reference_id).trim().slice(0, 100) : null
    const cleanDate = preferred_date ? String(preferred_date).trim().slice(0, 50) : null
    const cleanGroupSize = group_size ? String(group_size).trim().slice(0, 30) : null
    const cleanMessage = message ? String(message).trim().slice(0, 2000) : null

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('enquiries')
      .insert({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        interest_type,
        reference_id: cleanRef,
        preferred_date: cleanDate,
        group_size: cleanGroupSize,
        message: cleanMessage,
        status: 'new',
      })
      .select('id, submitted_at')

    if (error) {
      console.error('Supabase enquiry error:', error)
      return NextResponse.json({ error: 'Failed to submit enquiry. Please try again later.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}

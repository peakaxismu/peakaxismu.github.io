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

    // Scheduled-hike enquiries must reference an actual published scheduled route.
    // This prevents stale/forged form submissions from creating misleading bookings.
    if (interest_type === 'hike' && cleanRef) {
      const { data: hike, error: hikeLookupError } = await supabase
        .from('hikes')
        .select('id')
        .eq('name', cleanRef)
        .eq('status', 'published')
        .eq('booking_type', 'scheduled_group')
        .maybeSingle()

      if (hikeLookupError) {
        console.error('Supabase hike validation error:', hikeLookupError)
        return NextResponse.json({ error: 'Unable to validate the selected hike. Please try again.' }, { status: 500 })
      }

      if (!hike) {
        return NextResponse.json({ error: 'The selected scheduled hike is no longer available. Please choose another option.' }, { status: 400 })
      }
    }

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

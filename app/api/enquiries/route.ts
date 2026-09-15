import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_INTEREST_TYPES = ['hike', 'private_hike', 'expedition', 'team', 'activity'] as const

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, interest_type, reference_id, preferred_date, group_size, message } = body

    if (typeof name !== 'string' || typeof email !== 'string' || typeof interest_type !== 'string') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const cleanName = name.trim().slice(0, 100)
    const cleanEmail = email.trim().toLowerCase().slice(0, 100)

    if (!cleanName) {
      return NextResponse.json({ error: 'Please enter your name' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    if (!VALID_INTEREST_TYPES.includes(interest_type as typeof VALID_INTEREST_TYPES[number])) {
      return NextResponse.json({ error: 'Invalid interest type selected' }, { status: 400 })
    }

    const cleanPhone = typeof phone === 'string' ? phone.trim().slice(0, 30) : null
    const cleanRef = typeof reference_id === 'string' ? reference_id.trim().slice(0, 100) : null
    const cleanDate = typeof preferred_date === 'string' ? preferred_date.trim().slice(0, 50) : null
    const cleanGroupSize = typeof group_size === 'string' ? group_size.trim().slice(0, 30) : null
    const cleanMessage = typeof message === 'string' ? message.trim().slice(0, 2000) : null

    const supabase = await createClient()

    // Scheduled-hike enquiries must identify an actual published scheduled route.
    // This prevents stale/forged requests from creating misleading booking leads.
    if (interest_type === 'hike') {
      if (!cleanRef) {
        return NextResponse.json({ error: 'Please select a scheduled hike before submitting.' }, { status: 400 })
      }

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
  } catch (err) {
    console.error('Enquiry request failed:', err)
    return NextResponse.json({ error: 'Invalid request. Please check your details and try again.' }, { status: 400 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_INTEREST_TYPES = ['hike', 'private_hike', 'expedition', 'team', 'activity'] as const
const MAX_REQUEST_BYTES = 12_000
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase()
    if (contentType !== 'application/json') {
      return NextResponse.json({ error: 'Request must use JSON.' }, { status: 415 })
    }

    const contentLength = request.headers.get('content-length')
    if (contentLength) {
      const parsedContentLength = Number(contentLength)
      if (!Number.isSafeInteger(parsedContentLength) || parsedContentLength < 0 || parsedContentLength > MAX_REQUEST_BYTES) {
        return NextResponse.json({ error: 'Request body is too large.' }, { status: 413 })
      }
    }

    const body = await request.json()

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

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
    const cleanGroupSize = typeof group_size === 'string' ? group_size.trim() : null
    const cleanMessage = typeof message === 'string' ? message.trim().slice(0, 2000) : null

    if (cleanGroupSize !== null && !/^(?:[1-9]|10|11)$/.test(cleanGroupSize)) {
      return NextResponse.json({ error: 'Please select a valid group size.' }, { status: 400 })
    }

    if (cleanDate !== null && !DATE_PATTERN.test(cleanDate)) {
      return NextResponse.json({ error: 'Please select a valid preferred date.' }, { status: 400 })
    }

    const supabase = await createClient()

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

    const { error } = await supabase
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

    if (error) {
      console.error('Supabase enquiry error:', error)
      return NextResponse.json({ error: 'Failed to submit enquiry. Please try again later.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Enquiry request failed:', err)
    return NextResponse.json({ error: 'Invalid request. Please check your details and try again.' }, { status: 400 })
  }
}

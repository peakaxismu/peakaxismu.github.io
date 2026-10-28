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

    const { name, email, phone, interest_type, reference_id, preferred_date, group_size, message, website, attribution } = body

    if (typeof website === 'string' && website.trim()) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
    }

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

    // Attribution is optional and deliberately limited to campaign labels,
    // a referrer hostname, a path (never a full URL), and a generated link code.
    const attributionInput = attribution && typeof attribution === 'object' && !Array.isArray(attribution)
      ? attribution as Record<string, unknown>
      : {}
    const attributionText = (key: string, maxLength: number) =>
      typeof attributionInput[key] === 'string' ? (attributionInput[key] as string).trim().slice(0, maxLength) || null : null
    const attributionSource = attributionText('source', 80)
    const attributionMedium = attributionText('medium', 80)
    const attributionCampaign = attributionText('campaign', 120)
    const attributionContent = attributionText('content', 120)
    const rawReferrerHost = attributionText('referrer_host', 253)?.toLowerCase() ?? null
    const attributionReferrerHost = rawReferrerHost && /^[a-z0-9.-]{1,253}$/.test(rawReferrerHost) && !rawReferrerHost.startsWith('.') && !rawReferrerHost.endsWith('.') ? rawReferrerHost : null
    const rawLandingPath = attributionText('landing_path', 200)
    const attributionLandingPath = rawLandingPath && rawLandingPath.startsWith('/') && !rawLandingPath.startsWith('//') && !rawLandingPath.includes(String.fromCharCode(92)) ? rawLandingPath.split(/[?#]/, 1)[0].slice(0, 200) : null
    const rawTrackingCode = attributionText('tracking_link_code', 16)?.toLowerCase() ?? null
    const trackingLinkCode = rawTrackingCode && /^[a-z0-9]{8,16}$/.test(rawTrackingCode) ? rawTrackingCode : null

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
        .from('scheduled_hikes')
        .select('id,date,spots_remaining,status')
        .eq('id', cleanRef)
        .eq('status', 'published')
        .maybeSingle()

      if (hikeLookupError) {
        console.error('Supabase hike validation error:', hikeLookupError)
        return NextResponse.json({ error: 'Unable to validate the selected hike. Please try again.' }, { status: 500 })
      }

      if (!hike || new Date(`${hike.date}T23:59:59Z`) < new Date() || hike.spots_remaining <= 0) {
        return NextResponse.json({ error: 'The selected scheduled hike is no longer available. Please choose another option.' }, { status: 400 })
      }
    }

    const enquiryId = crypto.randomUUID()
    const scheduledHikeId = interest_type === 'hike' ? cleanRef : null

    const { error } = await supabase
      .from('enquiries')
      .insert({
        id: enquiryId,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        interest_type,
        reference_id: cleanRef,
        scheduled_hike_id: scheduledHikeId,
        preferred_date: cleanDate,
        group_size: cleanGroupSize,
        message: cleanMessage,
        attribution_source: attributionSource,
        attribution_medium: attributionMedium,
        attribution_campaign: attributionCampaign,
        attribution_content: attributionContent,
        attribution_referrer_host: attributionReferrerHost,
        attribution_landing_path: attributionLandingPath,
        tracking_link_code: trackingLinkCode,
        status: 'new',
      })

    if (error) {
      console.error('Supabase enquiry error:', error)
      return NextResponse.json({ error: 'Failed to submit enquiry. Please try again later.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: { id: enquiryId } })
  } catch (err) {
    console.error('Enquiry request failed:', err)
    return NextResponse.json({ error: 'Invalid request. Please check your details and try again.' }, { status: 400 })
  }
}

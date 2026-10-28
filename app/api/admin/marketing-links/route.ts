import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'

const PLATFORMS = ['instagram', 'tiktok', 'facebook', 'youtube', 'whatsapp', 'email', 'other'] as const
type Platform = typeof PLATFORMS[number]

async function authorize() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { user, allowed: isAdminUser(user) }
}

function cleanText(value: unknown, max = 120) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
}

function validDestination(value: string) {
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return false
  try {
    const parsed = new URL(value, 'https://peakaxis.mu')
    return parsed.origin === 'https://peakaxis.mu' && !parsed.username && !parsed.password
  } catch {
    return false
  }
}

export async function GET() {
  try {
    const { user, allowed } = await authorize()
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: user ? 403 : 401 })

    const admin = createAdminClient()
    const [linksResult, enquiriesResult] = await Promise.all([
      admin.from('marketing_links').select('*').order('created_at', { ascending: false }),
      admin.from('enquiries').select('tracking_link_code').not('tracking_link_code', 'is', null),
    ])

    if (linksResult.error || enquiriesResult.error) {
      console.error('Marketing links query failed:', linksResult.error?.code, enquiriesResult.error?.code)
      return NextResponse.json({ error: 'Unable to load marketing links. Confirm the marketing attribution migration has been applied.' }, { status: 500 })
    }

    const conversions = new Map<string, number>()
    for (const enquiry of enquiriesResult.data ?? []) {
      if (enquiry.tracking_link_code) {
        conversions.set(enquiry.tracking_link_code, (conversions.get(enquiry.tracking_link_code) ?? 0) + 1)
      }
    }

    return NextResponse.json({
      data: (linksResult.data ?? []).map(link => ({
        ...link,
        enquiry_count: conversions.get(link.code) ?? 0,
      })),
    })
  } catch (error) {
    console.error('Admin marketing links GET failed:', error)
    return NextResponse.json({ error: 'Unable to load marketing links' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { user, allowed } = await authorize()
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: user ? 403 : 401 })

    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const input = body as Record<string, unknown>
    const label = cleanText(input.label)
    const platform = cleanText(input.platform, 30) as Platform
    const accountHandle = cleanText(input.account_handle, 100)
    const campaign = cleanText(input.campaign)
    const destinationPath = cleanText(input.destination_path, 300) || '/enquire'

    if (label.length < 2) return NextResponse.json({ error: 'Enter a link name (at least 2 characters).' }, { status: 400 })
    if (!PLATFORMS.includes(platform)) return NextResponse.json({ error: 'Choose a valid platform.' }, { status: 400 })
    if (!campaign) return NextResponse.json({ error: 'Enter a campaign name.' }, { status: 400 })
    if (!validDestination(destinationPath)) return NextResponse.json({ error: 'Destination must be a path on this website, such as /enquire.' }, { status: 400 })

    const campaignSlug = slugify(campaign) || 'general'
    const content = accountHandle || label
    const medium = platform === 'whatsapp' ? 'messaging' : platform === 'email' ? 'email' : platform === 'other' ? 'referral' : 'social'
    const code = crypto.randomUUID().replaceAll('-', '').slice(0, 10)
    const admin = createAdminClient()
    const { data, error } = await admin.from('marketing_links').insert({
      code,
      label,
      platform,
      account_handle: accountHandle || null,
      campaign,
      destination_path: destinationPath,
      utm_source: platform,
      utm_medium: medium,
      utm_campaign: campaignSlug,
      utm_content: content,
    }).select('*').single()

    if (error || !data) {
      console.error('Marketing link create failed:', error?.code)
      return NextResponse.json({ error: 'Unable to create this tracking link.' }, { status: 500 })
    }

    return NextResponse.json({ data: { ...data, enquiry_count: 0 } }, { status: 201 })
  } catch (error) {
    console.error('Admin marketing links POST failed:', error)
    return NextResponse.json({ error: 'Unable to create marketing link' }, { status: 500 })
  }
}

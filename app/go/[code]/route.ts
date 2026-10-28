import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const CODE_PATTERN = /^[a-z0-9]{8,16}$/
const LINK_PREVIEW_AGENT = /bot|crawler|spider|facebookexternalhit|slackbot|discordbot|whatsapp|telegrambot|twitterbot|linkedinbot|skypeuripreview/i

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params
  const code = rawCode.toLowerCase()

  if (!CODE_PATTERN.test(code)) {
    return new NextResponse('This tracking link is not valid.', { status: 404 })
  }

  try {
    const admin = createAdminClient()
    const userAgent = request.headers.get('user-agent') || ''
    const isPreviewBot = LINK_PREVIEW_AGENT.test(userAgent)

    // Social-platform unfurlers request links to build preview cards. Resolve
    // those without incrementing clicks so they don't inflate the metrics.
    let link: Record<string, unknown> | null = null
    if (isPreviewBot) {
      const { data, error } = await admin.from('marketing_links')
        .select('code,destination_path,utm_source,utm_medium,utm_campaign,utm_content,is_active')
        .eq('code', code)
        .eq('is_active', true)
        .maybeSingle()
      if (error) return new NextResponse('This tracking link is unavailable.', { status: 404 })
      link = data as Record<string, unknown> | null
    } else {
      const { data, error } = await admin.rpc('record_marketing_link_click', { p_code: code })
      const row = Array.isArray(data) ? data[0] : null
      if (error) return new NextResponse('This tracking link is unavailable.', { status: 404 })
      link = row as Record<string, unknown> | null
    }

    if (!link || typeof link.destination_path !== 'string') {
      return new NextResponse('This tracking link is unavailable.', { status: 404 })
    }

    const path = link.destination_path
    if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
      console.error('Rejected unsafe destination for marketing link:', code)
      return new NextResponse('This tracking link has an invalid destination.', { status: 500 })
    }

    const destination = new URL(path, request.nextUrl.origin)
    if (destination.origin !== request.nextUrl.origin) {
      return new NextResponse('This tracking link has an invalid destination.', { status: 500 })
    }

    destination.searchParams.set('utm_source', String(link.utm_source))
    destination.searchParams.set('utm_medium', String(link.utm_medium))
    destination.searchParams.set('utm_campaign', String(link.utm_campaign))
    if (link.utm_content) destination.searchParams.set('utm_content', String(link.utm_content))
    destination.searchParams.set('trk', code)

    const response = NextResponse.redirect(destination, 307)
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    return response
  } catch (error) {
    console.error('Marketing link redirect failed:', error)
    return new NextResponse('This tracking link is temporarily unavailable.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    })
  }
}

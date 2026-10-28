import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const CODE_PATTERN = /^[a-z0-9]{8,16}$/

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params
  const code = rawCode.toLowerCase()

  if (!CODE_PATTERN.test(code)) {
    return new NextResponse('This tracking link is not valid.', { status: 404 })
  }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.rpc('record_marketing_link_click', { p_code: code })
    const link = Array.isArray(data) ? data[0] : null

    if (error || !link || typeof link.destination_path !== 'string') {
      return new NextResponse('This tracking link is unavailable.', { status: 404 })
    }

    const path = link.destination_path as string
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

    return NextResponse.redirect(destination, 307)
  } catch (error) {
    console.error('Marketing link redirect failed:', error)
    return new NextResponse('This tracking link is temporarily unavailable.', { status: 503 })
  }
}

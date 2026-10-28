import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import MarketingLinksManager from '@/components/admin/MarketingLinksManager'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/supabase/admin-auth'

export const revalidate = 0

export default async function AdminMarketingLinksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser(user)) redirect('/admin/login')

  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')
  const forwardedProtocol = requestHeaders.get('x-forwarded-proto') ?? 'https'
  const protocol = forwardedProtocol === 'http' ? 'http' : 'https'
  const safeHost = host && /^[a-z0-9.-]+(?::\d{1,5})?$/i.test(host) ? host : 'peakaxis.mu'
  const origin = protocol + '://' + safeHost

  return <MarketingLinksManager initialOrigin={origin} />
}

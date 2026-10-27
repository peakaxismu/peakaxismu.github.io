import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminUser } from '@/lib/supabase/admin-auth'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isAdminPath = pathname.startsWith('/admin')
  const isLoginPath = pathname === '/admin/login' || pathname.startsWith('/admin/login/')

  // Public pages do not need session validation. Avoid making every visitor's
  // homepage/navigation depend on an Auth request.
  if (!isAdminPath || isLoginPath) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  // Fail closed for protected admin pages if Preview/Production is misconfigured.
  if (!supabaseUrl || !supabaseAnonKey) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin/login'
    loginUrl.search = '?error=configuration'
    return NextResponse.redirect(loginUrl)
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          if (headers) {
            Object.entries(headers).forEach(([key, value]) =>
              supabaseResponse.headers.set(key, value)
            )
          }
        },
      },
    }
  )

  const { data: { claims }, error } = await supabase.auth.getClaims()
  const appMetadata = claims?.app_metadata
  const identity = claims && !error
    ? {
        email: typeof claims.email === 'string' ? claims.email : null,
        app_metadata: appMetadata && typeof appMetadata === 'object'
          ? appMetadata as { role?: unknown }
          : null,
      }
    : null

  if (!isAdminUser(identity)) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.search = identity ? '?error=forbidden' : ''
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie))
    for (const header of ['cache-control', 'expires', 'pragma']) {
      const value = supabaseResponse.headers.get(header)
      if (value) redirectResponse.headers.set(header, value)
    }
    return redirectResponse
  }

  return supabaseResponse
}

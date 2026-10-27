import type { User } from '@supabase/supabase-js'

/**
 * Authorize a Supabase user for server-side admin operations.
 *
 * Access is granted only when the user has an explicit admin role in
 * app_metadata or their email is present in the server-only ADMIN_EMAILS
 * allowlist. Missing configuration fails closed.
 */
export function isAdminUser(user: User | null): boolean {
  if (!user) return false

  const appRole = user.app_metadata?.role
  if (appRole === 'admin') return true

  const configuredEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  const email = user.email?.trim().toLowerCase()
  return Boolean(email && configuredEmails.includes(email))
}

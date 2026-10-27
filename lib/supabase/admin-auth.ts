/**
 * Authorize a Supabase identity for server-side admin operations.
 *
 * Access is granted only when the identity has an explicit admin role in
 * app_metadata or its email is present in the server-only ADMIN_EMAILS
 * allowlist. Missing configuration fails closed.
 */
export type AdminIdentity = {
  email?: string | null
  app_metadata?: { role?: unknown } | null
} | null

export function isAdminUser(user: AdminIdentity): boolean {
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

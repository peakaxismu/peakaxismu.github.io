/**
 * Authorize a Supabase identity for server-side admin operations.
 *
 * Access is granted only when the identity has an explicit admin role in
 * app_metadata or its email is present in the server-only ADMIN_EMAILS
 * allowlist. Missing configuration fails closed.
 */
export type AdminIdentity = {
  email?: string | null
  app_metadata?: object | null
} | null

export function isAdminUser(user: AdminIdentity): boolean {
  if (!user) return false

  const metadata = user.app_metadata
  const appRole = metadata && 'role' in metadata ? metadata.role : undefined
  if (appRole === 'admin') return true

  const configuredEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  const email = user.email?.trim().toLowerCase()
  return Boolean(email && configuredEmails.includes(email))
}

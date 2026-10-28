/**
 * Scheduled-group prices are always stored and displayed in Mauritian rupees.
 * Accept a plain amount or an existing Rs/MUR-prefixed amount, but never label
 * a price in another currency as rupees.
 */
export function normalizeScheduledHikePrice(value: unknown): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null

  const raw = String(value).trim()
  if (!raw) return null

  const numeric = raw
    .replace(/^(?:rs\.?|mur)\s*/i, '')
    .replace(/[\s,]/g, '')

  if (!/^\d+(?:\.\d{1,2})?$/.test(numeric)) return null

  const amount = Number(numeric)
  if (!Number.isFinite(amount) || amount <= 0) return null

  return `Rs ${amount.toLocaleString('en-MU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

export function formatScheduledHikePrice(value: unknown, fallback = 'Price to be confirmed'): string {
  return normalizeScheduledHikePrice(value) ?? fallback
}

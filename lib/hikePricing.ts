import type { Hike } from '@/types/database'

export function getHikePriceEstimate(hike: Pick<Hike, 'price_solo_usd' | 'price_group_usd'>, groupSize: number) {
  if (!Number.isFinite(groupSize) || groupSize < 1) return null
  if (groupSize === 1) return { total: hike.price_solo_usd, label: 'Solo rate' }
  if (groupSize > 10) return { total: null, label: 'Large group pricing' }
  return { total: groupSize * hike.price_group_usd, label: `${groupSize} × $${hike.price_group_usd} group rate` }
}

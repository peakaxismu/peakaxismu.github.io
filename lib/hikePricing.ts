import type { Hike } from '@/types/database'

type HikePriceEstimate = {
  total: number | null
  label: string
  note: string
}

export function getHikePriceEstimate(hike: Pick<Hike, 'price_solo_usd' | 'price_group_usd'>, groupSize: number): HikePriceEstimate | null {
  if (!Number.isFinite(groupSize) || groupSize < 1) return null
  if (groupSize === 1) return { total: hike.price_solo_usd, label: 'Solo rate', note: '' }
  if (groupSize > 10) return { total: null, label: 'Large group pricing', note: 'Price confirmed upon enquiry.' }
  return { total: groupSize * hike.price_group_usd, label: `${groupSize} × $${hike.price_group_usd} group rate`, note: '' }
}
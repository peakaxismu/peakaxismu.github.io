export type HikeDifficulty = 'easy' | 'moderate' | 'challenging'
export type HikeStatus = 'draft' | 'published'

export interface Hike {
  id: string
  name: string
  hike_type: string
  difficulty: HikeDifficulty
  difficulty_numeric: string
  duration: string
  location: string
  scenery_rating: number
  overall_rating: number
  main_attraction: string
  price_solo_usd: number
  price_group_usd: number
  price: string
  description: string | null
  status: HikeStatus
  date?: string
  spots_total?: number
  spots_remaining?: number
}

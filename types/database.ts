export type HikeDifficulty = 'easy' | 'moderate' | 'challenging'
export type HikeStatus = 'draft' | 'published'
export type HikeBookingType = 'scheduled_group' | 'on_demand' | 'private'

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
  distance_km?: number | null
  elevation_gain_m?: number | null
  starting_point?: string | null
  meeting_point?: string | null
  transport_options?: string | null
  fitness_required?: string | null
  terrain?: string | null
  what_to_bring?: string[]
  included?: string[]
  excluded?: string[]
  safety_info?: string | null
  weather_policy?: string | null
  age_requirements?: string | null
  min_participants?: number | null
  max_participants?: number | null
  experience_types?: string[]
  region?: string | null
  booking_type?: HikeBookingType
  rating_label?: string
  logistics_source?: string | null
  logistics_verified_at?: string | null
}

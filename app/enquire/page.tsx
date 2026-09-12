import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import EnquiryFormClient from '@/components/EnquiryFormClient'

export const revalidate = 0

type EnquiryPageProps = {
  searchParams: Promise<{ interest?: string; ref?: string }>
}

export default async function EnquiryPage({ searchParams }: EnquiryPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: hikes } = await supabase
    .from('hikes')
    .select('id, name, date, price, price_solo_usd, price_group_usd, hike_type, main_attraction, difficulty, difficulty_numeric, duration, location, spots_remaining, spots_total, description')
    .eq('status', 'published')
  const { data: expeditions } = await supabase
    .from('expeditions')
    .select('id, name, destination, price_from, duration, difficulty, description')
    .eq('status', 'published')
  const { data: teamPackages } = await supabase
    .from('team_building_packages')
    .select('id, name, type, duration, price_note, description')
    .eq('status', 'published')

  const allowedInterests = new Set(['hike', 'private_hike', 'expedition', 'piton_des_neiges', 'team', 'activity'])
  let initialInterest = params.interest && allowedInterests.has(params.interest) ? params.interest : 'hike'

  const rawRef = params.ref ?? ''
  let initialRef = ''
  try {
    initialRef = decodeURIComponent(rawRef)
  } catch {
    initialRef = rawRef
  }

  if (initialInterest === 'piton_des_neiges') {
    initialInterest = 'expedition'
    if (!initialRef) {
      initialRef = 'Piton des Neiges Expedition'
    }
  }

  return (
    <div id="view-enquire" className="view active" style={{ display: 'block' }}>
      <section className="pagehead">
        <div className="wrap">
          <h1>Let&apos;s plan your<br />next adventure.</h1>
          <p>Tell us what you&apos;re after — a spot on a scheduled hike, a private trail date, a volcano expedition, or a team building day. We&apos;ll come back with details and pricing.</p>
        </div>
      </section>
      <Suspense fallback={<div className="wrap"><p>Loading form...</p></div>}>
        <EnquiryFormClient
          hikes={hikes || []}
          expeditions={expeditions || []}
          teamPackages={teamPackages || []}
          initialInterest={initialInterest}
          initialRef={initialRef}
        />
      </Suspense>
    </div>
  )
}

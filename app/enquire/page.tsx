import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import EnquiryFormClient from '@/components/EnquiryFormClient'

export const revalidate = 0

export default async function EnquiryPage() {
  const supabase = await createClient()

  const { data: hikes } = await supabase
    .from('hikes')
    .select('id, name, date, price')
    .eq('status', 'published')

  const { data: expeditions } = await supabase
    .from('expeditions')
    .select('id, name, destination, price_from')
    .eq('status', 'published')

  const { data: teamPackages } = await supabase
    .from('team_building_packages')
    .select('id, name, type')
    .eq('status', 'published')

  return (
    <div id="view-enquire" className="view active" style={{ display: 'block' }}>
      <section className="pagehead">
        <div className="wrap">
          <h1>Let&apos;s plan your<br />next adventure.</h1>
          <p>
            Tell us what you&apos;re after — a spot on a scheduled hike, a private trail date, a volcano expedition, or a team building day. We&apos;ll come back with details and pricing.
          </p>
        </div>
      </section>

      <Suspense fallback={<div className="wrap"><p>Loading form...</p></div>}>
        <EnquiryFormClient
          hikes={hikes || []}
          expeditions={expeditions || []}
          teamPackages={teamPackages || []}
        />
      </Suspense>
    </div>
  )
}

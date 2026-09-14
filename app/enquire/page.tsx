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
      <section className="pagehead contact-hero">
        <svg className="hero-scape" viewBox="0 0 1200 500" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <path d="M0,500 L0,355 C120,320 190,250 300,265 C390,278 445,190 535,205 C625,220 690,125 770,145 C860,168 900,250 990,235 C1080,220 1120,175 1200,215 L1200,500 Z" fill="#173838" opacity=".95"/>
          <path d="M0,500 L0,410 C125,375 215,340 325,352 C420,363 490,290 570,305 C665,322 720,235 800,255 C890,278 940,330 1030,312 C1110,296 1160,330 1200,322 L1200,500 Z" fill="#0f2626"/>
          <path d="M160,430 C300,375 380,405 500,335 C620,265 710,350 835,285 C940,230 1025,285 1140,250" stroke="#c9b790" strokeWidth="3" opacity=".45" fill="none"/>
          <ellipse cx="780" cy="125" rx="25" ry="9" fill="#c1440e" opacity=".85"/>
        </svg>
        <div className="wrap hero-inner">
          <div className="kicker">PEAK AXIS · CONTACT</div>
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
      <style>{`.contact-hero{position:relative;overflow:hidden;background:#211f1d;color:#fffaf2;padding:88px 0 72px;min-height:430px;display:flex;align-items:center}.contact-hero .hero-scape{position:absolute;inset:0;width:100%;height:100%;opacity:.95}.contact-hero .hero-inner{position:relative;z-index:1}.contact-hero .kicker{color:#c1440e;font-size:12px;font-weight:800;letter-spacing:.12em;margin-bottom:16px}.contact-hero h1{color:#fffaf2;font-family:var(--font-display),sans-serif;font-size:clamp(48px,7.5vw,88px);line-height:.88;text-transform:uppercase;max-width:900px}.contact-hero p{margin-top:24px;color:#c9c5bc;font-size:19px;line-height:1.6;max-width:680px}@media(max-width:700px){.contact-hero{min-height:390px;padding:72px 0 58px}}`}</style>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 0

type Props = { params: Promise<{ id: string }> }

const formatDate = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('en-MU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

async function getDeparture(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('scheduled_hikes')
    .select('id, hike_id, date, price, spots_total, spots_remaining, status, trail_condition_status, trail_condition_note, hikes!inner(id,name,status,difficulty,difficulty_numeric,duration,location,description,price_group_usd,price_solo_usd,main_attraction,fitness_required,distance_km,elevation_gain_m,meeting_point,starting_point,transport_options,safety_info,weather_policy)')
    .eq('id', id)
    .eq('status', 'published')
    .eq('hikes.status', 'published')
    .maybeSingle()

  if (!data) return null
  const hike = Array.isArray(data.hikes) ? data.hikes[0] : data.hikes
  return hike ? { ...data, hike } : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const departure = await getDeparture(id)
  if (!departure) return { title: 'Scheduled hike not found | Peak Axis' }
  return {
    title: `${departure.hike.name} — ${formatDate(departure.date)} | Peak Axis Mauritius`,
    description: `Scheduled group hike: ${departure.hike.name} on ${formatDate(departure.date)}.`,
  }
}

export default async function ScheduledHikePage({ params }: Props) {
  const { id } = await params
  const departure = await getDeparture(id)
  if (!departure) notFound()

  const hike = departure.hike
  const spots = departure.spots_remaining ?? 0
  const available = spots > 0
  const enquiryRef = `${hike.name} — ${formatDate(departure.date)}`

  return (
    <div className="scheduled-page">
      <section className="scheduled-hero">
        <div className="wrap">
          <Link href="/hikes" className="back-link">← All hikes</Link>
          <span className="kicker">SCHEDULED GROUP HIKE</span>
          <h1>{hike.name}</h1>
          <p className="hero-date">{formatDate(departure.date)}</p>
          <div className="hero-meta">
            <span>{hike.location}</span>
            <span>{hike.difficulty}{hike.difficulty_numeric ? ` · ${hike.difficulty_numeric}` : ''}</span>
            <span>{hike.duration}</span>
          </div>
        </div>
      </section>

      <main className="wrap scheduled-main">
        <div className="scheduled-grid">
          <div>
            <div className="departure-card">
              <div>
                <span className="card-kicker">THIS DEPARTURE</span>
                <h2>{formatDate(departure.date)}</h2>
              </div>
              <div className="departure-stats">
                <div><b>PRICE</b><strong>{departure.price || 'Price on request'}</strong><span>per person</span></div>
                <div><b>SPOTS</b><strong>{spots}</strong><span>remaining of {departure.spots_total ?? '—'}</span></div>
                <div><b>DIFFICULTY</b><strong>{hike.difficulty}</strong><span>guided group</span></div>
              </div>
              {departure.trail_condition_status && departure.trail_condition_status !== 'open' && (
                <div className="condition-note">
                  <strong>Trail conditions: {departure.trail_condition_status.replace(/_/g, ' ')}</strong>
                  {departure.trail_condition_note && <p>{departure.trail_condition_note}</p>}
                </div>
              )}
              <div className="departure-actions">
                {available ? (
                  <Link href={`/enquire?interest=hike&ref=${encodeURIComponent(enquiryRef)}`} className="book-btn">Request this departure</Link>
                ) : (
                  <span className="sold-out">Fully booked</span>
                )}
                <Link href={`/hikes/${hike.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`} className="secondary-btn">View hike details</Link>
              </div>
            </div>

            <section className="content-section">
              <span className="section-kicker">THE ROUTE</span>
              <h2>{hike.main_attraction || `Guided ${hike.name}`}</h2>
              <p>{hike.description || `Join Peak Axis for a guided group hike on ${formatDate(departure.date)}.`}</p>
            </section>

            <section className="facts">
              {[
                ['Distance', hike.distance_km != null ? `${hike.distance_km} km` : 'To be confirmed'],
                ['Elevation gain', hike.elevation_gain_m != null ? `${hike.elevation_gain_m} m` : 'To be confirmed'],
                ['Fitness', hike.fitness_required || 'To be confirmed'],
                ['Meeting point', hike.meeting_point || 'To be confirmed'],
                ['Starting point', hike.starting_point || 'To be confirmed'],
                ['Weather policy', hike.weather_policy || 'To be confirmed'],
              ].map(([label, value]) => <div key={label}><b>{label}</b><span>{value}</span></div>)}
            </section>
          </div>

          <aside className="side-card">
            <span className="card-kicker">SCHEDULED, NOT ON-DEMAND</span>
            <h2>This page is for this exact departure.</h2>
            <p>The date, price, capacity and trail conditions shown here belong to this scheduled group, not the general on-demand hike.</p>
            <div className="side-list">
              <div><b>Date</b><span>{formatDate(departure.date)}</span></div>
              <div><b>Price</b><span>{departure.price || 'On request'}</span></div>
              <div><b>Availability</b><span>{available ? `${spots} spots remaining` : 'Fully booked'}</span></div>
            </div>
          </aside>
        </div>
      </main>

      <style>{`
        .scheduled-page{background:#f5f1e8;min-height:100vh;color:#211f1d}
        .scheduled-hero{background:#211f1d;color:#faf8f3;padding:42px 0 72px}
        .back-link{display:inline-block;color:#c9b790;font-size:13px;font-weight:700;margin-bottom:50px}
        .kicker,.card-kicker,.section-kicker{display:block;color:#c1440e;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
        .scheduled-hero h1{margin-top:12px;color:#faf8f3;font-size:clamp(46px,7vw,82px);line-height:.92;max-width:900px}
        .hero-date{margin-top:18px;color:#c9b790;font:700 clamp(22px,3vw,32px)/1.1 var(--font-display),sans-serif}
        .hero-meta{display:flex;flex-wrap:wrap;gap:10px 24px;margin-top:22px;color:#c9c5bc;font-size:13px}
        .scheduled-main{padding:42px 0 90px}
        .scheduled-grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,.7fr);gap:30px;align-items:start}
        .departure-card,.side-card{background:#fffaf2;border:1px solid #ded7ca}
        .departure-card{padding:28px}
        .departure-card h2{margin-top:7px;font-size:32px}
        .departure-stats{display:grid;grid-template-columns:repeat(3,1fr);margin-top:25px;border-top:1px solid #ded7ca;border-bottom:1px solid #ded7ca}
        .departure-stats>div{padding:18px 15px;border-right:1px solid #ded7ca}
        .departure-stats>div:last-child{border-right:0}
        .departure-stats b,.facts b{display:block;color:#777168;font-size:10px;letter-spacing:.08em;text-transform:uppercase}
        .departure-stats strong{display:block;margin-top:6px;font-size:23px}
        .departure-stats span{display:block;margin-top:3px;color:#6b675f;font-size:11px}
        .condition-note{margin-top:18px;padding:13px 15px;border-left:3px solid #c1440e;background:#f4eadf;color:#5a564f;font-size:12px}
        .condition-note p{margin-top:4px}
        .departure-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}
        .book-btn{display:inline-flex;background:#c1440e;color:#faf8f3;padding:13px 19px;font-weight:800}
        .secondary-btn{display:inline-flex;border:1px solid #211f1d;padding:12px 19px;font-weight:700}
        .sold-out{display:inline-flex;background:#6b675f;color:#fff;padding:13px 19px;font-weight:800}
        .content-section{margin-top:42px}
        .content-section h2{margin-top:9px;font-size:34px}
        .content-section p{margin-top:13px;max-width:760px;color:#514c45;line-height:1.75;font-size:15px}
        .facts{display:grid;grid-template-columns:repeat(3,1fr);margin-top:30px;border-top:1px solid #ded7ca;border-left:1px solid #ded7ca}
        .facts div{padding:16px;border-right:1px solid #ded7ca;border-bottom:1px solid #ded7ca;background:#fffaf2}
        .facts span{display:block;margin-top:6px;font-size:13px;line-height:1.45}
        .side-card{position:sticky;top:96px;padding:24px}
        .side-card h2{margin-top:10px;font-size:26px;line-height:1.05}
        .side-card>p{margin-top:12px;color:#5a564f;font-size:13px;line-height:1.6}
        .side-list{margin-top:20px;border-top:1px solid #ded7ca}
        .side-list div{display:flex;flex-direction:column;gap:3px;padding:12px 0;border-bottom:1px solid #ded7ca}
        .side-list b{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#777168}
        .side-list span{font-size:13px;font-weight:700}
        @media(max-width:800px){.scheduled-grid{grid-template-columns:1fr}.side-card{position:static}.departure-stats{grid-template-columns:1fr}.departure-stats>div{border-right:0;border-bottom:1px solid #ded7ca}.departure-stats>div:last-child{border-bottom:0}.facts{grid-template-columns:1fr 1fr}}
        @media(max-width:520px){.scheduled-hero{padding:32px 0 54px}.back-link{margin-bottom:38px}.departure-card{padding:21px}.facts{grid-template-columns:1fr}.scheduled-main{padding-top:26px}}
      `}</style>
    </div>
  )
}

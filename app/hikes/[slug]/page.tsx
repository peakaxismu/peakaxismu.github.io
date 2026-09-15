import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Hike } from '@/types/database'

export const revalidate = 0
type Props = { params: Promise<{ slug: string }> }
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const valueOr = (value: string | number | null | undefined, fallback = 'To be confirmed') => value === null || value === undefined || value === '' ? fallback : String(value)
const list = (items?: string[]) => items?.filter(Boolean) ?? []

async function getHikes() {
  const supabase = await createClient()
  const { data } = await supabase.from('hikes').select('*').eq('status', 'published').order('created_at', { ascending: true })
  return (data || []) as Hike[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const hike = (await getHikes()).find((item) => slugify(item.name) === slug)
  if (!hike) return { title: 'Hike not found | Peak Axis' }
  const type = (hike.hike_type || 'guided hike').toLowerCase()
  return { title: `${hike.name} | Peak Axis Mauritius`, description: hike.description || `${hike.name} — ${type} adventure in Mauritius. ${hike.difficulty} difficulty, ${hike.duration}.` }
}

export default async function HikeDetailPage({ params }: Props) {
  const { slug } = await params
  const hike = (await getHikes()).find((item) => slugify(item.name) === slug)
  if (!hike) notFound()

  const spots = hike.spots_remaining ?? 0
  const isScheduled = hike.booking_type === 'scheduled_group'
  const available = !isScheduled || spots > 0
  const bring = list(hike.what_to_bring)
  const included = list(hike.included)
  const excluded = list(hike.excluded)
  const experienceTypes = list(hike.experience_types)
  const bookingType = hike.booking_type === 'private' ? 'private' : isScheduled ? 'scheduled_group' : 'on_demand'
  const ratingLabel = hike.rating_label || 'Peak Axis rating'
  const hikeType = (hike.hike_type || 'guided hike').toLowerCase()
  const bookingLabel = bookingType === 'scheduled_group' ? 'Scheduled group hike' : bookingType === 'private' ? 'Private / on-demand' : 'On-demand hike'
  const bookingDescription = bookingType === 'scheduled_group'
    ? 'A published departure you can join with other hikers.'
    : bookingType === 'private'
      ? 'A private outing arranged around your group and preferred date.'
      : 'No fixed public departure. Tell us when you want to go and we will arrange the route around conditions and availability.'
  const enquiryHref = available
    ? `/enquire?interest=${bookingType === 'scheduled_group' ? 'hike' : 'private_hike'}&ref=${encodeURIComponent(hike.name)}`
    : '/enquire?interest=private_hike'

  const facts = [
    ['Difficulty', valueOr(hike.difficulty_numeric || hike.difficulty)],
    ['Distance', hike.distance_km != null ? `${hike.distance_km} km` : 'To be confirmed'],
    ['Duration', valueOr(hike.duration)],
    ['Elevation gain', hike.elevation_gain_m != null ? `${hike.elevation_gain_m} m` : 'To be confirmed'],
    ['Location', valueOr(hike.location)],
    ['Terrain', valueOr(hike.terrain)],
    ['Fitness required', valueOr(hike.fitness_required)],
    ['Minimum age', valueOr(hike.age_requirements)],
    ['Group size', hike.min_participants || hike.max_participants ? `${valueOr(hike.min_participants, '—')}–${valueOr(hike.max_participants, '—')}` : 'To be confirmed'],
  ]

  return <div className="view active" style={{ display: 'block' }}>
    <section className="pagehead" style={{ padding: '60px 0 36px' }}><div className="wrap">
      <Link href="/hikes" style={{ display: 'inline-block', marginBottom: '20px', fontSize: '14px', fontWeight: 600 }}>← All hikes</Link>
      <div style={{ maxWidth: '940px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', fontSize: '13.5px', color: '#6b675f' }}>
          <span style={{ fontWeight: 700, color: hike.difficulty === 'challenging' ? 'var(--ember)' : hike.difficulty === 'moderate' ? '#a3720b' : 'var(--teal)', textTransform: 'capitalize' }}>{hike.difficulty}{hike.difficulty_numeric ? ` · ${hike.difficulty_numeric}` : ''}</span>
          <span>⏱ {hike.duration}</span><span>📍 {hike.location}</span>
          {hike.overall_rating != null && <span style={{ fontWeight: 700 }}>★ {hike.overall_rating}/10 · {ratingLabel}</span>}
        </div>
        <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)' }}>{hike.name}</h1>
        <p style={{ marginTop: '18px', maxWidth: '780px', fontSize: '17px', lineHeight: 1.7, color: '#3d3a36' }}>{hike.description || `Join Peak Axis for ${hike.name}, a guided ${hikeType} experience in Mauritius.`}</p>
      </div>
    </div></section>

    <main className="wrap" style={{ paddingTop: '10px', paddingBottom: '80px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(300px,.8fr)', gap: '32px', alignItems: 'start' }}>
        <div>
          <div style={{ width: '100%', aspectRatio: '16/7', background: 'var(--teal)', overflow: 'hidden' }} aria-hidden="true"><svg viewBox="0 0 800 360" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}><rect width="800" height="360" fill="var(--sand)"/><path d="M0 300 L150 130 L260 230 L390 70 L520 220 L650 110 L800 260 L800 360 L0 360Z" fill="var(--teal)"/></svg></div>

          <section style={{ marginTop: '22px', display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', border: '1px solid var(--sand-line)', background: 'var(--warm-white)' }} className="hike-logistics-strip">
            {[['DISTANCE', hike.distance_km != null ? `${hike.distance_km} km` : 'TBC'], ['ELEVATION', hike.elevation_gain_m != null ? `${hike.elevation_gain_m} m` : 'TBC'], ['DURATION', hike.duration], ['FITNESS', hike.fitness_required || 'TBC']].map(([label, value]) => <div key={label} style={{ padding: '16px', borderRight: '1px solid var(--sand-line)' }}><div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '.09em', color: '#777168' }}>{label}</div><div style={{ marginTop: '6px', fontSize: '14px', fontWeight: 700, lineHeight: 1.35 }}>{value}</div></div>)}
          </section>

          <section style={{ marginTop: '36px' }}><h2 style={{ fontSize: '32px', marginBottom: '14px' }}>The experience</h2><p style={{ fontSize: '16px', maxWidth: '760px', color: '#3d3a36', lineHeight: 1.8 }}>{hike.description || `A guided ${hikeType} route built around ${hike.main_attraction?.toLowerCase() || 'the landscape of Mauritius'}.`}</p></section>

          <section style={{ marginTop: '38px' }}><h2 style={{ fontSize: '32px', marginBottom: '18px' }}>Quick facts</h2><div className="hike-detail-facts" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', borderTop: '1px solid var(--sand-line)', borderLeft: '1px solid var(--sand-line)' }}>{facts.map(([label, value]) => <div key={label} style={{ padding: '17px', borderRight: '1px solid var(--sand-line)', borderBottom: '1px solid var(--sand-line)' }}><div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#777168' }}>{label}</div><div style={{ marginTop: '6px', fontWeight: 650 }}>{value}</div></div>)}</div></section>

          <section style={{ marginTop: '38px' }}><h2 style={{ fontSize: '32px', marginBottom: '18px' }}>What you&apos;ll experience</h2><div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>{[hike.main_attraction, ...experienceTypes].filter(Boolean).map((item, i) => <div key={`${item}-${i}`} style={{ padding: '12px 15px', border: '1px solid var(--sand-line)', background: 'rgba(250,248,243,.35)' }}>✦ {item}</div>)}</div></section>

          {[["What to bring", bring, 'Bring the essentials for a comfortable day outdoors.'],["What's included", included, 'Included in the listed hike price.'],["What's not included", excluded, 'These items or services are not included in the listed price.']].map(([title, items, intro]) => <section key={title as string} style={{ marginTop: '38px' }}><h2 style={{ fontSize: '30px', marginBottom: '10px' }}>{title as string}</h2><p style={{ color: '#5a564f', marginBottom: '12px' }}>{intro as string}</p>{(items as string[]).length ? <ul style={{ paddingLeft: '20px', lineHeight: 1.9 }}>{(items as string[]).map(item => <li key={item}>{item}</li>)}</ul> : <p style={{ color: '#777168' }}>To be confirmed — we&apos;ll provide the final details before booking.</p>}</section>)}

          <section style={{ marginTop: '38px', display: 'grid', gap: '18px' }}><InfoSection title="Meeting point" value={hike.meeting_point} /><InfoSection title="Starting point" value={hike.starting_point} /><InfoSection title="Getting there" value={hike.transport_options} /><InfoSection title="Safety" value={hike.safety_info} /><InfoSection title="Weather policy" value={hike.weather_policy} /></section>

          {hike.logistics_source && <p style={{ marginTop: '20px', fontSize: '11.5px', lineHeight: 1.6, color: '#777168' }}>Route logistics checked against: {hike.logistics_source}{hike.logistics_verified_at ? ` · ${new Date(hike.logistics_verified_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}. Route conditions and access can change.</p>}

          <section style={{ marginTop: '42px' }}><h2 style={{ fontSize: '32px', marginBottom: '16px' }}>FAQ</h2><div style={{ display: 'grid', gap: '10px' }}><Faq title="Is this hike right for me?" answer={`This is a ${hike.difficulty} route${hike.difficulty_numeric ? ` rated ${hike.difficulty_numeric}` : ''}. Fitness requirement: ${valueOr(hike.fitness_required)}.`} /><Faq title="How do I join?" answer={bookingDescription} /><Faq title="What happens if the weather is bad?" answer={valueOr(hike.weather_policy, 'The guide team will assess conditions and communicate any cancellation or rescheduling decision.')} /><Faq title="Can children join?" answer={valueOr(hike.age_requirements)} /><Faq title="How many people can join?" answer={hike.min_participants || hike.max_participants ? `Minimum: ${valueOr(hike.min_participants, 'not specified')}. Maximum: ${valueOr(hike.max_participants, 'not specified')}.` : 'Group size to be confirmed for this route.'} /></div></section>
        </div>

        <aside style={{ position: 'sticky', top: '96px', border: '1px solid var(--sand-line)', background: 'var(--warm-white)', padding: '24px', boxShadow: '0 12px 32px rgba(0,0,0,.05)' }}>
          <div style={{ display: 'inline-flex', padding: '7px 10px', border: '1px solid var(--sand-line)', background: 'rgba(250,248,243,.7)', fontSize: '11px', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>{bookingLabel}</div>
          <h2 style={{ fontSize: '30px', marginTop: '12px' }}>{bookingType === 'scheduled_group' ? (hike.date || 'Date to be confirmed') : 'Choose your date'}</h2>
          <p style={{ marginTop: '8px', fontSize: '13px', lineHeight: 1.6, color: '#5a564f' }}>{bookingDescription}</p>
          <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid var(--sand-line)' }}><p style={{ fontSize: '12px', color: '#5a564f' }}>GROUP RATE</p><strong style={{ fontSize: '28px' }}>{hike.price_group_usd != null ? `$${hike.price_group_usd}` : hike.price}<span style={{ fontSize: '14px', fontWeight: 500 }}>{hike.price_group_usd != null ? '/person' : ''}</span></strong>{hike.price_solo_usd != null && <p style={{ marginTop: '4px', fontSize: '13px', color: '#5a564f' }}>Private / solo: ${hike.price_solo_usd}</p>}</div>
          {isScheduled && <div style={{ marginTop: '18px', fontSize: '12.5px', color: available && spots <= 4 ? 'var(--ember)' : '#6b675f', fontWeight: available && spots <= 4 ? 600 : 400 }}>{available ? `${spots} spots left` : 'Fully booked'}</div>}
          <Link href={enquiryHref} style={{ display: 'block', textAlign: 'center', marginTop: '16px', background: 'var(--ember)', color: 'var(--warm-white)', padding: '14px 20px', fontSize: '14px', fontWeight: 700 }}>{available ? bookingType === 'scheduled_group' ? 'Enquire / join this hike' : bookingType === 'private' ? 'Plan a private hike' : 'Plan this hike' : 'Ask about a private hike'}</Link>
          <p style={{ marginTop: '14px', fontSize: '12px', lineHeight: 1.6, color: '#5a564f' }}>Not sure if this route is right for you? Send an enquiry and we&apos;ll help you choose.</p>
        </aside>
      </div>
    </main>
    <style>{`@media(max-width:760px){.wrap{padding-left:20px!important;padding-right:20px!important}main>div{grid-template-columns:1fr!important}main aside{position:static!important}.hike-detail-facts{grid-template-columns:1fr 1fr!important}.hike-logistics-strip{grid-template-columns:1fr 1fr!important}.hike-logistics-strip>div:nth-child(2){border-right:0}.hike-logistics-strip>div:nth-child(3){border-top:1px solid var(--sand-line)}}`}</style>
  </div>
}

function InfoSection({ title, value }: { title: string; value?: string | null }) {
  return <div style={{ padding: '20px', border: '1px solid var(--sand-line)', background: 'rgba(250,248,243,.3)' }}><h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{title}</h3><p style={{ color: value ? '#3d3a36' : '#777168', lineHeight: 1.7 }}>{value || "To be confirmed — we'll provide the final details before booking."}</p></div>
}

function Faq({ title, answer }: { title: string; answer: string }) {
  return <details style={{ border: '1px solid var(--sand-line)', padding: '15px 18px' }}><summary style={{ cursor: 'pointer', fontWeight: 650 }}>{title}</summary><p style={{ marginTop: '10px', color: '#5a564f', lineHeight: 1.7 }}>{answer}</p></details>
}

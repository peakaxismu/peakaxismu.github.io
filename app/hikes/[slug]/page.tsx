import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Hike } from '@/types/database'

export const revalidate = 0
type Props = { params: Promise<{ slug: string }> }
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

async function getHikes() {
  const supabase = await createClient()
  const { data } = await supabase.from('hikes').select('*').eq('status', 'published').order('created_at', { ascending: true })
  return (data || []) as Hike[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const hike = (await getHikes()).find((item) => slugify(item.name) === slug)
  if (!hike) return { title: 'Hike not found | Peak Axis' }
  return { title: `${hike.name} | Peak Axis Mauritius`, description: hike.description || `${hike.name} — ${hike.hike_type} adventure in Mauritius. ${hike.difficulty} difficulty, ${hike.duration}.` }
}

export default async function HikeDetailPage({ params }: Props) {
  const { slug } = await params
  const hike = (await getHikes()).find((item) => slugify(item.name) === slug)
  if (!hike) notFound()
  const spots = hike.spots_remaining ?? 0
  const available = spots > 0

  return <div className="view active" style={{ display: 'block' }}>
    <section className="pagehead" style={{ padding: '60px 0 36px' }}><div className="wrap">
      <Link href="/hikes" style={{ display: 'inline-block', marginBottom: '20px', fontSize: '14px', fontWeight: 600 }}>← All hikes</Link>
      <div style={{ maxWidth: '820px' }}><div className="hike-meta" style={{ marginBottom: '16px', display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '13.5px', color: '#6b675f' }}><span style={{ fontWeight: 700, color: hike.difficulty === 'challenging' ? 'var(--ember)' : hike.difficulty === 'moderate' ? '#a3720b' : 'var(--teal)' }}>{hike.difficulty} · {hike.difficulty_numeric}</span><span>🏷️ {hike.hike_type}</span><span>⏱ {hike.duration}</span><span>📍 {hike.location}</span></div><h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)' }}>{hike.name}</h1><p style={{ marginTop: '18px', maxWidth: '760px', fontSize: '16.5px', color: '#3d3a36' }}>{hike.description || `Join Peak Axis for ${hike.name}, a guided ${hike.hike_type.toLowerCase()} experience in Mauritius.`}</p></div>
    </div></section>
    <main className="wrap" style={{ paddingTop: '10px', paddingBottom: '80px' }}><div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(280px,.8fr)', gap: '32px', alignItems: 'start' }}>
      <div>
        <div style={{ width: '100%', aspectRatio: '16/7', background: 'var(--teal)', overflow: 'hidden' }} aria-hidden="true"><svg viewBox="0 0 800 360" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}><rect width="800" height="360" fill="var(--sand)"/><path d="M0 300 L150 130 L260 230 L390 70 L520 220 L650 110 L800 260 L800 360 L0 360Z" fill="var(--teal)"/></svg></div>
        <section style={{ marginTop: '30px' }}><h2 style={{ fontSize: '32px', marginBottom: '14px' }}>The experience</h2><p style={{ fontSize: '16px', maxWidth: '760px', color: '#3d3a36' }}>{hike.description || `A guided ${hike.hike_type.toLowerCase()} route built around ${hike.main_attraction.toLowerCase()}.`}</p></section>
        <section style={{ marginTop: '36px' }}><h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Why this hike</h2><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '14px' }}>
          {[['✨ Main attraction', hike.main_attraction], ['🏔️ Scenery', `${hike.scenery_rating}/10`], ['⭐ Overall', `${hike.overall_rating}/10`], ['🎒 Duration', hike.duration]].map(([label,value]) => <div key={label} style={{ padding: '18px', border: '1px solid var(--sand-line)', background: 'rgba(250,248,243,.3)' }}><strong>{label}</strong><p style={{ marginTop: '7px', color: '#3d3a36' }}>{value}</p></div>)}
        </div></section>
      </div>
      <aside style={{ position: 'sticky', top: '96px', border: '1px solid var(--sand-line)', background: 'var(--warm-white)', padding: '24px' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Scheduled hike</p><h2 style={{ fontSize: '34px', marginTop: '8px' }}>{hike.date || 'Date to be confirmed'}</h2>
        <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid var(--sand-line)' }}><p style={{ fontSize: '12px', color: '#5a564f' }}>GROUP RATE</p><strong style={{ fontSize: '28px' }}>${hike.price_group_usd}<span style={{ fontSize: '14px', fontWeight: 500 }}>/person</span></strong><p style={{ marginTop: '4px', fontSize: '13px', color: '#5a564f' }}>Solo: ${hike.price_solo_usd}</p></div>
        <div style={{ marginTop: '18px', fontSize: '12.5px', color: available && spots <= 4 ? 'var(--ember)' : '#6b675f', fontWeight: available && spots <= 4 ? 600 : 400 }}>{available ? `${spots} spots left` : 'Fully booked'}</div>
        <Link href={available ? `/enquire?interest=hike&ref=${encodeURIComponent(hike.name)}` : '/enquire?interest=private_hike'} style={{ display: 'block', textAlign: 'center', marginTop: '16px', background: 'var(--ember)', color: 'var(--warm-white)', padding: '14px 20px', fontSize: '14px', fontWeight: 600 }}>{available ? 'Book your spot' : 'Ask about a private hike'}</Link>
        <p style={{ marginTop: '14px', fontSize: '12px', color: '#5a564f' }}>Not sure if this route is right for you? Send an enquiry and we&apos;ll help you choose.</p>
      </aside>
    </div></main>
    <style>{`@media(max-width:760px){.wrap{padding-left:20px!important;padding-right:20px!important}main>div{grid-template-columns:1fr!important}main aside{position:static!important}.hike-detail-facts{grid-template-columns:1fr!important}}`}</style>
  </div>
}

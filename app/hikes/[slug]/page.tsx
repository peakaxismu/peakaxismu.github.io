import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Hike } from '@/types/database'

export const revalidate = 0

type Props = { params: Promise<{ slug: string }> }

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function getHikes() {
  const supabase = await createClient()
  const { data } = await supabase.from('hikes').select('*').eq('status', 'published').order('created_at', { ascending: true })
  return (data || []) as Hike[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const hike = (await getHikes()).find((item) => slugify(item.name) === slug)
  if (!hike) return { title: 'Hike not found | Peak Axis' }
  return {
    title: `${hike.name} | Peak Axis Mauritius`,
    description: hike.description || `${hike.name} — ${hike.hike_type} adventure in Mauritius. ${hike.difficulty} difficulty, ${hike.duration}.`,
  }
}

export default async function HikeDetailPage({ params }: Props) {
  const { slug } = await params
  const hikes = await getHikes()
  const hike = hikes.find((item) => slugify(item.name) === slug)
  if (!hike) notFound()

  const numericDifficulty = hike.difficulty_numeric
  const spots = hike.spots_remaining ?? 0
  const available = spots > 0

  return (
    <div className="view active" style={{ display: 'block' }}>
      <section className="pagehead">
        <div className="wrap">
          <Link href="/hikes" style={{ display: 'inline-block', marginBottom: '20px', fontSize: '14px', fontWeight: 600 }}>← All hikes</Link>
          <div style={{ maxWidth: '820px' }}>
            <div className="hike-meta" style={{ marginBottom: '16px' }}>
              <span className={`diff diff-${hike.difficulty}`}>{hike.difficulty} · {numericDifficulty}</span>
              <span>🏷️ {hike.hike_type}</span>
              <span>⏱ {hike.duration}</span>
              <span>📍 {hike.location}</span>
            </div>
            <h1>{hike.name}</h1>
            <p style={{ marginTop: '18px', maxWidth: '760px' }}>{hike.description || `Join Peak Axis for ${hike.name}, a guided ${hike.hike_type.toLowerCase()} experience in Mauritius.`}</p>
          </div>
        </div>
      </section>

      <main className="wrap" style={{ paddingTop: '36px', paddingBottom: '70px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, .8fr)', gap: '32px', alignItems: 'start' }}>
          <div>
            <div className="hike-visual" style={{ minHeight: '280px', marginBottom: '28px' }} aria-hidden="true">
              <svg viewBox="0 0 800 360" preserveAspectRatio="none"><rect width="800" height="360" fill="#C9B790" /><path d="M0 300 L150 130 L260 230 L390 70 L520 220 L650 110 L800 260 L800 360 L0 360Z" fill="#1F4B4C" /></svg>
            </div>

            <section>
              <h2 style={{ fontSize: '32px', marginBottom: '14px' }}>The experience</h2>
              <p style={{ fontSize: '16px', maxWidth: '760px' }}>{hike.description || `A guided ${hike.hike_type.toLowerCase()} route designed around ${hike.main_attraction.toLowerCase()}.`}</p>
            </section>

            <section style={{ marginTop: '34px' }}>
              <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>What makes it worth it</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
                <div style={{ padding: '18px', border: '1px solid var(--sand-line)' }}><strong>✨ Main attraction</strong><p style={{ marginTop: '7px' }}>{hike.main_attraction}</p></div>
                <div style={{ padding: '18px', border: '1px solid var(--sand-line)' }}><strong>🏔️ Scenery</strong><p style={{ marginTop: '7px' }}>{hike.scenery_rating}/10</p></div>
                <div style={{ padding: '18px', border: '1px solid var(--sand-line)' }}><strong>⭐ Overall</strong><p style={{ marginTop: '7px' }}>{hike.overall_rating}/10</p></div>
                <div style={{ padding: '18px', border: '1px solid var(--sand-line)' }}><strong>🎒 Duration</strong><p style={{ marginTop: '7px' }}>{hike.duration}</p></div>
              </div>
            </section>
          </div>

          <aside style={{ position: 'sticky', top: '96px', border: '1px solid var(--sand-line)', background: 'var(--warm-white)', padding: '24px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Scheduled hike</p>
            <h2 style={{ fontSize: '34px', marginTop: '8px' }}>{hike.date || 'Date to be confirmed'}</h2>
            <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid var(--sand-line)' }}>
              <p style={{ fontSize: '12px', color: '#5a564f' }}>GROUP RATE</p>
              <strong style={{ fontSize: '28px' }}>${hike.price_group_usd}<span style={{ fontSize: '14px', fontWeight: 500 }}>/person</span></strong>
              <p style={{ marginTop: '4px', fontSize: '13px', color: '#5a564f' }}>Solo: ${hike.price_solo_usd}</p>
            </div>
            <div className={`spots ${spots > 0 && spots <= 4 ? 'low' : ''}`} style={{ marginTop: '18px' }}>{available ? `${spots} spots left` : 'Fully booked'}</div>
            {available ? <Link href={`/enquire?interest=hike&ref=${encodeURIComponent(hike.name)}`} className="btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '16px' }}>Book your spot</Link> : <Link href="/enquire?interest=private_hike" className="btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '16px' }}>Ask about a private hike</Link>}
            <p style={{ marginTop: '14px', fontSize: '12px', color: '#5a564f' }}>Not sure if this route is right for you? Send an enquiry and we&apos;ll help you choose.</p>
          </aside>
        </div>
      </main>
    </div>
  )
}

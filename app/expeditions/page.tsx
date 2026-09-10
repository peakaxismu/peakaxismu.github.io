import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 0

export default async function ExpeditionsPage() {
  const supabase = await createClient()
  const { data: expeditions } = await supabase
    .from('expeditions')
    .select('id, slug, name, destination, duration_days, price_from, next_departure, description, difficulty')
    .eq('status', 'published')
    .order('created_at', { ascending: true })

  return (
    <section className="expeditions-index">
      <div className="expeditions-index-wrap">
        <div className="expeditions-index-head">
          <span>EXPEDITIONS · LA RÉUNION</span>
          <h1>Go further than the trail.</h1>
          <p>Multi-day mountain trips built around real terrain, clear logistics, and small groups.</p>
        </div>

        {expeditions && expeditions.length > 0 ? (
          <div className="expeditions-index-grid">
            {expeditions.map((expedition) => (
              <article className="expedition-card" key={expedition.id}>
                <div className="expedition-card-top">
                  <span>{expedition.destination}</span>
                  <strong>{expedition.difficulty || 'Mountain expedition'}</strong>
                </div>
                <h2>{expedition.name}</h2>
                <p>{expedition.description}</p>
                <div className="expedition-card-facts">
                  <span>{expedition.duration_days} days</span>
                  <span>From {expedition.price_from}</span>
                  <span>{expedition.next_departure || 'On request'}</span>
                </div>
                <Link href={`/expeditions/${expedition.slug}`} className="expedition-card-link">
                  View itinerary &amp; details →
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="expeditions-empty">
            <h2>No expeditions are currently published.</h2>
            <p>Check back soon or tell us what kind of mountain trip you are planning.</p>
            <Link href="/enquire">Plan an adventure →</Link>
          </div>
        )}
      </div>

      <style>{`
        .expeditions-index { min-height: 70vh; background: #f5f1e8; color: #211f1d; }
        .expeditions-index-wrap { width: min(1180px, calc(100% - 64px)); margin: 0 auto; padding: 76px 0 100px; }
        .expeditions-index-head { max-width: 760px; padding-bottom: 54px; }
        .expeditions-index-head > span { color: #c1440e; font-size: 12px; font-weight: 800; letter-spacing: .12em; }
        .expeditions-index-head h1 { margin-top: 16px; font-family: var(--font-display), sans-serif; font-size: clamp(52px, 8vw, 92px); line-height: .86; text-transform: uppercase; }
        .expeditions-index-head p { margin-top: 22px; max-width: 600px; color: #45413b; font-size: 18px; line-height: 1.6; }
        .expeditions-index-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
        .expedition-card { padding: 30px; background: #fffaf2; border: 1px solid rgba(33,31,29,.13); display: flex; flex-direction: column; min-height: 340px; }
        .expedition-card-top { display: flex; justify-content: space-between; gap: 15px; color: #6b665e; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
        .expedition-card-top strong { color: #c1440e; }
        .expedition-card h2 { margin-top: 28px; font-family: var(--font-display), sans-serif; font-size: clamp(36px, 4vw, 54px); line-height: .9; text-transform: uppercase; }
        .expedition-card p { margin-top: 18px; color: #514c45; font-size: 15px; line-height: 1.65; }
        .expedition-card-facts { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-top: 24px; color: #6b665e; font-size: 12.5px; }
        .expedition-card-link { display: inline-flex; margin-top: auto; padding-top: 26px; color: #211f1d; font-size: 14px; font-weight: 750; border-bottom: 2px solid #c1440e; align-self: flex-start; }
        .expedition-card-link:hover { color: #c1440e; }
        .expeditions-empty { padding: 42px 30px; background: #fffaf2; border: 1px solid rgba(33,31,29,.13); }
        .expeditions-empty h2 { font-family: var(--font-display), sans-serif; font-size: 42px; text-transform: uppercase; }
        .expeditions-empty p { margin-top: 12px; color: #514c45; }
        .expeditions-empty a { display: inline-block; margin-top: 24px; font-weight: 700; border-bottom: 2px solid #c1440e; }
        @media (max-width: 760px) {
          .expeditions-index-wrap { width: calc(100% - 40px); padding: 54px 0 70px; }
          .expeditions-index-grid { grid-template-columns: 1fr; }
          .expedition-card { min-height: 0; }
        }
        @media (max-width: 520px) {
          .expeditions-index-wrap { width: calc(100% - 32px); }
          .expedition-card { padding: 24px; }
          .expedition-card-top { flex-direction: column; gap: 6px; }
        }
      `}</style>
    </section>
  )
}

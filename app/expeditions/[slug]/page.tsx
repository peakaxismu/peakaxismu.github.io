import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 0

interface ItineraryDay {
  day_number: string
  title: string
  body: string
  duration_note: string
}

interface PackingCategory {
  category: string
  items: string[]
}

export default async function ExpeditionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: exp } = await supabase
    .from('expeditions')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!exp) notFound()

  const itinerary: ItineraryDay[] = Array.isArray(exp.itinerary) ? exp.itinerary : []
  const included: string[] = Array.isArray(exp.included) ? exp.included : []
  const notIncluded: string[] = Array.isArray(exp.not_included) ? exp.not_included : []
  const packingList: PackingCategory[] = Array.isArray(exp.packing_list) ? exp.packing_list : []

  return (
    <main className="exp-detail">
      <section className="exp-hero">
        <div className="exp-wrap">
          <div className="exp-kicker">EXPEDITION · {exp.destination?.toUpperCase()}</div>
          <h1>{exp.name}</h1>
          <p className="exp-lead">{exp.description}</p>
          <div className="exp-hero-actions">
            <Link href={`/enquire?interest=expedition&ref=${encodeURIComponent(exp.name)}`} className="exp-primary">Plan this expedition</Link>
            <Link href="/expeditions" className="exp-secondary">All expeditions</Link>
          </div>
        </div>
      </section>

      <section className="exp-facts" aria-label="Expedition facts">
        <div className="exp-wrap exp-facts-grid">
          <div><span>LOCATION</span><strong>{exp.destination}</strong></div>
          <div><span>ELEVATION</span><strong>{exp.summit_elevation || 'N/A'}</strong></div>
          <div><span>DURATION</span><strong>{exp.duration_days} days / {Math.max(exp.duration_days - 1, 0)} nights</strong></div>
          <div><span>DIFFICULTY</span><strong>{exp.difficulty}</strong></div>
          <div><span>GROUP</span><strong>{exp.group_size_min}–{exp.group_size_max} people</strong></div>
          <div><span>NEXT DEPARTURE</span><strong>{exp.next_departure || 'On request'}</strong></div>
        </div>
      </section>

      <div className="exp-wrap exp-content">
        <section className="exp-section exp-overview">
          <div className="exp-index">01 · OVERVIEW</div>
          <div>
            <h2>An island that looks like it&apos;s still being made.</h2>
            <p>{exp.description}</p>
          </div>
        </section>

        <section className="exp-section">
          <div className="exp-index">02 · FITNESS &amp; DIFFICULTY</div>
          <div>
            <h2>Know what the mountain asks of you.</h2>
            <div className="difficulty-panel">
              <div className="difficulty-top"><strong>{exp.difficulty}</strong><span>Good fitness required · Volcanic terrain</span></div>
              <p>You don&apos;t need technical climbing skills, but you do need stamina for 6–7 hours of continuous trekking over loose basalt, lava slag, and uneven stairs.</p>
            </div>
          </div>
        </section>

        {itinerary.length > 0 && (
          <section className="exp-section">
            <div className="exp-index">03 · ITINERARY</div>
            <div>
              <h2>Three days on the volcanic landscape.</h2>
              <div className="timeline">
                {itinerary.map((day, idx) => (
                  <article className="timeline-item" key={idx}>
                    <div className="day-label">DAY {day.day_number}</div>
                    <div><h3>{day.title}</h3><p>{day.body}</p><small>{day.duration_note}</small></div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="exp-section">
          <div className="exp-index">04 · INCLUSIONS</div>
          <div className="split-list">
            <div><h2>What&apos;s included.</h2><ul>{included.map((item, idx) => <li key={idx}><b>✓</b>{item}</li>)}</ul></div>
            <div><h2>Not included.</h2><ul>{notIncluded.map((item, idx) => <li key={idx}><b>×</b>{item}</li>)}</ul></div>
          </div>
        </section>

        {packingList.length > 0 && (
          <section className="exp-section">
            <div className="exp-index">05 · PACKING LIST</div>
            <div><h2>What to bring.</h2><div className="packing-grid">{packingList.map((cat, idx) => <div className="packing-card" key={idx}><h3>{cat.category}</h3><ul>{cat.items?.map((item, i) => <li key={i}>{item}</li>)}</ul></div>)}</div></div>
          </section>
        )}

        {exp.safety_notes && (
          <section className="exp-section">
            <div className="exp-index">06 · SAFETY</div>
            <div><h2>Safety on the mountain.</h2><p className="section-copy">{exp.safety_notes}</p></div>
          </section>
        )}

        <section className="exp-final">
          <div><span>07 · READY WHEN YOU ARE</span><h2>Make the mountain<br /><em>the destination.</em></h2><p>From {exp.price_from} per person. Tell us your dates and group size and we&apos;ll take it from there.</p></div>
          <Link href={`/enquire?interest=expedition&ref=${encodeURIComponent(exp.name)}`} className="exp-primary">Enquire about this expedition</Link>
        </section>
      </div>

      <style>{`
        .exp-detail { background: #f5f1e8; color: #211f1d; min-height: 100vh; }
        .exp-wrap { width: min(1180px, calc(100% - 64px)); margin: 0 auto; }
        .exp-hero { padding: 78px 0 74px; border-bottom: 1px solid rgba(33,31,29,.14); }
        .exp-kicker { color: #c1440e; font-size: 12px; font-weight: 800; letter-spacing: .12em; margin-bottom: 18px; }
        .exp-hero h1 { font-family: 'Big Shoulders Display', sans-serif; font-size: clamp(58px, 9vw, 118px); line-height: .84; text-transform: uppercase; max-width: 980px; letter-spacing: -.015em; }
        .exp-lead { max-width: 760px; margin-top: 28px; font-size: 19px; line-height: 1.65; color: #45413b; }
        .exp-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 34px; }
        .exp-primary, .exp-secondary { display: inline-flex; align-items: center; justify-content: center; min-height: 50px; padding: 0 22px; font-weight: 700; font-size: 14px; }
        .exp-primary { background: #c1440e; color: #fffaf2; }
        .exp-primary:hover { background: #a83a0b; transform: translateY(-1px); }
        .exp-secondary { border: 1.5px solid #211f1d; }
        .exp-secondary:hover { background: #211f1d; color: #fffaf2; }
        .exp-facts { background: #211f1d; color: #fffaf2; }
        .exp-facts-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .exp-facts-grid > div { min-height: 112px; padding: 23px 26px; display: flex; flex-direction: column; justify-content: center; border-right: 1px solid rgba(255,250,242,.14); }
        .exp-facts-grid > div:nth-child(3n) { border-right: 0; }
        .exp-facts-grid > div:nth-child(n+4) { border-top: 1px solid rgba(255,250,242,.14); }
        .exp-facts span { font-size: 10px; font-weight: 800; letter-spacing: .1em; color: #aaa49b; }
        .exp-facts strong { margin-top: 8px; font-size: 15px; font-weight: 650; }
        .exp-content { padding-bottom: 90px; }
        .exp-section { display: grid; grid-template-columns: 190px minmax(0, 1fr); gap: 52px; padding: 82px 0; border-bottom: 1px solid rgba(33,31,29,.14); }
        .exp-index { padding-top: 8px; color: #c1440e; font-size: 11px; font-weight: 800; letter-spacing: .1em; }
        .exp-section h2 { font-family: 'Big Shoulders Display', sans-serif; font-size: clamp(40px, 5.7vw, 70px); line-height: .9; text-transform: uppercase; max-width: 850px; }
        .exp-section > div > p, .section-copy { margin-top: 24px; max-width: 760px; color: #45413b; font-size: 17px; line-height: 1.75; }
        .difficulty-panel { margin-top: 30px; max-width: 780px; padding: 28px 30px; background: #fffaf2; border: 1px solid rgba(33,31,29,.14); }
        .difficulty-top { display: flex; gap: 18px; align-items: baseline; flex-wrap: wrap; margin-bottom: 14px; }
        .difficulty-top strong { color: #c1440e; font-size: 15px; }
        .difficulty-top span { color: #68635c; font-size: 13px; }
        .difficulty-panel p { color: #45413b; font-size: 15.5px; line-height: 1.7; }
        .timeline { margin-top: 32px; border-top: 1px solid rgba(33,31,29,.14); }
        .timeline-item { display: grid; grid-template-columns: 120px 1fr; gap: 28px; padding: 30px 0; border-bottom: 1px solid rgba(33,31,29,.1); }
        .day-label { color: #c1440e; font-size: 11px; font-weight: 800; letter-spacing: .1em; padding-top: 5px; }
        .timeline-item h3, .packing-card h3 { font-family: 'Big Shoulders Display', sans-serif; font-size: 29px; text-transform: uppercase; line-height: .95; margin: 0 0 10px; }
        .timeline-item p { color: #45413b; font-size: 15.5px; line-height: 1.65; max-width: 700px; }
        .timeline-item small { display: block; margin-top: 12px; color: #6b665e; font-size: 12px; font-weight: 650; }
        .split-list { display: grid; grid-template-columns: 1fr 1fr; gap: 54px; }
        .split-list h2 { font-size: clamp(34px, 4vw, 48px); }
        .split-list ul, .packing-card ul { list-style: none; padding: 0; margin: 25px 0 0; }
        .split-list li { display: flex; gap: 12px; padding: 11px 0; border-bottom: 1px solid rgba(33,31,29,.1); color: #45413b; font-size: 15px; }
        .split-list li b { color: #c1440e; width: 16px; flex: 0 0 16px; }
        .packing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 30px; }
        .packing-card { padding: 25px; background: #fffaf2; border: 1px solid rgba(33,31,29,.12); }
        .packing-card h3 { font-size: 23px; }
        .packing-card li { padding: 7px 0; border-bottom: 1px solid rgba(33,31,29,.08); color: #514c45; font-size: 13.5px; }
        .exp-final { margin-top: 72px; padding: 58px; background: #1f4b4c; color: #fffaf2; display: flex; justify-content: space-between; align-items: flex-end; gap: 35px; }
        .exp-final span { color: #e8d9b8; font-size: 11px; font-weight: 800; letter-spacing: .1em; }
        .exp-final h2 { margin-top: 15px; font-family: 'Big Shoulders Display', sans-serif; font-size: clamp(46px, 6vw, 76px); line-height: .87; text-transform: uppercase; }
        .exp-final em { color: #e8d9b8; font-style: normal; }
        .exp-final p { margin-top: 20px; color: #d7e4e3; max-width: 480px; font-size: 15px; line-height: 1.65; }
        .exp-final .exp-primary { flex: 0 0 auto; }
        @media (max-width: 900px) {
          .exp-wrap { width: min(100% - 40px, 760px); }
          .exp-hero { padding: 58px 0 54px; }
          .exp-facts-grid { grid-template-columns: 1fr 1fr; }
          .exp-facts-grid > div:nth-child(3n) { border-right: 1px solid rgba(255,250,242,.14); }
          .exp-facts-grid > div:nth-child(2n) { border-right: 0; }
          .exp-facts-grid > div:nth-child(n+3) { border-top: 1px solid rgba(255,250,242,.14); }
          .exp-section { grid-template-columns: 1fr; gap: 14px; padding: 58px 0; }
          .exp-index { padding-top: 0; }
          .packing-grid { grid-template-columns: 1fr 1fr; }
          .exp-final { display: block; padding: 38px 28px; }
          .exp-final .exp-primary { margin-top: 28px; }
        }
        @media (max-width: 560px) {
          .exp-wrap { width: calc(100% - 32px); }
          .exp-hero h1 { font-size: clamp(50px, 17vw, 76px); }
          .exp-lead { font-size: 16px; }
          .exp-primary, .exp-secondary { width: 100%; }
          .exp-facts-grid { grid-template-columns: 1fr; }
          .exp-facts-grid > div, .exp-facts-grid > div:nth-child(2n), .exp-facts-grid > div:nth-child(3n) { border-right: 0; border-top: 1px solid rgba(255,250,242,.14); min-height: 82px; padding: 17px 18px; }
          .exp-facts-grid > div:first-child { border-top: 0; }
          .exp-section { padding: 48px 0; }
          .exp-section h2 { font-size: clamp(40px, 13vw, 58px); }
          .difficulty-panel { padding: 22px; }
          .timeline-item { grid-template-columns: 1fr; gap: 8px; }
          .split-list, .packing-grid { grid-template-columns: 1fr; gap: 34px; }
          .exp-final { margin-top: 48px; padding: 34px 22px; }
          .exp-final h2 { font-size: 47px; }
        }
      `}</style>
    </main>
  )
}

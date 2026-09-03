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

  if (!exp) {
    notFound()
  }

  const itinerary: ItineraryDay[] = Array.isArray(exp.itinerary) ? exp.itinerary : []
  const included: string[] = Array.isArray(exp.included) ? exp.included : []
  const notIncluded: string[] = Array.isArray(exp.not_included) ? exp.not_included : []
  const packingList: PackingCategory[] = Array.isArray(exp.packing_list) ? exp.packing_list : []

  return (
    <div id="view-expedition" className="view active" style={{ display: 'block' }}>
      {/* Page Header */}
      <section className="exp-pagehead">
        <div className="wrap">
          <div className="exp-breadcrumb">EXPEDITIONS · {exp.destination?.toUpperCase()}</div>
          <h1>{exp.name}</h1>
          <p className="subtitle">{exp.description}</p>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="exp-quickbar">
        <div className="wrap">
          <div className="q-grid">
            <div className="q-item">
              <span className="lbl">LOCATION</span>
              <span className="val">{exp.destination}</span>
            </div>
            <div className="q-item">
              <span className="lbl">SUMMIT ELEVATION</span>
              <span className="val">{exp.summit_elevation || 'N/A'}</span>
            </div>
            <div className="q-item">
              <span className="lbl">DURATION</span>
              <span className="val">{exp.duration_days} Days / {exp.duration_days - 1} Nights</span>
            </div>
            <div className="q-item">
              <span className="lbl">DIFFICULTY</span>
              <span className="val">{exp.difficulty}</span>
            </div>
            <div className="q-item">
              <span className="lbl">GROUP SIZE</span>
              <span className="val">{exp.group_size_min}–{exp.group_size_max} people</span>
            </div>
            <div className="q-item">
              <span className="lbl">NEXT DEPARTURE</span>
              <span className="val">{exp.next_departure || 'On request'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="exp-body">
        <div className="wrap">
          {/* Overview */}
          <div className="exp-block">
            <span className="sec-tag">01 · OVERVIEW</span>
            <h2>An island that looks like it&apos;s still being made.</h2>
            <div className="prose">
              <p>{exp.description}</p>
            </div>
          </div>

          {/* Fitness & Difficulty */}
          <div className="exp-block">
            <span className="sec-tag">02 · FITNESS &amp; DIFFICULTY</span>
            <h2>Fitness &amp; Difficulty</h2>
            <div className="diff-card">
              <div className="d-head">
                <span className="d-level">{exp.difficulty}</span>
                <span className="d-note">Good fitness required · Volcanic terrain</span>
              </div>
              <p>
                You don&apos;t need technical climbing skills, but you do need stamina for 6–7 hours of continuous trekking over loose basalt, lava slag, and uneven stairs.
              </p>
            </div>
          </div>

          {/* Itinerary */}
          {itinerary.length > 0 && (
            <div className="exp-block">
              <span className="sec-tag">03 · ITINERARY</span>
              <h2>Itinerary</h2>
              <div className="timeline">
                {itinerary.map((day, idx) => (
                  <div key={idx} className="t-item">
                    <div className="t-num">DAY {day.day_number}</div>
                    <div className="t-content">
                      <h3>{day.title}</h3>
                      <p>{day.body}</p>
                      <div className="t-meta">{day.duration_note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Included / Not Included */}
          <div className="exp-block">
            <span className="sec-tag">04 · INCLUSIONS</span>
            <div className="inc-grid">
              <div className="inc-col">
                <h3>What&apos;s Included</h3>
                <ul>
                  {included.map((item, idx) => (
                    <li key={idx}>✓ {item}</li>
                  ))}
                </ul>
              </div>
              <div className="inc-col not">
                <h3>What&apos;s Not Included</h3>
                <ul>
                  {notIncluded.map((item, idx) => (
                    <li key={idx}>✕ {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Packing List */}
          {packingList.length > 0 && (
            <div className="exp-block">
              <span className="sec-tag">05 · PACKING LIST</span>
              <h2>What To Bring</h2>
              <div className="pack-grid">
                {packingList.map((cat, idx) => (
                  <div key={idx} className="pack-card">
                    <h4>{cat.category}</h4>
                    <ul>
                      {cat.items?.map((item, iIdx) => (
                        <li key={iIdx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety */}
          {exp.safety_notes && (
            <div className="exp-block">
              <span className="sec-tag">06 · SAFETY</span>
              <h2>Safety on the Mountain</h2>
              <p className="prose">{exp.safety_notes}</p>
            </div>
          )}

          {/* Booking Note */}
          <div className="exp-block">
            <span className="sec-tag">07 · BOOKING &amp; PAYMENT</span>
            <h2>How Booking Works</h2>
            <p className="prose">
              All bookings are enquiry-based. Submit your interest using the form below to lock in a spot or request custom dates for your group.
            </p>
          </div>

          {/* Bottom CTA */}
          <div className="exp-cta-box">
            <h2>Ready to stand<br />on the <span className="em">rim</span>?</h2>
            <div className="c-price">From {exp.price_from} per person</div>
            <Link
              href={`/enquire?interest=expedition&ref=${encodeURIComponent(exp.name)}`}
              className="btn-primary"
            >
              Enquire about this expedition
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
